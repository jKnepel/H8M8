FROM python:3
ENV PYTHONUNBUFFERED=1
COPY requirements.txt ./
RUN pip install -r requirements.txt
ADD . .
WORKDIR ./HateMate_Backend
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]