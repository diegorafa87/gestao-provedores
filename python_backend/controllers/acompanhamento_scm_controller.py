import json
import os
from fastapi import HTTPException
from datetime import datetime

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'db_logs.json'))


def _read():
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data
    except Exception:
        return {}


def _write(data):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _extract_logs(content):
    if isinstance(content, list):
        return content
    if isinstance(content, dict) and isinstance(content.get('logs'), list):
        return content.get('logs', [])
    return []


def _write_logs_content(original_content, logs):
    if isinstance(original_content, list):
        _write(logs)
        return
    if isinstance(original_content, dict):
        payload = dict(original_content)
        payload['logs'] = logs
        _write(payload)
        return
    _write(logs)


def _parse_date(value):
    if not value:
        return None

    text = str(value).strip()
    try:
        return datetime.fromisoformat(text.replace('Z', '+00:00'))
    except Exception:
        pass

    for fmt in ('%d/%m/%Y, %H:%M:%S', '%d/%m/%Y, %H:%M'):
        try:
            return datetime.strptime(text, fmt)
        except Exception:
            continue
    return None


async def delete_scm_historico_csv(payload: dict):
    nome = (payload.get('nome') or payload.get('nomeDetalhes') or '').strip().lower()
    data_alvo = (payload.get('data') or '').strip().lower()
    usuario_alvo = (payload.get('usuario') or '').strip().lower()
    raw = _read()
    logs = _extract_logs(raw)

    def obter_nome(item):
        return (item.get('nome') or (item.get('detalhes') or {}).get('nomeArquivo') or '').strip().lower()

    nova_lista = []
    for item in logs:
        if item.get('acao') != 'GERAR_CSV_SCM':
            nova_lista.append(item)
            continue
        nome_item = obter_nome(item)
        data_item = (item.get('data') or '').strip().lower()
        usuario_item = (item.get('usuario') or '').strip().lower()
        usuario_cnpj = ''.join(ch for ch in str(item.get('usuario') or '') if ch.isdigit())
        usuario_alvo_cnpj = ''.join(ch for ch in usuario_alvo if ch.isdigit())
        mesmo_nome = nome and nome_item == nome
        mesma_data = data_item == data_alvo if data_alvo else True
        mesmo_usuario = usuario_item == usuario_alvo if usuario_alvo else True
        mesmo_cnpj = usuario_cnpj == usuario_alvo_cnpj if usuario_alvo_cnpj else True
        remover_exato = mesmo_nome and mesma_data and mesmo_usuario and mesmo_cnpj
        if remover_exato:
            continue
        nova_lista.append(item)

    _write_logs_content(raw, nova_lista)
    return {'success': True}


async def get_scm_status(cnpj: str):
    data = _read()
    obj = data.get('acompanhamentoSCM', {}) if isinstance(data, dict) else {}
    return obj.get(cnpj, {'anosDesligados': {}, 'anosOcultos': {}})


async def set_scm_status(cnpj: str, payload: dict):
    anosDesligados = payload.get('anosDesligados', {})
    anosOcultos = payload.get('anosOcultos', {})
    data = _read() or {}
    if isinstance(data, list):
        data = {'logs': data}
    obj = data.get('acompanhamentoSCM', {})
    obj[cnpj] = {'anosDesligados': anosDesligados, 'anosOcultos': anosOcultos}
    data['acompanhamentoSCM'] = obj
    _write(data)
    return {'success': True}


async def get_scm_historico_csv():
    data = _read()
    logs = _extract_logs(data)
    historico = [item for item in logs if item.get('acao') == 'GERAR_CSV_SCM']
    historico.sort(key=lambda x: (_parse_date(x.get('data')) or datetime.min).timestamp(), reverse=True)
    return historico


async def add_scm_historico_csv(payload: dict):
    data = _read()
    logs = _extract_logs(data)
    nova = {**payload, 'acao': payload.get('acao', 'GERAR_CSV_SCM'), 'data': datetime.utcnow().isoformat()}
    logs.insert(0, nova)
    _write_logs_content(data, logs)
    return {'success': True}
