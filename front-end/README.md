# Lumi Bill Analyzer

<div align="center">
  <img src="src/assets/logo.png" alt="Lumi Logo" width="200"/>
  <p>Uma aplicação web para análise de contas de energia e visualização de dados de consumo.</p>
</div>

## 📋 Sumário

- [Recursos](#recursos)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contribuição](#contribuição)

## 🚀 Recursos

- Análise detalhada de contas de energia
- Visualização de dados de consumo
- Gráficos interativos de histórico de consumo
- Comparação de períodos
- Exportação de relatórios

## 💻 Tecnologias

- React.js
- TypeScript
- Material-UI
- Chart.js
- Axios
- React Router
- Jest (Testes)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/MathLevi20/Bill-App
cd bill-app/front-end
```

2. Instale as dependências:
```bash
yarn
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
yarn start
```

## 📁 Estrutura do Projeto

```
src/
├── assets/         # Arquivos estáticos (imagens, fonts)
├── components/     # Componentes reutilizáveis
├── pages/         # Componentes de página
├── services/      # Serviços e integrações com API
├── hooks/         # Custom hooks
├── utils/         # Funções utilitárias
├── types/         # Definições de tipos TypeScript
└── styles/        # Estilos globais
```

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| REACT_APP_API_URL | URL da API backend | http://localhost:4000/ |
| REACT_APP_ENV | Ambiente atual | development |
| REACT_APP_ENABLE_MOCK_DATA | Habilita dados mockados | false |

## 📜 Scripts Disponíveis

- `yarn start`: Inicia o servidor de desenvolvimento
- `yarn build`: Gera build de produção
- `yarn test`: Executa testes
- `yarn lint`: Verifica problemas de linting
- `yarn format`: Formata o código

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---


