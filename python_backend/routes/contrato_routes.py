from fastapi import APIRouter, UploadFile, File
from controllers import contrato_controller

router = APIRouter()

@router.post('/contrato/postes/upload')
async def upload_contrato_postes(contrato: UploadFile = File(...)):
    return await contrato_controller.upload_contrato_postes(contrato)
