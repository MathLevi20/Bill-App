# Lumi Energy Bills App

## Requisitos
- Docker
- Docker Compose
- Node.js 18+

## 📋 Visão Geral
Aplicação web para extração, persistência e visualização de dados de faturas de energia elétrica.

## 🔗 Links Importantes
- [GitHub Repository](https://github.com/MathLevi20/Bill-App)
- [Frontend (Vercel)](https://lumi-energy-bills.vercel.app)
- [Backend (Render)](https://lumi-energy-bills-app.onrender.com)
- [API Documentation](https://lumi-energy-bills-app.onrender.com/api)


## Executando com Docker Compose (Recomendado)

O método mais simples para executar toda a aplicação:

```bash
# Construir e iniciar todos os serviços
docker-compose up -d --build

# Parar todos os serviços
docker-compose down
```

## Guias Individuais

Cada pasta do projeto contém um guia detalhado sobre como iniciar as aplicações individualmente:
- `/front-end/README.md` - Instruções para iniciar o frontend React
- `/back-end/README.md` - Instruções para iniciar o backend NestJS

**Nota:** Tanto o frontend quanto o backend estão configurados para utilizar o Supabase Postgres como banco de dados. As credenciais de conexão já estão configuradas nos arquivos de ambiente.

## Executando Containers Individualmente

### Backend
```bash
# Construir a imagem
docker build -t lumi-backend ./back-end

# Executar o container
docker run -d \
  --name lumi_energy-bills-backend \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=your_database_url \
  lumi-backend
```

### Frontend
```bash
# Construir a imagem
docker build -t lumi-frontend ./front-end

# Executar o container
docker run -d \
  --name lumi_energy-bills-frontend \
  -p 3001:3001 \
  -e REACT_APP_API_URL=https://lumi-energy-bills-app.onrender.com \
  lumi-frontend
```

### Database
```bash
# Executar o container do PostgreSQL
docker run -d \
  --name lumi_energy-bills-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=energy_bills \
  postgres:14
```

## Portas
- Frontend: http://localhost:3001
- Backend: http://localhost:4001/api

## Banco de Dados
O projeto utiliza o Supabase Postgres como serviço de banco de dados. Todas as configurações de conexão estão disponíveis nos arquivos de ambiente de cada aplicação.

## Comandos Úteis
```bash
# Visualizar logs
docker logs lumi_energy-bills-frontend
docker logs lumi_energy-bills-backend
docker logs lumi_energy-bills-postgres

# Parar containers
docker stop lumi_energy-bills-frontend
docker stop lumi_energy-bills-backend
docker stop lumi_energy-bills-postgres

# Remover containers
docker rm lumi_energy-bills-frontend
docker rm lumi_energy-bills-backend
docker rm lumi_energy-bills-postgres
```
