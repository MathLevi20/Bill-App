# API de Extração de Dados de Faturas de Energia

Este projeto é uma API em NestJS que permite extrair dados relevantes de faturas de energia elétrica, armazená-los em um banco de dados PostgreSQL e disponibilizá-los através de uma API REST.

## Tecnologias Utilizadas

- NestJS
- TypeORM
- Prisma
- PostgreSQL
- Docker Compose
- PDF-Parse para extração de dados de PDFs
- Swagger para documentação da API

## Estrutura do Projeto

O projeto é organizado nos seguintes módulos:

- **Clients**: Gerenciamento de clientes
- **Bills**: Gerenciamento de faturas
- **Prisma**: Serviço para interação com o banco de dados via Prisma
- **Services**:
  - **PDF Parser**: Serviço para extração de dados de PDFs
  - **API Docs**: Serviço para documentação e download do arquivo swagger.json

## Instalação e Execução

### Pré-requisitos

- Node.js (v14+)
- Docker e Docker Compose

### Execução com Docker

A maneira mais simples de executar a aplicação é usando o Docker Compose:

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/energy-bills-api.git
cd energy-bills-api
```

2. Inicie os serviços com Docker:
```bash
npm run docker:build  # Constrói as imagens
npm run docker:up     # Inicia os contêineres
```

3. Execute as migrações:
```bash
npm run docker:migrate
```

A API estará disponível em http://localhost:3000.

Outros comandos úteis:
```bash
npm run docker:logs    # Exibe logs dos contêineres
npm run docker:restart # Reinicia os contêineres
npm run docker:down    # Para os contêineres
```

### Execução Local (sem Docker)

### Passos para execução

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/energy-bills-api.git
cd energy-bills-api
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o banco de dados PostgreSQL com Docker:
```bash
docker-compose up -d
```

4. Configure o arquivo .env:
```
DATABASE_URL="postgresql://admin:admin@localhost:5432/energy_bills?schema=public"
FATURAS_FOLDER_PATH="/caminho/para/pasta/faturas"
```

5. Execute as migrações do Prisma:
```bash
npx prisma migrate dev --name init
```

6. Inicie a aplicação:
```bash
npm run start:dev
```

A API estará disponível em http://localhost:4000
A documentação Swagger estará disponível em http://localhost:4000/api

## Processamento automático de faturas

Você pode colocar arquivos PDF de faturas na pasta "faturas" configurada no arquivo .env para processamento automático. Para processar todos os arquivos manualmente:

1. Via API: faça uma requisição POST para `/bills/folder/process`
2. Via linha de comando:
```bash
npm run process-bills
```

## Endpoints da API

### Clientes

- `GET /clients` - Obter todos os clientes
- `GET /clients/:id` - Obter um cliente específico pelo ID
- `GET /clients/number/:clientNumber` - Obter um cliente pelo número de cliente
- `POST /clients` - Criar um novo cliente

### Faturas

- `GET /bills` - Obter todas as faturas
- `GET /bills/:id` - Obter uma fatura específica pelo ID
- `GET /bills/client/:clientId` - Obter todas as faturas de um cliente
- `POST /bills` - Criar uma nova fatura manualmente
- `POST /bills/upload` - Enviar um PDF para extrair dados e criar uma fatura
- `GET /bills/folder/list` - Listar todos os PDFs na pasta de faturas
- `POST /bills/folder/process` - Processar todos os PDFs na pasta de faturas

## Estrutura de Pastas de Faturas

A aplicação espera que as faturas estejam organizadas em uma estrutura de pastas específica:

## Autenticação

A API não implementa autenticação nesta versão. Para ambientes de produção, recomenda-se implementar um sistema de autenticação JWT.

## Funcionamento

1. **Extração de Dados**:
   - Envie um PDF de fatura para o endpoint `/bills/upload`
   - Ou coloque PDFs na pasta "faturas" e acione o processamento
   - A API extrai dados como número do cliente, mês de referência, consumo de energia, etc.
   - Calcula valores derivados como consumo total e economia GD

2. **Armazenamento**:
   - Os dados são armazenados no PostgreSQL usando TypeORM
   - As entidades clientes e faturas estão relacionadas (1:N)

3. **Consulta**:
   - Use os endpoints da API para consultar os dados armazenados
   - Filtre faturas por cliente, data, etc.

## Testes

```bash
# Executar todos os testes
npm run test

# Executar testes com cobertura
npm run test:cov
```

## Resolução de problemas

### Erro de incompatibilidade do PostgreSQL

Se você encontrar o erro:
```
FATAL: database files are incompatible with server
DETAIL: The data directory was initialized by PostgreSQL version X, which is not compatible with this version Y
```

Isso indica que o volume persistente contém dados de uma versão diferente do PostgreSQL. Para resolver:

1. Pare os contêineres:
```bash
docker-compose down
```

2. Remova o volume existente (isso apagará os dados atuais do banco):
```bash
docker volume rm lumi-energy-bills-postgres-data
```

3. Reconstrua e inicie os contêineres:
```bash
docker-compose up --build -d
```

4. Execute as migrações:
```bash
npm run docker:migrate
```

### Erro com o Prisma no Docker Alpine

Se você encontrar um erro relacionado às bibliotecas do Prisma como:
```
Error: Unable to require(`/app/node_modules/.prisma/client/libquery_engine-linux-musl.so.node`)
```

Isso pode ser causado por uma incompatibilidade entre o Prisma e a imagem Docker Alpine. Para resolver:

1. Adicione a seguinte linha ao seu Dockerfile:
```
RUN apk add --no-cache libc6-compat
```

2. Rebuild the Docker image:
```bash
docker-compose build
```

3. Restart the containers:
```bash
docker-compose up -d
```
