import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import bcrypt

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('MONGO_DB_NAME', 'provedores')
EMAIL = 'reniosouza@icloud.com'
CONSULTORIA = 'RENIO'
SENHA = 'Renioric4'


async def criar_usuario():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    users = db['users']

    password_hash = bcrypt.hashpw(SENHA.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    usuario = await users.find_one_and_update(
        {'email': EMAIL},
        {'$set': {'consultoria': CONSULTORIA, 'passwordHash': password_hash}},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    print('Usuário criado/atualizado:', usuario)
    client.close()


if __name__ == '__main__':
    asyncio.run(criar_usuario())
