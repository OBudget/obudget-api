# obudget-api

API for free and open source budgeting

## Deployment

### Docker

```
docker build -t obudget/api -f docker/Dockerfile .

docker run -p 8080:8080 obudget/api
```

## Development

### Docker

```
docker build -t obudget/api-dev -f docker/Dockerfile-dev .

docker run -p 8080:8080 obudget/api-dev
```
