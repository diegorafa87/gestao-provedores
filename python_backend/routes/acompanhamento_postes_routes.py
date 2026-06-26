from fastapi import APIRouter, Path
from controllers import acompanhamento_postes_controller

router = APIRouter()

@router.get('/{cnpj}')
async def get_postes_status(cnpj: str = Path(...)):
    return await acompanhamento_postes_controller.get_postes_status(cnpj)

@router.post('/{cnpj}')
async def set_postes_status(cnpj: str = Path(...), payload: dict = None):
  return await acompanhamento_postes_controller.set_postes_status(cnpj, payload or {})
