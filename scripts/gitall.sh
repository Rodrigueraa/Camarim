#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Iniciando o GitAll (Sincronização e Start) ===${NC}"

# 1. Vai para a raiz do projeto (um nível acima da pasta do script)
cd "$(dirname "$0")/.." || exit

# 2. Puxa as atualizações do GitHub
echo -e "\n${YELLOW}[1/3] Buscando atualizações no GitHub...${NC}"
git pull origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Repositório atualizado!${NC}"
else
    echo -e "${RED}❌ Erro no git pull. Verifique se há conflitos locais.${NC}"
    exit 1
fi

# 3. Garante que as dependências estão instaladas
echo -e "\n${YELLOW}[2/3] Verificando dependências (npm install)...${NC}"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✔ Dependências validadas!${NC}"
else
    echo -e "${RED}❌ Erro: package.json não encontrado na raiz.${NC}"
    exit 1
fi

# 4. Sobe a aplicação
echo -e "\n${YELLOW}[3/3] Iniciando o servidor web...${NC}"
echo -e "${GREEN}🚀 Servidor iniciando... Pressione Ctrl+C para encerrar.${NC}\n"
npm start
