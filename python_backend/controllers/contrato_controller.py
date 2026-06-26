import os
import time
from fastapi import HTTPException
from utils.pdf_postes import extrair_campos_contrato_postes

TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'temp'))
os.makedirs(TEMP_DIR, exist_ok=True)


async def upload_contrato_postes(file):
    if not file:
        raise HTTPException(status_code=400, detail='Arquivo não enviado')
    filename = f"{int(time.time() * 1000)}_{file.filename}"
    path = os.path.join(TEMP_DIR, filename)
    content = await file.read()
    with open(path, 'wb') as f:
        f.write(content)
    try:
        campos = extrair_campos_contrato_postes(path)
        return {'success': True, 'file': filename, 'path': path, 'campos': campos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Falha ao extrair campos do PDF: {e}')
