#!/bin/bash
# Script simples para subir o projeto no GitHub e fazer deploy no Render

echo "🚀 Iniciando upload para GitHub..."

# 1. Inicializar git (se ainda não foi feito)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Commit
git commit -m "Deploy inicial: Gestão de Provedores"

# 4. Renomear branch para main (se necessário)
git branch -M main

# 5. Adicionar remote (SUBSTITUA OS VALORES)
# git remote add origin https://github.com/SEU_USUARIO/NOME_REPOSITORIO.git

# 6. Push para GitHub
# git push -u origin main

echo "✅ Próximas etapas:"
echo ""
echo "1. Abra: https://github.com/new"
echo "2. Crie um novo repositório com o nome: gestao-provedores"
echo "3. Copie o comando abaixo E EXECUTE no terminal:"
echo ""
echo "   git remote add origin https://github.com/SEU_USUARIO/gestao-provedores.git"
echo "   git push -u origin main"
echo ""
echo "4. Acesse: https://render.com"
echo "5. Clique em 'New +' > 'Web Service'"
echo "6. Selecione seu repositório"
echo "7. Preencha os dados e clique em 'Deploy'"
