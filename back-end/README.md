# API de Extração de Dados de Faturas de Energia

Este projeto é uma API em NestJS que permite extrair dados relevantes de faturas de energia elétrica, armazená-los em um banco de dados PostgreSQL e disponibilizá-los através de uma API REST.

## Aplicação Implantada

A API está disponível online em: [https://lumi-energy-bills-app.onrender.com](https://lumi-energy-bills-app.onrender.com)

Documentação Swagger: [https://lumi-energy-bills-app.onrender.com/api](https://lumi-energy-bills-app.onrender.com/api)

## Tecnologias Utilizadas

- NestJS
- TypeORM
- Prisma
- PostgreSQL
- Docker Compose
- PDF-Parse para extração de dados de PDFs
- Swagger para documentação da API
- Jest para testes unitários e de integração

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
docker-compose up -d
```

A API estará disponível em http://localhost:4000.
A documentação Swagger estará disponível em http://localhost:4000/api

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
docker-compose up -d postgres
```

4. Configure o arquivo .env:
```
DATABASE_URL="postgresql://admin:admin@localhost:5432/energy_bills?schema=public"
DATABASE_URL_LOCAL="postgresql://admin:admin@localhost:5432/energy_bills?schema=public"
FATURAS_FOLDER_PATH="/caminho/para/pasta/faturas"
```

5. Execute as migrações do Prisma:
```bash
npm run prisma:migrate
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

- `GET /bills` - Obter todas as faturas (aceita parâmetros de filtro por data)
- `GET /bills/date-range` - Obter faturas dentro de um intervalo de datas
- `GET /bills/:id` - Obter uma fatura específica pelo ID
- `GET /bills/client/:clientId` - Obter todas as faturas de um cliente
- `POST /bills` - Criar uma nova fatura manualmente
- `POST /bills/upload` - Enviar um PDF para extrair dados e criar uma fatura
- `GET /bills/folder/list` - Listar todos os PDFs na pasta de faturas
- `POST /bills/folder/process` - Processar todos os PDFs na pasta de faturas

## Testes

O projeto inclui testes unitários, testes de integração e testes end-to-end. Use os seguintes comandos para execut
