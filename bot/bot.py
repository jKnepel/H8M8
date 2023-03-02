import os
import threading
from datetime import datetime
import asyncio
import requests

import discord
from quart import Quart
from quart import request

app = Quart(__name__)

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
H8M8_BACKEND_URL = os.getenv('H8M8_BACKEND_URL')
AUTH_URL = f"{H8M8_BACKEND_URL}/auth/token/"
CLASSIFY_URL = f"{H8M8_BACKEND_URL}/bot/classify/"
REPORT_URL = f"{H8M8_BACKEND_URL}/bot/comment/report/"
SESSION_URL = f"{H8M8_BACKEND_URL}/bot/session/"

guild_ids = []
server_id = {}
session_id = {}
session_alive_interval = {}


def get_auth_token():
    data = {"username": "admin", "password": "admin"}
    response = requests.post(AUTH_URL, json=data)
    return f"Bearer {response.json()['access']}"


def create_new_session():
    for guild in client.guilds:
        guild_ids.append(guild.id)
        data = {
            "source_app_server_id": f"{guild.id}",
            "source_app_name": "Discord",
            "server_name": f"{guild.name}"
        }
        headers = {"Content-Type": "application/json;charset=utf-8",
                   "Authorization": get_auth_token()}
        response = requests.put(SESSION_URL, json=data, headers=headers, timeout=5)
        response_object = response.json()
        server_id[guild.id] = response_object["serverId"]
        session_id[guild.id] = response_object["sessionId"]
        session_alive_interval[guild.id] = response_object["aliveInterval"]
        create_session_alive_timer(guild.id)


def refresh_session(guild_id):
    refresh_session_id = session_id[guild_id]
    data = {
        "id": f"{refresh_session_id}"
    }
    headers = {"Content-Type": "application/json;charset=utf-8",
               "Authorization": get_auth_token()}
    response = requests.post(f"{SESSION_URL}refresh/", json=data, headers=headers, timeout=5)
    if response.status_code != 200:
        print(f"ERROR: Invalid session refresh response: {response.text}")
        raise Exception("Illegal Response for session refresh")
    create_session_alive_timer(guild_id)


def create_session_alive_timer(guild_id):
    threading.Timer(session_alive_interval[guild_id] / 2.0, refresh_session, [guild_id]).start()


intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)


@app.before_serving
async def before_serving():
    loop = asyncio.get_event_loop()
    await client.login(DISCORD_TOKEN)
    loop.create_task(client.connect())


@app.route("/delete", methods=['POST'])
async def receive_result():
    data = await request.get_json()
    if await delete_message(data):
        return "", requests.codes.ok
    else:
        return "", requests.codes.not_found


@client.event
async def on_ready():
    print(f'Successfully started {client.user.name} Bot...')
    create_new_session()


@client.event
async def on_message(message):
    if message.content.lower() == "report":
        message = await message.channel.fetch_message(message.reference.message_id)
        if message.author.bot:
            await message.channel.send("Unable to report this comment!")
            return 
        headers = {"Content-Type": "application/json;charset=utf-8",
                "Authorization": get_auth_token()}
        data = {"source_app_name": "Discord", "source_app_comment_id": message.id}
        await message.channel.send(f"The comment '{message.content}' will be forwarded and manually reviewed.")
        requests.post(REPORT_URL, json=data, headers=headers, timeout=5)
        return
    if not message.author.bot:
        data = {"chatUser": {"chatUserName": message.author.name}, "chatGroup": {"chatGroupName": message.channel.name},
                "commentText": message.content, "timestamp": message.created_at.strftime("%Y-%m-%d-%H:%M"),
                "sourceAppCommentId": message.id, "server": {"id": server_id[message.guild.id]}}
        headers = {"Content-Type": "application/json;charset=utf-8",
                   "Authorization": get_auth_token()}
        response = requests.post(CLASSIFY_URL, json=data, headers=headers, timeout=5)
        if response.status_code != 201:
            print(f"Error while classifying: {response.text}")


async def delete_message(data):
    data = int(data['comment_id'])
    channels = [guild.text_channels for guild in client.guilds][0]
    for channel in channels:
        try:
            discord_message = await channel.fetch_message(data)
            await discord_message.channel.send(f"Your comment '{discord_message.content}' was categorized as a type of "
                                               f"hate speech and is being deleted!")
            await discord_message.delete()
            return True
        except Exception as e:
            print(e)
    return False


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
