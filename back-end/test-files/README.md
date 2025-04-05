# Diretório de Arquivos de Teste

Este diretório contém arquivos usados para testes.

## Arquivo sample-bill.pdf

Para executar os testes com sucesso, você deve colocar um arquivo de exemplo de fatura chamado `sample-bill.pdf` neste diretório.

## Estrutura esperada do PDF

O arquivo PDF deve conter os seguintes campos para que os testes funcionem corretamente:

1. Número do cliente (ex: "Nº DO CLIENTE: 123456")
2. Mês de referência (ex: "Referente a: Janeiro/2023")
3. Energia Elétrica (ex: "Energia Elétrica 100 kWh ... 150,00")
4. Energia SCEEE s/ICMS (ex: "Energia SCEEE s/ICMS 200 kWh ... 180,00")
5. Energia Compensada GD I (ex: "Energia Compensada GD I 150 kWh ... 120,00")
6. Contribuição Iluminação Pública Municipal (ex: "Contrib Ilum Publica Municipal 15,00")

Estes campos são essenciais para os testes e para o funcionamento correto da extração de dados.
