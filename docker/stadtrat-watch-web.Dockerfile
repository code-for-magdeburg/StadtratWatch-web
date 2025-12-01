FROM node:18-bookworm AS build

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN npm run build -c production

FROM nginx:1.29

COPY --from=build /app/dist/StadtratWatch-web /usr/share/nginx/html

EXPOSE 80
