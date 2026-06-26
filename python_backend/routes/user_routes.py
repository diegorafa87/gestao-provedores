from fastapi import APIRouter, Depends, Query
from controllers import user_controller

router = APIRouter()

@router.get('/all')
async def list_all_users():
    return await user_controller.list_all_users()

@router.get('/consultoria')
async def get_consultoria(email: str = Query(...)):
    return await user_controller.get_user_consultoria(email)

@router.post('/set-consultoria')
async def set_consultoria(payload: dict):
    email = payload.get('email')
    consultoria = payload.get('consultoria')
    return await user_controller.set_user_consultoria(email, consultoria)
