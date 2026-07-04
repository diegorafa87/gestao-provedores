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


def _is_current_month(value):
    parsed = _parse_date(value)
    if not parsed:
        return False
    now = datetime.now(parsed.tzinfo) if parsed.tzinfo else datetime.now()
    return parsed.year == now.year and parsed.month == now.month


def _scm_key(item):
    nome = str(item.get('nome') or (item.get('detalhes') or {}).get('nomeArquivo') or '').strip().lower()
    usuario = ''.join(ch for ch in str(item.get('usuario') or '') if ch.isdigit())
    parsed = _parse_date(item.get('data'))
    data = parsed.isoformat() if parsed else str(item.get('data') or '')
    return f'{nome}|{usuario}|{data}'


def _sanitize_scm_logs(logs):
    vistos = set()
    saida = []
    for item in (logs or []):
        if item.get('acao') != 'GERAR_CSV_SCM':
            saida.append(item)
            continue
        if not _is_current_month(item.get('data')):
            continue
        chave = _scm_key(item)
        if chave in vistos:
            continue
        vistos.add(chave)
        saida.append(item)
    return saida


def _persist_sanitized_logs(logs):
    sanitizados = _sanitize_scm_logs(logs)
    _write(sanitizados)
    return sanitizados


def _persist_sanitized_content(content):
    if isinstance(content, list):
        return _persist_sanitized_logs(content)

    obj = dict(content or {})
    logs = obj.get('logs', []) if isinstance(obj.get('logs', []), list) else []
    obj['logs'] = _sanitize_scm_logs(logs)
    _write(obj)
    return obj['logs']


async def delete_scm_historico_csv(payload: dict):
    nome = (payload.get('nome') or payload.get('nomeDetalhes') or '').strip().lower()
    data_alvo = (payload.get('data') or '').strip().lower()
    usuario_alvo = (payload.get('usuario') or '').strip().lower()
    raw = _read()
    logs = []
    if isinstance(raw, list):
        logs = _sanitize_scm_logs(raw)
    else:
        logs = _sanitize_scm_logs(raw.get('logs', []))

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
        mesmo_nome = nome and nome_item == nome
        mesma_data = data_alvo and data_item == data_alvo
        mesmo_usuario = usuario_alvo and usuario_item == usuario_alvo
        remover_exato = mesmo_nome and (mesma_data or True) and (mesmo_usuario or True)
        remover_duplicado = mesmo_nome and (mesmo_usuario or True)
        if remover_exato or remover_duplicado:
            # pula (remove)
            continue
        nova_lista.append(item)

    if isinstance(raw, dict):
        raw['logs'] = nova_lista
        _write(raw)
    else:
        _write(nova_lista)
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
    logs = []
    if isinstance(data, list):
        logs = _persist_sanitized_logs(data)
    else:
        logs = _persist_sanitized_content(data)
    historico = [item for item in logs if item.get('acao') == 'GERAR_CSV_SCM']
    historico.sort(key=lambda x: x.get('data') or 0, reverse=True)
    return historico


async def add_scm_historico_csv(payload: dict):
    data = _read()
    logs = []
    if isinstance(data, list):
        logs = _sanitize_scm_logs(data)
    else:
        logs = _sanitize_scm_logs(data.get('logs', []))
    nova = {**payload, 'acao': payload.get('acao', 'GERAR_CSV_SCM'), 'data': datetime.utcnow().isoformat()}
    logs.insert(0, nova)
    if isinstance(data, dict):
        data['logs'] = _sanitize_scm_logs(logs)
        _write(data)
    else:
        _persist_sanitized_logs(logs)
    return {'success': True}
