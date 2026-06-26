# Guia de Deploy no Render

## Pré-requisitos
- Conta no [Render](https://render.com)
- Repositório GitHub com o código do projeto
- MongoDB Atlas configurado (ou usar MongoDB local)

## Passos para Deploy

### 1. Preparar o Repositório Git
```bash
git init
git add .
git commit -m "Inicial: Gestão de Provedores"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 2. Criar Variáveis de Ambiente no Render

Vá até o dashboard do Render e crie as seguintes variáveis de ambiente:

**Para o Backend:**
- `MONGODB_URI`: `mongodb+srv://usuario:senha@cluster.mongodb.net/provedores?retryWrites=true&w=majority`
- `PORT`: `5001`
- `NODE_ENV`: `production`

**Para o Frontend:**
- `REACT_APP_API_URL`: `https://seu-app-backend.onrender.com/api` (substituir pelo seu domínio)

### 3. Deploy via Render Dashboard

1. **Conectar GitHub**
   - Vá em "New +" → "Web Service"
   - Selecione seu repositório
   - Autorize o Render a acessar seu GitHub

2. **Configurar Backend**
   - Nome: `backend-gestao-provedores`
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node src/index.js`
   - Adicione as variáveis de ambiente (MONGODB_URI, PORT, NODE_ENV)

3. **Configurar Frontend** (separado ou via configuração avançada)
   - Nome: `frontend-gestao-provedores`
   - Environment: Static Site (se for servir estaticamente) ou Node
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

### 4. Conectar Backend e Frontend

No código do **frontend**, atualize as URLs de API:

**File: `frontend/src/services/api.js` ou similar**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### 5. Configurar CORS no Backend

Certifique-se de que o CORS está configurado para aceitar requisições do frontend:

**File: `backend/src/index.js`**
```javascript
app.use(cors({
  origin: [
    'https://seu-app-frontend.onrender.com',  // Seu domínio Render
    'http://localhost:3000',                   // Desenvolvimento local
  ]
}));
```

### 6. Build do Frontend Localmente (Teste)

```bash
cd frontend
npm run build
```

Verifique se o build foi gerado em `frontend/build/`

### 7. Deploy

1. Faça um commit e push para o GitHub:
```bash
git add render.yaml
git commit -m "Atualizar render.yaml para deploy completo"
git push
```

2. O Render automaticamente iniciará o deploy quando detectar mudanças no repositório

3. Monitore o progresso em "Deployments" no dashboard do Render

### 8. Verificar Logs

- Acesse o dashboard do Render
- Clique em seu serviço
- Vá em "Logs" para acompanhar o build e erros

## URLs Após Deploy

- **Frontend**: `https://seu-app-frontend.onrender.com`
- **Backend**: `https://seu-app-backend.onrender.com`
- **API**: `https://seu-app-backend.onrender.com/api`

## Troubleshooting

### Erro de Conexão ao MongoDB
- Verificar se o IP do Render está na whitelist do MongoDB Atlas
- Ir em MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### Erro CORS
- Verificar se o frontend e backend URLs estão corretos
- Atualizar a configuração CORS no backend

### Build falhando
- Verificar logs no Render
- Certificar-se de que `package.json` tem todos os scripts necessários
- Verificar se faltam dependências

## Monitoramento

- Render fornece métricas básicas de CPU, memória e tráfego
- Configure alertas para downtime
- Monitore os logs regularmente

## Atualizações

Para atualizar o código em produção:
1. Faça as mudanças localmente
2. Commit e push para GitHub
3. Render automaticamente fará o deploy novamente

---

**Dúvidas?** Consulte a [documentação do Render](https://render.com/docs)
