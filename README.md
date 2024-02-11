
### Generate data assets

#### Build the docker image
```shell
docker build -t srw-generate-data-assets -f docker\generate-data-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data\sessions:/app/data/sessions:ro -v %cd%\src\assets\generated:/app/data/generated-assets srw-generate-data-assets
```


### Download paper files

#### Build the docker image
```shell
docker build -t srw-download-paper-files -f docker\download-paper-files.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data\sessions:/app/data/sessions:ro -v %cd%\output\papers:/app/output/papers srw-download-paper-files 2024
```
