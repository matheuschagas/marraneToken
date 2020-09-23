# Token
Serviço de token para o banco topázio feito em Node as seguintes bibliotecas:
* Express JS
* Socket.io
* RabbitMQ

## Integração
Construa um Microsserviço que se comunique com a API de token, pois o serviço de token não deverá ser exposto.

Rotas disponíveis

| Rota | Método | Descrição |
|---|---|---|
|/terminal|POST|Cria de um terminal de token|
|/device/link|POST|Vincula um device a um terminal|
|/device/unlink|POST|Desvincula um device de um terminal|
|/transaction|POST|Cria uma nova Transação|
|/transaction/:transactionId|DELETE|Cancela uma transação|
|/transaction/:transactionId|GET|Retorna o estado de uma transação|
|/transaction/:transactionId/authorize|POST|Autoriza uma transação|
|/transaction/:transactionId/deny|POST|Recusa uma transação|


#### `POST /terminal`
Cria de um terminal de token

| Parametros | Descrição | Informação do Client |
|---|---|---|
|type|Os tipos são: WEB, MOBILE|:white_check_mark:|
|UUID|Chave única do device|:white_check_mark:|
|deviceID|MOBILE usa deviceID e WEB usa user-agent|:white_check_mark:|
#### `POST /device/link`
Vincula um device a um terminal
#### `POST /device/unlink`
Desvincula um device de um terminal
#### `POST /transaction`
Cria uma nova Transação
#### `DELETE /transaction/:transactionId`
Cancela uma transação
#### `GET /transaction/:transactionId`
Retorna o estado de uma transação
#### `POST /transaction/:transactionId/authorize`
Autoriza uma transação
#### `POST /transaction/:transactionId/deny`
Recusa uma transação

