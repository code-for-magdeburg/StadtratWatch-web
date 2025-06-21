FROM denoland/deno:2.3.3

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/speech-to-text/index.ts

RUN deno cache src/scripts/speech-to-text/index.ts

ENTRYPOINT ["deno", "run", \
              "-R=/app/speeches,/app/output", \
              "-W=/app/output", \
              "-E=OPENAI_ORGANIZATION_ID,OPENAI_PROJECT_ID,OPENAI_API_KEY", \
              "--allow-net", \
              "src/scripts/speech-to-text/index.ts", \
              "-i=/app/speeches", \
              "-o=/app/output", \
              "--skip-existing", \
              "-s"]
