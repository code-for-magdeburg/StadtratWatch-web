
### Generate data assets

#### Build the docker image
```shell
docker build -t srw-generate-data-assets -f docker\generate-data-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data\election-period-7:/app/election-period:ro -v %cd%\src\assets\election-period-7:/app/generated -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro srw-generate-data-assets
```


### Generate routes file

#### Build the docker image
```shell
docker build -t srw-generate-routes-file -f docker\generate-routes-file.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data:/app/data:ro -v %cd%:/app/generated srw-generate-routes-file
```


### Download paper files

#### Build the docker image
```shell
docker build -t srw-download-paper-files -f docker\download-paper-files.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\output\papers:/app/output/papers -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro srw-download-paper-files 2024
```


### Web App

#### Build the docker image
```shell
docker build -t srw-stadtratwatch-web -f docker\stadtrat-watch-web.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -p 8080:80 srw-stadtratwatch-web
```
