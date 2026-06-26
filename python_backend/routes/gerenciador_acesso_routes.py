from fastapi import APIRouter, Path
from controllers import gerenciador_acesso_controller

router = APIRouter()

@router.get('/{cnpj}')
async def get_acesso(cnpj: str = Path(...)):
    return await gerenciador_acesso_controller.get_acesso(cnpj)

@router.post('/{cnpj}')
async def save_acesso(cnpj: str = Path(...), payload: dict = None):
    return await gerenciador_acesso_controller.save_acesso(cnpj, payload or {})
