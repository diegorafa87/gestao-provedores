from typing import Optional
from fastapi import APIRouter, UploadFile, File
from controllers import acompanhamento_scm_upload_controller

router = APIRouter()

@router.post('/upload')
async def upload_scm_pdf(pdf: UploadFile = File(...), key: Optional[str] = None):
    return await acompanhamento_scm_upload_controller.upload_pdf_scm(pdf, key)
