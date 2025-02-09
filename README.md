# bhut
Prova backend Node.js - BHUT

Usando Node.JS (TypeScript), crie uma aplicação (API REST) que contenha 3 endpoints e 1 consumer, consumindo 2 endpoints de uma API REST externa: `http://api-test.bhut.com.br:3000/api`.

## Endpoints
- `GET /api/cars`: Retorna uma lista de carros da API externa.
- `POST /api/cars`: Adiciona um carro na API externa e envia uma mensagem na fila AMQP.
- `GET /api/logs`: Retorna os logs da aplicação (consumo de mensagens e chamadas do webhook) armazenados no MongoDB.

## Stack
- Node.JS
- TypeScript
- Redis
- RabbitMQ
- MongoDB

## Build
```shell
npm ci
npm run build
```

## Execução
```shell
npm start
```

## Docker
```shell
docker compose up
```
