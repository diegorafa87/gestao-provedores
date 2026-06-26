from db import db
from fastapi import HTTPException
from pymongo import ReturnDocument

async def get_acesso(cnpj: str):
    coll = db['gerenciador_acesso']
    doc = await coll.find_one({'cnpj': cnpj})
    if not doc:
        return {'link': '', 'login': '', 'senha': ''}
    doc['_id'] = str(doc.get('_id'))
    return doc

async def save_acesso(cnpj: str, payload: dict):
    link = payload.get('link', '')
    login = payload.get('login', '')
    senha = payload.get('senha', '')
    atualizadoPor = payload.get('atualizadoPor')
    coll = db['gerenciador_acesso']
    res = await coll.find_one_and_update({'cnpj': cnpj}, {'$set': {'link': link, 'login': login, 'senha': senha, 'atualizadoPor': atualizadoPor, 'atualizadoEm': __import__('datetime').datetime.utcnow()}}, upsert=True, return_document=ReturnDocument.AFTER)
    if res:
        res['_id'] = str(res.get('_id'))
    return res
