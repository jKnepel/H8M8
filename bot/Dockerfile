FROM python:3.10.9-bullseye
ENV PYTHONUNBUFFERED=1
COPY requirements.txt ./
COPY bot.py ./
RUN pip install -r requirements.txt
CMD ["python", "bot.py"]