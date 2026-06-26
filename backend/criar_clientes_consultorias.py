import json
import urllib.request
import urllib.error

API_URL = 'http://localhost:5001/clientes'

clientes = [
    {
        'razaoSocial': 'Empresa CAIO LTDA',
        'cnpj': '11.111.111/0001-11',
        'email': 'caio@empresa.com',
        'telefone': '(11) 98765-4321',
        'consultoria': 'CAIO'
    },
    {
        'razaoSocial': 'Empresa RENIO LTDA',
        'cnpj': '22.222.222/0002-22',
        'email': 'renio@empresa.com',
        'telefone': '(11) 99876-5432',
        'consultoria': 'RENIO'
    }
]

for cliente in clientes:
    try:
        data = json.dumps(cliente).encode('utf-8')
        req = urllib.request.Request(
            API_URL,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print(f"✅ Cliente {cliente['consultoria']} criado: {result.get('razaoSocial')}")
    except urllib.error.HTTPError as e:
        print(f"⚠️ Erro HTTP ao criar {cliente['consultoria']}: {e.code}")
    except Exception as err:
        print(f"❌ Erro ao criar {cliente['consultoria']}: {err}")
