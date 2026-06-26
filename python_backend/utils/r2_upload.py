import os
import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()


def _get_r2_client():
    endpoint = os.getenv('R2_ENDPOINT')
    bucket = os.getenv('R2_BUCKET')
    access_key = os.getenv('R2_ACCESS_KEY_ID')
    secret_key = os.getenv('R2_SECRET_ACCESS_KEY')

    if not all([endpoint, bucket, access_key, secret_key]):
        raise EnvironmentError('Variáveis de ambiente R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID e R2_SECRET_ACCESS_KEY são obrigatórias para upload R2.')

    return boto3.client(
        's3',
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version='s3v4')
    )


def upload_to_r2(buffer: bytes, key: str, content_type: str = 'application/pdf') -> str:
    endpoint = os.getenv('R2_ENDPOINT')
    bucket = os.getenv('R2_BUCKET')
    client = _get_r2_client()
    params = {
        'Bucket': bucket,
        'Key': key,
        'Body': buffer,
        'ContentType': content_type,
        'ACL': 'public-read',
    }
    client.put_object(**params)
    return f"{endpoint.rstrip('/')}/{bucket}/{key}"
