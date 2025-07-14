FROM denoland/deno:2.3.3

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/index-search/index.ts

RUN deno cache src/scripts/index-search/index.ts

CMD ["run", \
        "-R=/app/Magdeburg.json,/app/papers-content", \
        "-E=TYPESENSE_SERVER_URL,TYPESENSE_COLLECTION_NAME,TYPESENSE_API_KEY", \
        "--allow-net", \
        "src/scripts/index-search/index.ts", \
        "-c=./papers-content", \
        "-p=./parliament-periods", \
        "-s=./Magdeburg.json"]
