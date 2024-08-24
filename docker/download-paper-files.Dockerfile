FROM node:18-bookworm

WORKDIR /app

COPY package.json /app

RUN npm install

COPY ../tsconfig.json .
COPY ../tsconfig.scripts.json .
COPY ../src/scripts/shared /app/src/scripts/shared
COPY ../src/scripts/download-paper-files /app/src/scripts/download-paper-files

ENTRYPOINT ["npm", "run", "download-paper-files", "./Magdeburg.json", "./output/papers"]
