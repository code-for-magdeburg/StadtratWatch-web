FROM oven/bun:1.4.2
ARG MS_CORE_FONTS_VERSION=3.8
ARG WITH_MS_FONTS=1
RUN apt-get update && apt-get install -y wget cabextract xfonts-utils fontconfig && \
    if [ "$WITH_MS_FONTS" = "1" ]; then \
      wget -q http://ftp.br.debian.org/debian/pool/contrib/m/msttcorefonts/ttf-mscorefonts-installer_${MS_CORE_FONTS_VERSION}_all.deb && \
      dpkg -i ttf-mscorefonts-installer_${MS_CORE_FONTS_VERSION}_all.deb && fc-cache -f; fi
WORKDIR /app/spikes/canvas-parity
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY candidates candidates
COPY *.ts tsconfig.json votings.json ./
