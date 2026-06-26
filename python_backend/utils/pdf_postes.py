import re
from PyPDF2 import PdfReader


def extrair_campos_contrato_postes(pdf_path: str) -> dict:
    reader = PdfReader(pdf_path)
    texto = ''
    for page in reader.pages:
        texto += page.extract_text() or ''

    texto = texto.replace('\n', ' ')
    padrao = lambda regex: re.search(regex, texto, re.IGNORECASE | re.DOTALL)

    campos = {
        'numeroHomologacao': (padrao(r'(?:Número de homologação|Número do processo de homologação).*?(\d{6,}/\d{4})') and padrao(r'(?:Número de homologação|Número do processo de homologação).*?(\d{6,}/\d{4})').group(1)) or '',
        'cnpjDetentoraInfra': (padrao(r'CNPJ da detentora.*?([\d\.\/-]{14,18})') and padrao(r'CNPJ da detentora.*?([\d\.\/-]{14,18})').group(1)) or (padrao(r'CNPJ da distribuidora.*?([\d\.\/-]{14,18})') and padrao(r'CNPJ da distribuidora.*?([\d\.\/-]{14,18})').group(1)) or '',
        'coDescritivoContratoInfra': (padrao(r'Descritivo do contrato.*?(\S+)') and padrao(r'Descritivo do contrato.*?(\S+)').group(1)) or (padrao(r'Contrato nº\s*([\w\d\/-]+)') and padrao(r'Contrato nº\s*([\w\d\/-]+)').group(1)) or '',
        'dataAssinatura': (padrao(r'Data de assinatura.*?(\d{2}/\d{2}/\d{4})') and padrao(r'Data de assinatura.*?(\d{2}/\d{2}/\d{4})').group(1)) or '',
        'dataValidade': (padrao(r'Data de validade.*?(\d{2}/\d{2}/\d{4})') and padrao(r'Data de validade.*?(\d{2}/\d{2}/\d{4})').group(1)) or '',
        'quantidadePontos': (padrao(r'Quantidade de pontos.*?(\d+)') and padrao(r'Quantidade de pontos.*?(\d+)').group(1)) or (padrao(r'Quantidade de Postes:\s*(\d+)') and padrao(r'Quantidade de Postes:\s*(\d+)').group(1)) or '',
        'valorPorPonto': (padrao(r'Valor por ponto.*?R\$\s*([\d\.,]+)') and padrao(r'Valor por ponto.*?R\$\s*([\d\.,]+)').group(1)) or (padrao(r'Valor:\s*R\$\s*([\d\.,]+)') and padrao(r'Valor:\s*R\$\s*([\d\.,]+)').group(1)) or '',
        'indiceReajuste': (padrao(r'Índice de reajuste.*?(IGP-M|IPCA)') and padrao(r'Índice de reajuste.*?(IGP-M|IPCA)').group(1)) or '',
        'dataBaseReajuste': (padrao(r'Data base de reajuste.*?(\d{2}/\d{2}/\d{4})') and padrao(r'Data base de reajuste.*?(\d{2}/\d{2}/\d{4})').group(1)) or '',
        'controversiaJudicial': (padrao(r'Há controvérsia judicial.*?(Sim|Não|NÃO|SIM)') and padrao(r'Há controvérsia judicial.*?(Sim|Não|NÃO|SIM)').group(1)) or '',
    }
    return campos
