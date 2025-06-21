FROM denoland/deno:2.3.3

ARG SKIA_CANVAS_VERSION=0.5.8

RUN apt update && apt upgrade -y && \
    apt install -y wget cabextract xfonts-utils fontconfig && \
    wget https://github.com/DjDeveloperr/skia_canvas/releases/download/${SKIA_CANVAS_VERSION}/libnative_canvas.so

WORKDIR /app

COPY deno.json /app
COPY deno.lock /app
COPY src /app/src

RUN deno install --entrypoint src/scripts/scan-voting-images/index.ts --unstable-sloppy-imports

RUN deno cache src/scripts/scan-voting-images/index.ts --unstable-sloppy-imports

ENV DENO_SKIA_PATH=/libnative_canvas.so

ENTRYPOINT ["deno", "run", \
              "-E=DENO_SKIA_LOCAL,DENO_SKIA_PATH,CANVAS_DISABLE_SYSTEM_FONTS,NODE_EXTRA_CA_CERTS", \
              "--allow-ffi", \
              "-R=/app,/app/session-config.json,/app/voting-images", \
              "-R=/deno-dir/npm/registry.npmjs.org/tesseract.js-core/5.1.1/tesseract-core-simd.wasm", \
              "-W=/app/output", \
              "--allow-net", \
              "src/scripts/scan-voting-images/index.ts", \
              "-c=/app/session-config.json", \
              "-i=/app/voting-images", \
              "-o=/app/output", \
              "-s"]
