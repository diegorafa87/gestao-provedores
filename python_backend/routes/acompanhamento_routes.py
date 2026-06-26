from typing import Optional
from fastapi import APIRouter, Path
from controllers import acompanhamento_controller

router = APIRouter()

@router.get('/{tipo}/{cnpj}')
async def get_acompanhamento(tipo: str = Path(...), cnpj: str = Path(...)):
    return await acompanhamento_controller.get_acompanhamento(tipo, cnpj)

@router.post('/{tipo}/{cnpj}')
async def set_acompanhamento(tipo: str = Path(...), cnpj: str = Path(...), payload: dict = None):
    return await acompanhamento_controller.set_acompanhamento(tipo, cnpj, payload or {})
