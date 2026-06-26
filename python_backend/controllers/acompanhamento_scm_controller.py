import json
import os
from fastapi import HTTPException

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


async def delete_scm_historico_csv(payload: dict):
    nome = (payload.get('nome') or payload.get('nomeDetalhes') or '').strip().lower()
    data_alvo = (payload.get('data') or '').strip().lower()
    usuario_alvo = (payload.get('usuario') or '').strip().lower()
    raw = _read()
    logs = []
    if isinstance(raw, list):
        logs = raw
    else:
        logs = raw.get('logs', [])

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
        logs = data
    else:
        logs = data.get('logs', [])
    historico = [item for item in logs if item.get('acao') == 'GERAR_CSV_SCM']
    historico.sort(key=lambda x: x.get('data') or 0, reverse=True)
    return historico


async def add_scm_historico_csv(payload: dict):
    data = _read()
    logs = []
    if isinstance(data, list):
        logs = data
    else:
        logs = data.get('logs', [])
    nova = {**payload, 'acao': payload.get('acao', 'GERAR_CSV_SCM'), 'data': payload.get('data') or __import__('datetime').datetime.utcnow().isoformat()}
    logs.insert(0, nova)
    if isinstance(data, dict):
        data['logs'] = logs
        _write(data)
    else:
        _write(logs)
    return {'success': True}
