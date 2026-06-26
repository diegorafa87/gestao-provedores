from fastapi import APIRouter, Path
from controllers import acompanhamento_scm_controller

router = APIRouter()

@router.get('/historico/csv')
async def get_historico_csv():
    return await acompanhamento_scm_controller.get_scm_historico_csv()

@router.post('/historico/csv')
async def add_historico_csv(payload: dict):
    return await acompanhamento_scm_controller.add_scm_historico_csv(payload)

@router.delete('/historico/csv')
async def delete_historico_csv(payload: dict):
    return await acompanhamento_scm_controller.delete_scm_historico_csv(payload)

@router.get('/{cnpj}')
async def get_status(cnpj: str = Path(...)):
    return await acompanhamento_scm_controller.get_scm_status(cnpj)

@router.post('/{cnpj}')
async def set_status(cnpj: str = Path(...), payload: dict = None):
  return await acompanhamento_scm_controller.set_scm_status(cnpj, payload or {})
