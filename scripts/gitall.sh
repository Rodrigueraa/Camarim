#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Sincronizando Projeto (GitAll) ===${NC}"

# 1. Vai para a raiz do repositório atual de forma dinâmica
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo -e "${RED}❌ Erro: Você não está dentro de um repositório Git!${NC}"; exit 1; }

# 2. Puxa as novidades do GitHub...
