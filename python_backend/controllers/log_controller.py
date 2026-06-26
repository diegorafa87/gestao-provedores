import json
import os
from datetime import datetime
from fastapi import HTTPException

DB_LOG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'db_logs.json'))


def _read_logs():
    try:
        with open(DB_LOG_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else data
    except Exception:
        return []


def _write_logs(data):
    os.makedirs(os.path.dirname(DB_LOG_PATH), exist_ok=True)
    with open(DB_LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def registrar_log(acao, usuario, detalhes):
    logs = _read_logs() or []
    entry = {
        'acao': acao,
        'usuario': usuario or 'sistema',
        'detalhes': detalhes,
        'data': datetime.utcnow().isoformat()
    }
    if isinstance(logs, dict):
        # compatibilidade: extrair array interno
        logs_list = logs.get('logs', [])
        logs_list.insert(0, entry)
        logs['logs'] = logs_list[:100]
        _write_logs(logs)
    else:
        logs.insert(0, entry)
        _write_logs(logs[:100])


def listar_logs():
    data = _read_logs()
    # Se for objeto com propriedade logs, retornar essa lista
    if isinstance(data, dict):
        return data.get('logs', [])
    return data


# Retorna os meses com dados preenchidos para um cliente específico
def get_meses_com_dados(cnpj: str):
    logs = _read_logs() or []
    modulo_map = {
        'GERAR_CSV_SCM': 'SCM',
        'UPLOAD_PDF_SCM': 'SCM',
        'GERAR_CSV_TVPA': 'TVpA',
        'UPLOAD_PDF_TVPA': 'TVpA',
        'GERAR_CSV_STFC': 'STFC',
        'UPLOAD_PDF_STFC': 'STFC',
        'GERAR_CSV_POSTES': 'Postes',
        'UPLOAD_ACOMPANHAMENTO_POSTES': 'Postes',
        'UPLOAD_PDF_RELATORIO_ECONOMICO': 'Relatório Econômico'
    }

    meses_por_modulo = {
        'SCM': set(),
        'TVpA': set(),
        'STFC': set(),
        'Postes': set(),
        'Relatório Econômico': set()
    }

    meses_nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    for log in logs:
        modulo = modulo_map.get(log.get('acao'))
        if not modulo:
            continue
        usuario = (log.get('usuario') or '')
        detalhes = log.get('detalhes') or {}
        usuario_match = cnpj in usuario
        detalhes_match = (detalhes.get('cnpj') == cnpj or (detalhes.get('razaoSocial') and cnpj in detalhes.get('razaoSocial')))
        if usuario_match or detalhes_match or detalhes.get('cnpj') == cnpj:
            mes = detalhes.get('mes')
            if mes:
                mes_numero = mes
                if isinstance(mes, str) and mes in meses_nomes:
                    mes_numero = meses_nomes.index(mes) + 1
                try:
                    meses_por_modulo[modulo].add(int(mes_numero))
                except Exception:
                    pass

    resultado = {}
    for modulo, s in meses_por_modulo.items():
        arr = sorted([m for m in map(int, s) if 1 <= m <= 12])
        resultado[modulo] = arr
    return resultado
