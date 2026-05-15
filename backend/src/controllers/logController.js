const fs = require('fs');
const path = require('path');
const dbLogPath = path.join(__dirname, '../db_logs.json');

function lerLogs() {
  try {
    const data = fs.readFileSync(dbLogPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
function salvarLogs(logs) {
  fs.writeFileSync(dbLogPath, JSON.stringify(logs, null, 2));
}

exports.registrarLog = (acao, usuario, detalhes) => {
  const logs = lerLogs();
  logs.unshift({
    acao,
    usuario: usuario || 'sistema',
    detalhes,
    data: new Date().toISOString()
  });
  salvarLogs(logs.slice(0, 100)); // Limita a 100 logs
};

exports.listarLogs = (req, res) => {
  res.json(lerLogs());
};

// Retorna os meses com dados preenchidos para um cliente específico
exports.getMesesComDados = (req, res) => {
  const { cnpj } = req.params;
  const logs = lerLogs();
  
  // Mapeia tipos de ação para módulos
  const moduloMap = {
    'GERAR_CSV_SCM': 'SCM',
    'UPLOAD_PDF_SCM': 'SCM',
    'GERAR_CSV_TVPA': 'TVpA',
    'UPLOAD_PDF_TVPA': 'TVpA',
    'GERAR_CSV_STFC': 'STFC',
    'UPLOAD_PDF_STFC': 'STFC',
    'GERAR_CSV_POSTES': 'Postes',
    'UPLOAD_ACOMPANHAMENTO_POSTES': 'Postes',
    'UPLOAD_PDF_RELATORIO_ECONOMICO': 'Relatório Econômico'
  };
  
  // Objeto para armazenar meses por módulo
  const mesesPorModulo = {
    'SCM': new Set(),
    'TVpA': new Set(),
    'STFC': new Set(),
    'Postes': new Set(),
    'Relatório Econômico': new Set()
  };
  
  // Filtra logs para o cliente (busca por CNPJ ou razão social na ação do usuário)
  logs.forEach(log => {
    const modulo = moduloMap[log.acao];
    if (!modulo) return;
    
    // Verifica se o log contém o CNPJ ou se é relacionado ao cliente
    const usuarioMatch = log.usuario && log.usuario.includes(cnpj);
    const detalhesMatch = log.detalhes && (
      log.detalhes.cnpj === cnpj ||
      (log.detalhes.razaoSocial && log.detalhes.razaoSocial.includes(cnpj))
    );
    
    if (usuarioMatch || detalhesMatch || log.detalhes?.cnpj === cnpj) {
      const mes = log.detalhes?.mes;
      if (mes) {
        // Converte "Janeiro" para 1, "1" para 1, etc.
        let mesNumero = mes;
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        if (typeof mes === 'string' && meses.includes(mes)) {
          mesNumero = (meses.indexOf(mes) + 1).toString();
        }
        mesesPorModulo[modulo].add(parseInt(mesNumero) || mes);
      }
    }
  });
  
  // Converte Sets para Arrays ordenados
  const resultado = {};
  Object.keys(mesesPorModulo).forEach(modulo => {
    resultado[modulo] = Array.from(mesesPorModulo[modulo])
      .map(m => parseInt(m))
      .filter(m => m >= 1 && m <= 12)
      .sort((a, b) => a - b);
  });
  
  res.json(resultado);
};
