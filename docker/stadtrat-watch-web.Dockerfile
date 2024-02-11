FROM node:18-alpine as build

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build -c production

FROM nginx:latest

COPY --from=build /app/dist/stadtrat-watch-web /usr/share/nginx/html

EXPOSE 80
