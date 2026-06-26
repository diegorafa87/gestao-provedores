from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user_routes import router as user_router
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi import HTTPException

load_dotenv()

app = FastAPI(title="ProvedorDoc API (Python)")

origins = [
    "https://provedordoc-2.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
from routes.cliente_routes import router as cliente_router
from routes.log_routes import router as log_router
from routes.acao_routes import router as acao_router
from routes.gerenciador_acesso_routes import router as gerenciador_router
from routes.acompanhamento_scm_routes import router as acomp_scm_router
from routes.acompanhamento_postes_routes import router as acomp_postes_router
from routes.auth_routes import router as auth_router
from routes.contrato_routes import router as contrato_router
from routes.acompanhamento_routes import router as acompanhamento_router
from routes.acompanhamento_postes_upload_routes import router as acompanhamento_postes_upload_router
from routes.acompanhamento_scm_upload_routes import router as acompanhamento_scm_upload_router

app.include_router(cliente_router, prefix="/api")
app.include_router(user_router, prefix="/api/user")
app.include_router(log_router, prefix="/api")
app.include_router(acao_router, prefix="/api")
app.include_router(gerenciador_router, prefix="/api/gerenciador-acesso")
app.include_router(contrato_router, prefix="/api")
app.include_router(acompanhamento_router, prefix="/api/acompanhamento")
app.include_router(acompanhamento_postes_upload_router, prefix="/api/acompanhamento-postes")
app.include_router(acompanhamento_scm_upload_router, prefix="/api/acompanhamento-scm")
app.include_router(acomp_scm_router, prefix="/api/acompanhamento-scm")
app.include_router(acomp_postes_router, prefix="/api/acompanhamento-postes")
app.include_router(auth_router, prefix="/api/auth")

# endpoints stub para outras rotas
@app.get('/api')
async def api_root():
    return {"message": "API do ProvedorDoc (Python) está online!"}


@app.get('/favicon.ico')
async def favicon():
    build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build', 'favicon.ico')
    favicon_path = os.path.abspath(build_path)
    if os.path.isfile(favicon_path):
        return FileResponse(favicon_path)
    return Response(status_code=204)


@app.get('/{full_path:path}')
async def spa_fallback(full_path: str):
    # Não interceptar rotas de API/arquivos estáticos
    if full_path.startswith('api') or full_path.startswith('static') or full_path.startswith('openapi'):
        raise HTTPException(status_code=404)
    index_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build', 'index.html'))
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404)

# Montar build do frontend se existir
build_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build')
if os.path.isdir(os.path.abspath(build_path)):
    app.mount('/', StaticFiles(directory=os.path.abspath(build_path), html=True), name='frontend')

# Run via: uvicorn main:app --reload
