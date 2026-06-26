from fastapi import APIRouter
from controllers import acao_controller

router = APIRouter()

@router.post('/acao')
async def registrar_acao(payload: dict):
    return await acao_controller.registrar_acao(payload)
