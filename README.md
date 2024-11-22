
### Generate data assets

#### Build the docker image
```shell
docker build -t srw-generate-data-assets -f docker\generate-data-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data\electoral-period-8:/app/input-dir:ro -v %cd%\src\assets\electoral-periods\magdeburg-8:/app/output-dir -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro srw-generate-data-assets
```


### Generate paper assets

#### Build the docker image
```shell
docker build -t srw-generate-paper-assets -f docker\generate-paper-assets.Dockerfile .
```

#### Run the docker container
```shell
docker run --rm -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro -v %cd%\output\papers:/app/papers:ro -v %cd%\src\assets\papers:/app/generated srw-generate-paper-assets
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
docker run --rm -v %cd%\output\papers:/app/papers -v %cd%\data\Magdeburg.json:/app/Magdeburg.json:ro srw-download-paper-files 2024
```


### Extract text from paper files

#### Build the tika tool docker image 
```shell
docker build -t srw-tika -f docker\tika-batch-extract.Dockerfile .
```

#### Run the docker container
When running the container, the input and output folders have to be provided as volume mounts. The input folder should contain the pdf files to be processed. The output folder will contain the extracted text files.
```shell 
docker run --rm -v %cd%\output\papers\2023:/input -v %cd%\output\papers\2023-extracted:/output srw-tika
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
