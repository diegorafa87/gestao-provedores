from datetime import datetime
from fastapi import HTTPException
from pymongo import ReturnDocument
from db import db

async def get_acompanhamento(tipo: str, cnpj: str):
    coll = db['acompanhamentos']
    doc = await coll.find_one({'tipo': tipo, 'cnpj': cnpj}, {'checks': 0, 'links': 0, 'historico': 0})
    if not doc:
        return {'cnpj': cnpj, 'tipo': tipo, 'atualizadoPor': None, 'atualizadoEm': None}
    doc['_id'] = str(doc.get('_id'))
    return doc

async def set_acompanhamento(tipo: str, cnpj: str, payload: dict):
    atualizadoPor = payload.get('atualizadoPor')
    coll = db['acompanhamentos']
    result = await coll.find_one_and_update(
        {'tipo': tipo, 'cnpj': cnpj},
        {'$set': {'atualizadoPor': atualizadoPor, 'atualizadoEm': datetime.utcnow()}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    if result:
        result['_id'] = str(result.get('_id'))
    return result
