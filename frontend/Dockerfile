FROM node:19 as build

# set working directory
WORKDIR /usr/app
COPY  webapp /usr/app
ENV BACKEND_URL="http://sdf1.f4.htw-berlin.de:8000"
RUN apt-get update || : && apt-get install python -y
RUN npm clean-install
RUN npm run build

FROM nginx:1.23.1-alpine
EXPOSE 80
COPY --from=build /usr/app/dist /usr/share/nginx/html
COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf