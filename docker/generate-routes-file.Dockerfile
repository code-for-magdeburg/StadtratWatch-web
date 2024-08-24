FROM node:18-bookworm

WORKDIR /app

COPY package.json /app

RUN npm install

COPY ../tsconfig.json .
COPY ../tsconfig.scripts.json .
COPY ../src/app/model /app/src/app/model
COPY ../src/scripts/shared /app/src/scripts/shared
COPY ../src/scripts/generate-routes-file /app/src/scripts/generate-routes-file

CMD ["npm", "run", "generate-routes-file", "./data", "./generated"]
