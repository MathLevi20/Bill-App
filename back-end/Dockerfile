# Usar Debian (mais compatível com o Prisma) em vez de Alpine
FROM node:18-slim

# Configurar diretório de trabalho
WORKDIR /app

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y openssl

# Copiar arquivos de configuração
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN yarn install

# Gerar Prisma Client explicitamente
RUN npx prisma generate

# Copiar todo o código fonte
COPY . .

# Construir a aplicação
RUN yarn build

# Expor porta
EXPOSE 4000

# Iniciar a aplicação
CMD ["yarn", "start:prod"]
