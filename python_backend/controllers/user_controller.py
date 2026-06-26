from fastapi import HTTPException
from db import db
from models import User
from bson import ObjectId

async def list_all_users():
    users_cursor = db['users'].find({})
    users = []
    async for u in users_cursor:
        u['_id'] = str(u['_id'])
        users.append(u)
    return users

async def get_user_consultoria(email: str):
    # Usuário administrador especial: conceder acesso mesmo se o Mongo não estiver disponível
    if email == 'diegorafa87@gmail.com':
        return {'consultoria': 'ADMIN'}
    try:
        user = await db['users'].find_one({'email': email})
    except Exception:
        # Se o banco estiver inacessível, retornar erro genérico
        raise HTTPException(status_code=503, detail='Banco de dados indisponível')
    if not user:
        raise HTTPException(status_code=404, detail='Usuário não encontrado')
    return {'consultoria': user.get('consultoria')}

async def set_user_consultoria(email: str, consultoria: str):
    if not email or not consultoria:
        raise HTTPException(status_code=400, detail='Email e consultoria são obrigatórios')
    result = await db['users'].update_one({'email': email}, {'$set': {'consultoria': consultoria}}, upsert=True)
    user = await db['users'].find_one({'email': email})
    user['_id'] = str(user['_id'])
    return user
