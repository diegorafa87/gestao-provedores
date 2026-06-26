from fastapi import APIRouter

router = APIRouter()

@router.get('/')
async def auth_root():
    return {'message': 'Auth routes removidas para migração ao Firebase. Implemente aqui se necessário.'}
