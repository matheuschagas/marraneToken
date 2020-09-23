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
Cria de um terminal de token e retorna uma chave do terminal (`terminalToken`) que deve ser encaminhado ao client

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
|type|Os tipos são: WEB, MOBILE|:white_check_mark:|:white_check_mark:
|UUID|Chave única do device|:white_check_mark:|:white_check_mark:
|deviceID|MOBILE usa deviceID e WEB usa user-agent|:white_check_mark:|:white_check_mark:
#### `POST /device/link`
Vincula um device a um terminal e retorna uma chave do device (`deviceToken`) que deve ser encaminhado ao client

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
|type|Os tipos são: WEB, MOBILE|:white_check_mark:|:white_check_mark:
|UUID|Chave única do device|:white_check_mark:|:white_check_mark:
|deviceID|MOBILE usa deviceID e WEB usa user-agent|:white_check_mark:|:white_check_mark:
|document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:
#### TODO `POST /device/unlink`
Desvincula um device de um terminal

#### `POST /transaction`
Cria uma nova Transação e retorna um `transactionId`

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
type|Tipo da transação| |:white_check_mark:
partner|Código do parceiro| | :white_check_mark:
identifier|Identificador da transação| | :white_check_mark:
notificationURL|URL de callback| | |
lifetime|Tempo de vida da transação| |:white_check_mark:|
document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:
attempts|Numero máximo de tentativas de token| | :white_check_mark: |

#### `DELETE /transaction/:transactionId`
Cancela uma transação

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:

#### `GET /transaction/:transactionId`
Retorna o estado de uma transação, os parametros são passados no HEADER

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:


#### `POST /transaction/:transactionId/authorize`
Autoriza uma transação

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
|deviceInfo|são dados usados para criação do terminal|:white_check_mark:|:white_check_mark:
|deviceKey|Chave criada no vínculo do device|:white_check_mark:|:white_check_mark:
|otp|OTP criado no device|:white_check_mark:|:white_check_mark:
|document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:

#### `POST /transaction/:transactionId/deny`
Recusa uma transação

| Parametros | Descrição | Informação do Client | Obrigatório |
|---|---|---|---|
|deviceInfo|são dados usados para criação do terminal|:white_check_mark:|:white_check_mark:
|deviceKey|Chave criada no vínculo do device|:white_check_mark:|:white_check_mark:
|otp|OTP criado no device|:white_check_mark:|:white_check_mark:
|document|Documento do usuário (CPF), o client enviará o JWT na requisição| |:white_check_mark:

