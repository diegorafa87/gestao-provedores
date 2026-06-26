from typing import Optional
from fastapi import APIRouter, UploadFile, File
from controllers import acompanhamento_postes_upload_controller

router = APIRouter()

@router.post('/upload')
async def upload_postes_pdf(pdf: UploadFile = File(...), key: Optional[str] = None):
    return await acompanhamento_postes_upload_controller.upload_pdf_postes(pdf, key)
