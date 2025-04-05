FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema necessárias para o Prisma
RUN apk add --no-cache openssl libc6-compat

# Copiar os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependências com --legacy-peer-deps para evitar problemas de compatibilidade
RUN npm install --legacy-peer-deps

# Gerar o Prisma Client com as flags corretas para Alpine
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
RUN npx prisma generate

# Copiar o código fonte
COPY . .

# Criar a pasta de faturas
RUN mkdir -p /app/faturas

# Compilar o TypeScript
RUN npm run build

# Expor a porta
EXPOSE 4000

# Iniciar a aplicação
CMD ["npm", "run", "start:prod"]
