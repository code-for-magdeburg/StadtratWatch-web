FROM denoland/deno:2.1.0

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/download-paper-files/index.ts

RUN deno cache src/scripts/download-paper-files/index.ts

ENTRYPOINT ["deno", "run", \
        "-R=/app/Magdeburg.json,/app/output-dir", \
        "-W=/app/output-dir", \
        "--allow-net", \
        "src/scripts/download-paper-files/index.ts", \
        "-s=./Magdeburg.json", \
        "-o=./output-dir", \
        "-y"]
CMD ["2024"]
