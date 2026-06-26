const http = require('http');

const API_URL = 'http://localhost:5001';

const clientes = [
  {
    razaoSocial: 'Empresa CAIO LTDA',
    cnpj: '11.111.111/0001-11',
    email: 'caio@empresa.com',
    telefone: '(11) 98765-4321',
    consultoria: 'CAIO'
  },
  {
    razaoSocial: 'Empresa RENIO LTDA',
    cnpj: '22.222.222/0002-22',
    email: 'renio@empresa.com',
    telefone: '(11) 99876-5432',
    consultoria: 'RENIO'
  }
];

async function criarClientes() {
  for (const cliente of clientes) {
    const data = JSON.stringify(cliente);
    
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/clientes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            try {
              const result = JSON.parse(body);
              console.log(`✅ Cliente ${cliente.consultoria} criado: ${result.razaoSocial}`);
            } catch (e) {
              console.log(`✅ Cliente ${cliente.consultoria} criado com sucesso`);
            }
          } else {
            console.log(`⚠️ Erro ao criar cliente ${cliente.consultoria}: ${res.statusCode}`);
          }
          resolve();
        });
      });

      req.on('error', (err) => {
        console.error(`❌ Erro de rede ao criar ${cliente.consultoria}: ${err.message}`);
        resolve();
      });

      req.write(data);
      req.end();
    });
  }
  process.exit(0);
}

criarClientes();
