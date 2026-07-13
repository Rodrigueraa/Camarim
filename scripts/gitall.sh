#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Sincronizando Projeto (GitAll) ===${NC}"

# 1. Vai para a raiz do projeto
cd "$(dirname "$0")/.." || exit

# 2. Puxa as novidades do GitHub
echo -e "\n${YELLOW}[1/2] Baixando atualizações do GitHub...${NC}"
git pull origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✔ Seu computador está atualizado com o GitHub!${NC}"
else
    echo -e "${RED}❌ Erro ao puxar atualizações. Pode haver conflito de arquivos.${NC}"
    exit 1
fi

# 3. Envia as suas alterações locais pro GitHub automaticamente
echo -e "\n${YELLOW}[2/2] Enviando suas alterações locais...${NC}"

# Adiciona tudo que foi alterado/criado
git add .

# Se houver algo para commitar, ele commita e envia
if ! git diff-index --quiet HEAD --; then
    git commit -m "update: sincronização automática via gitall"
    git push origin main
    echo -e "${GREEN}✔ Suas alterações foram enviadas com sucesso!${NC}"
else
    echo -e "${YELLOW}➜ Nenhuma alteração local encontrada para enviar.${NC}"
fi

echo -e "\n${GREEN}=== Tudo Pronto e Sincronizado! ===${NC}"
