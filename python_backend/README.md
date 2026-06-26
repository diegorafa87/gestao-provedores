# python_backend (ProvedorDoc converted API)

Esta é uma conversão parcial do backend Node.js/Express para FastAPI + Motor (MongoDB).

Como rodar (Windows):

1. Criar e ativar um ambiente virtual (recomendado):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Instalar dependências:

```powershell
pip install -r requirements.txt
```

3. Criar um arquivo `.env` na raiz de `python_backend` com a string de conexão e credenciais R2, se necessário:

```
MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=provedores
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_BUCKET=<bucket>
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
```

4. Rodar o servidor:

```powershell
uvicorn main:app --reload --port 5000
```

5. Criar ou atualizar o usuário RENIO (opcional):

```powershell
python create_user_renio.py
```

6. Rodar testes:

```powershell
pytest
```

Observações:
- A conversão inclui agora os endpoints principais de `user`, `cliente`, `log`, `gerenciador-acesso`, `acompanhamento`, upload de PDFs para `acompanhamento-postes` e `acompanhamento-scm`, e extração de campos de contrato de postes.
- Para testar upload de PDF, use o campo `pdf` em um `multipart/form-data` POST.
