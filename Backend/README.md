# H8M8-Backend

# Setup and Run Backend using docker compose

Notice: This section describes how to run the Backend independently. It's simpler to run all components of H8M8 at once from
the docker compose file in the /docker-compose folder. See the README on base level for more information.

## development deployment

- create `django-variables.env` file (look at `django-variables.env.template`)
- make sure that you are in the folder `Backend`
- `docker-compose build`
- `docker-compose up -d`

Note: to see log messages remove the -d from the last command.

After running `docker-compose up` go into the terminal of the backend pod and run `python manage.py migrate` to apply all available migrations. (This has to be done
at least once.)

### Local Database Connection

For a local database you have to set the variables in `django-variables.env` to the connection information for your
local database. A standard config could look like this:

DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=<<password>>
DATABASE_HOST=postgres
DATABASE_PORT=5432

With a database tool like DBeaver (https://dbeaver.io/) you can access this database. The database will be exposed on
localhost so you can access it with the following info:

host: localhost
port: 5432
database: postgres
username: postgres
password: <<password>>

### Remote Database Connection

To connect the application to the remote database replace the database variables in `django-variables.env` with the information
for the remote database. You can access the remote database via DBeaver as well.

## production deployment

- Make sure that you are in the `Backend` folder
- create `prod.env` file (look at `dprod.env.template`)
- `docker-compose -f docker-compose.yml -f docker-compose-prod-override.yml --env-file prod.env build`
- `docker-compose -f docker-compose.yml -f docker-compose-prod-override.yml --env-file prod.env up -d`

# Setup and Run Backend without Docker

Make sure your Python version is up to date. We are using Python 3.11.

## Create a python virtual environment

Navigate to the folder "Backend". The command `python -m venv .` will create a virtual environment in the current folder
with the name of the current folder.

## Activate the virtual environment

You can find the scripts to activate the environment in the newly created "Scripts" folder. (The files and folders
created by the venv should not be commited or pushed. Make sure to adapt the .gitignore if necessary.)
Depending on your operating system and shell you need to use a different script to activate your environment.

### For Windows

Either activate.bat in the cmd or Activate.ps1 when using powershell.

### On Linux/Mac

Use the activate script.

## Install Dependencies

`pip install -r .\requirements.txt` installs all required dependencies.

### psycopg2 Problems in Windows
If you are using windows, you might have problems installing psycopg2. In that case, you can do the following:

1. install pipwin

`pip install pipwin`

2. using pipwin, install psycopg2

`pipwin install psycopg2`

3. uninstall pipwin

`pip uninstall pipwin`

### Setting up a Local Test Database

We are using Postgres as database. Set a local instance of a Postgres DB if you want to test locally. We recommend using the official postgres docker-image

If your db is running you will have to run the migrate command to create the tables in your local database.

`python manage.py migrate`

Django docs for reference: https://docs.djangoproject.com/en/4.1/intro/tutorial02/#activating-models

## Create .env file
create a `.env` file in the Backend folder with the needed variables (look at `django-variables.env.template` for the needed variables)

## Run the Django Server

Navigate to the folder >Backend>HateMate_Backend and run `python manage.py runserver`.
Your terminal will show an url that you can open to see if it is running.

# Modify the Database

If you want to modify the database, you have to change the models in /Backend/HateMate_Backend/HateMate_Backend_app/models.py.
These models are used to create the tables in the database. After updating the models.py
run `python manage.py makemigrations` to create the migration files. Then run `python manage.py migrate` to
write the changes to the database.

# Rest Interface

## Endpoint Documentation

The Backend supplies a OpenAPI(formally Swagger) Documentation under the endpoint `/swagger/`

On this OpenAPI page all Endpoints are described, including the Authentication Endpoints. You can try all endpoints
directly from the UI.
Some endpoints need a token for authentication. If you want to try a secured endpoint, generate a token on the OpenApi
UI and add it to the request by clicking the lock icon behind the desired endpoint.
Please note that you need to add the keyword `Bearer` to the token. Therefor a valid input in the OpenAPI UI would look
like this `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey....`

# Setup Allowed Origins (CORS)
It's possible to set the allowed origins via the `ALLOWED_ORIGINS` environment variable.
If the env var is not set the backend will allow `http://localhost` as default.
It's also possible to pass multiple origins in via the environment variable by separating the origins with a comma.
A valid ALLOWED_ORIGINS env var could look like this:

```ALLOWED_ORIGINS=http://domain.com:8081,https://secure.domain.com```
