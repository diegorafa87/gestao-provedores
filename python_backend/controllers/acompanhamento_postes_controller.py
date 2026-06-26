import json
import os

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'db_logs.json'))


def _read():
    try:
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def _write(data):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


async def get_postes_status(cnpj: str):
    data = _read()
    obj = data.get('acompanhamentoPostes', {}) if isinstance(data, dict) else {}
    return obj.get(cnpj, {'anosDesligados': {}, 'anosOcultos': {}})


async def set_postes_status(cnpj: str, payload: dict):
    anosDesligados = payload.get('anosDesligados', {})
    anosOcultos = payload.get('anosOcultos', {})
    data = _read() or {}
    if isinstance(data, list):
        data = {'logs': data}
    obj = data.get('acompanhamentoPostes', {})
    obj[cnpj] = {'anosDesligados': anosDesligados, 'anosOcultos': anosOcultos}
    data['acompanhamentoPostes'] = obj
    _write(data)
    return {'success': True}
