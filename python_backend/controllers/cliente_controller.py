from fastapi import HTTPException
from bson import ObjectId
from pymongo import ReturnDocument
from db import db
from controllers.log_controller import registrar_log

VALID_STATUSES = ['NOVO','ATIVO','CORRIGIR','SUSPENSO']

async def cadastrar_cliente(payload: dict):
    razaoSocial = payload.get('razaoSocial')
    cnpj = payload.get('cnpj')
    email = payload.get('email')
    telefone = payload.get('telefone')
    consultoria = payload.get('consultoria')
    if not all([razaoSocial, cnpj, email, telefone, consultoria]):
        raise HTTPException(status_code=400, detail='Preencha todos os campos!')
    coll = db['clientes']
    existe_cnpj = await coll.find_one({'cnpj': cnpj})
    if existe_cnpj:
        raise HTTPException(status_code=409, detail='CNPJ já cadastrado!')
    existe_razao = await coll.find_one({'razaoSocial': {'$regex': f'^{razaoSocial}$', '$options': 'i'}})
    if existe_razao:
        raise HTTPException(status_code=409, detail='Razão Social já cadastrada!')
    novo = { 'razaoSocial': razaoSocial, 'cnpj': cnpj, 'email': email, 'telefone': telefone, 'consultoria': consultoria }
    res = await coll.insert_one(novo)
    novo['_id'] = str(res.inserted_id)
    registrar_log('CADASTRAR_CLIENTE', cnpj, {'razaoSocial': razaoSocial, 'email': email, 'telefone': telefone, 'consultoria': consultoria})
    return novo

async def listar_clientes(consultoria: str = None):
    filtro = {}
    if consultoria:
        filtro['consultoria'] = consultoria
    coll = db['clientes']
    try:
        cursor = coll.find(filtro)
        out = []
        async for doc in cursor:
            doc['_id'] = str(doc.get('_id'))
            out.append(doc)
        return out
    except Exception:
        # Se o Mongo estiver indisponível, retornar lista vazia para permitir funcionamento do frontend em dev
        return []


def _validate_objectid(id_str: str):
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(status_code=400, detail='ID de cliente inválido')

async def atualizar_status(id: str, payload: dict):
    status = payload.get('status')
    if status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail='Status inválido')
    if status == 'NOVO':
        raise HTTPException(status_code=400, detail='Status NOVO só pode ser atribuído no cadastro do cliente.')
    coll = db['clientes']
    oid = _validate_objectid(id)
    res = await coll.find_one_and_update({'_id': oid}, {'$set': {'status': status}}, return_document=ReturnDocument.AFTER)
    if not res:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    registrar_log('ATUALIZAR_STATUS', res.get('cnpj'), {'id': id, 'status': status})
    res['_id'] = str(res.get('_id'))
    return res

async def detalhar_cliente(id: str):
    oid = _validate_objectid(id)
    coll = db['clientes']
    doc = await coll.find_one({'_id': oid})
    if not doc:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    doc['_id'] = str(doc.get('_id'))
    return doc

async def excluir_cliente(id: str):
    oid = _validate_objectid(id)
    coll = db['clientes']
    res = await coll.find_one_and_delete({'_id': oid})
    if not res:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    registrar_log('EXCLUIR_CLIENTE', id, {})
    return {'success': True}

async def editar_cliente(id: str, payload: dict):
    razaoSocial = payload.get('razaoSocial')
    cnpj = payload.get('cnpj')
    email = payload.get('email')
    telefone = payload.get('telefone')
    consultoria = payload.get('consultoria')
    if not all([razaoSocial, cnpj, email, telefone, consultoria]):
        raise HTTPException(status_code=400, detail='Preencha todos os campos!')
    oid = _validate_objectid(id)
    coll = db['clientes']
    res = await coll.find_one_and_update({'_id': oid}, {'$set': {'razaoSocial': razaoSocial, 'cnpj': cnpj, 'email': email, 'telefone': telefone, 'consultoria': consultoria}}, return_document=ReturnDocument.AFTER)
    if not res:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    registrar_log('EDITAR_CLIENTE', cnpj, {'id': id, 'razaoSocial': razaoSocial, 'email': email, 'telefone': telefone, 'consultoria': consultoria})
    res['_id'] = str(res.get('_id'))
    return res

async def atualizar_observacao(id: str, payload: dict):
    observacao = payload.get('observacao')
    if observacao is None:
        raise HTTPException(status_code=400, detail='Observação é obrigatória')
    oid = _validate_objectid(id)
    coll = db['clientes']
    res = await coll.find_one_and_update({'_id': oid}, {'$set': {'observacao': observacao}}, return_document=ReturnDocument.AFTER)
    if not res:
        raise HTTPException(status_code=404, detail='Cliente não encontrado')
    registrar_log('ATUALIZAR_OBSERVACAO', res.get('cnpj'), {'id': id, 'observacao': observacao})
    res['_id'] = str(res.get('_id'))
    return res
