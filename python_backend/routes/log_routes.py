from fastapi import APIRouter, Path
from controllers import log_controller

router = APIRouter()

@router.get('/logs')
async def listar_logs():
    return log_controller.listar_logs()

@router.get('/logs/meses/{cnpj}')
async def get_meses(cnpj: str = Path(...)):
    return log_controller.get_meses_com_dados(cnpj)
