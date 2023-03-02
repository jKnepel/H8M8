FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 3000

COPY ./src ./

CMD [ "python", "flask_app.py" ]