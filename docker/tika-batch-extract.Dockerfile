FROM openjdk:24-slim-bullseye

RUN apt-get update && apt-get install wget -y

RUN wget https://archive.apache.org/dist/tika/3.0.0-BETA2/tika-app-3.0.0-BETA2.jar -O /tika-app.jar

RUN mkdir /output

CMD ["java", "-jar", "tika-app.jar", "-t", "-i", "/input", "-o", "/output"]
