FROM node:18-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY ../tsconfig.json .
COPY ../tsconfig.scripts.json .
COPY ../src/app/model /app/src/app/model
COPY ../src/scripts/shared /app/src/scripts/shared
COPY ../src/scripts/generate-data-assets /app/src/scripts/generate-data-assets

CMD ["npm", "run", "generate-data-assets", "./electoral-period", "./generated", "./Magdeburg.json"]
