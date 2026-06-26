from fastapi import APIRouter, Path, Query
from controllers import cliente_controller

router = APIRouter()

@router.post('/clientes')
async def cadastrar_cliente(payload: dict):
    return await cliente_controller.cadastrar_cliente(payload)

@router.get('/clientes')
async def listar_clientes(consultoria: str = Query(None)):
    return await cliente_controller.listar_clientes(consultoria)

@router.patch('/clientes/{id}/status')
async def atualizar_status(id: str = Path(...), payload: dict = None):
    return await cliente_controller.atualizar_status(id, payload or {})

@router.get('/clientes/{id}')
async def detalhar_cliente(id: str = Path(...)):
    return await cliente_controller.detalhar_cliente(id)

@router.delete('/clientes/{id}')
async def excluir_cliente(id: str = Path(...)):
    return await cliente_controller.excluir_cliente(id)

@router.put('/clientes/{id}')
async def editar_cliente(id: str = Path(...), payload: dict = None):
    return await cliente_controller.editar_cliente(id, payload or {})

@router.patch('/clientes/{id}/observacao')
async def atualizar_observacao(id: str = Path(...), payload: dict = None):
    return await cliente_controller.atualizar_observacao(id, payload or {})
