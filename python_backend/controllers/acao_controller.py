from controllers.log_controller import registrar_log

async def registrar_acao(payload: dict):
    acao = payload.get('acao')
    usuario = payload.get('usuario')
    detalhes = payload.get('detalhes')
    if not acao:
        raise Exception('Ação obrigatória')
    registrar_log(acao, usuario, detalhes)
    return {'success': True}
