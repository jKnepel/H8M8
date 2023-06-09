# H8M8

Student project for Systemsdevelopment @ HTW. Was developed in a Team of 10 students.

# Setup and Run Backend using docker compose

## Development deployment

- create a ``.env`` file in the ``docker_compose`` folder. (See the template file `.env.template`)
- add the django secret key and the discord token to docker_compose/.env
- run `docker compose -f docker_compose/docker-compose.yml -f docker_compose/docker-compose-dev.yml up --build -d` from repository root directory
- create superuser using `docker exec -it hatemate_backend /bin/bash -c "export DJANGO_SUPERUSER_PASSWORD=admin && python manage.py createsuperuser --noinput --username admin --email test@test.org"`

Note: to see log messages remove the -d from the last command.

### Local Database Connection
For a local database you have to set the variables in `docker-compose/.env` to the connection information for your local database. A standard config could look like this:

DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=<<password>>
DATABASE_HOST=postgres
DATABASE_PORT=5432

With a database tool like DBeaver (https://dbeaver.io/) you can access this database. The database will be exposed on localhost, so you can access it with the following info:

host: localhost
port: 5432
database: postgres
username: postgres
password: <<password>>

### Remote Database Connection
To connect the application to the remote database replace the variables in `docker-compose/.env` with the information for the remote database. You can access the remote database via DBeaver as well.

## Production deployment

- create `prod.env` file in /docker_compose (look at `dprod.env.template`)
- `cd Backend`
- `docker-compose -f docker-compose.yml -f docker-compose-prod-override.yml --env-file prod.env up --build -d`

## Get the latest results of the backend integration test

https://gitlab.rz.htw-berlin.de/peikert/systemsdevelopmentws22-ai-moderation/-/jobs/artifacts/develop/raw/robot_results/log.html?job=backend-healthcheck
