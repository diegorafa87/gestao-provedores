import asyncio
from fastapi import HTTPException
from utils.r2_upload import upload_to_r2


async def upload_pdf_scm(file, key: str = None):
    if not file:
        raise HTTPException(status_code=400, detail='Arquivo não enviado')
    content = await file.read()
    upload_key = key or f"scm/{int(__import__('time').time() * 1000)}_{file.filename}"
    url = await asyncio.to_thread(upload_to_r2, content, upload_key, file.content_type or 'application/pdf')
    return {'success': True, 'url': url}
