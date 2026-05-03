import API_URL from '../services/api';
import { IconDownload, IconTrash } from './IconsHistorico';
import React, { useState, useEffect } from 'react';

const campos = [
  // { name: 'CNPJ', label: 'CNPJ', required: false }, // Não exibe campo de preenchimento de CNPJ
  { name: 'ANO', label: 'Ano', required: true, type: 'select', options: ['2024', '2025', '2026'] },
  { name: 'MES', label: 'Mês', required: true, type: 'select', options: [
    '1','2','3','4','5','6','7','8','9','10','11','12'
  ] },
  { name: 'ESTADO', label: 'Estado', required: true, type: 'select', options: [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
  ] },
  { name: 'COD_IBGE', label: 'Código IBGE', required: true, type: 'autocomplete' },
  { name: 'TIPO_CLIENTE', label: 'Tipo Cliente', required: true, type: 'select', options: ['PF', 'PJ'] },
  { name: 'TIPO_ATENDIMENTO', label: 'Tipo Atendimento', required: true, type: 'select', options: ['URBANO', 'RURAL'] },
  { name: 'TIPO_MEIO', label: 'Tipo Meio', required: true, type: 'select', options: [
    'cabo_coaxial', 'cabo_metalico', 'fibra', 'radio', 'satelite'
  ] },
  { name: 'TIPO_PRODUTO', label: 'Tipo Produto', required: true, type: 'select', options: [
    'internet', 'linha_dedicada', 'm2m', 'outros'
  ] },
  { name: 'TIPO_TECNOLOGIA', label: 'Tipo Tecnologia', required: true, type: 'select', options: [
    'ETHERNET', 'FTTH', 'Wi-Fi'
  ] },
  { name: 'VELOCIDADE', label: 'Velocidade', required: true },
  { name: 'ACESSOS', label: 'Acessos', required: true },
];

// Ordem dos campos para o CSV, igual ao modelo
const ordemCSV = [
  'CNPJ','ANO','MES','COD_IBGE','TIPO_CLIENTE','TIPO_ATENDIMENTO','TIPO_MEIO','TIPO_PRODUTO','TIPO_TECNOLOGIA','VELOCIDADE','ACESSOS'
];



// Função para gerar CSV com separador vírgula, CRLF e sem linha em branco final
function toCSV(obj) {
  const header = ordemCSV.join(';');
  const row = ordemCSV.map(c => obj[c] || '').join(',');
  return `${header}\r\n${row}`;
}


const CadastroSCM = ({ cnpj, razaoSocial }) => {
  const [form, setForm] = useState({});
  const [linhas, setLinhas] = useState([]); // Armazena linhas salvas
  const [csv, setCsv] = useState('');
  const [municipios, setMunicipios] = useState([]);
  const historicoKey = `historicoSCM_${cnpj}`;
  const [historico, setHistorico] = useState(() => {
    try {
      const salvo = localStorage.getItem(historicoKey);
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch('/municipiosIBGE.json')
      .then(resp => resp.json())
      .then(data => setMunicipios(data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSalvarLinha = e => {
    e.preventDefault();
    // Não salva mais o CNPJ na linha, pois será sempre do cliente
    setLinhas([...linhas, { ...form }]);
    setForm({});
  };

  // Função para corrigir inconsistências nas linhas salvas
  const corrigirLinhas = () => {
    const linhasCorrigidas = linhas.map(linha => {
      // Corrige CNPJ: remove pontuação
      let cnpjCorrigido = (linha.CNPJ || cnpj || '').replace(/[\.\/-]/g, '');
      // Corrige COD_IBGE: se não for número, coloca vazio
      let codIbge = linha.COD_IBGE;
      if (!/^[0-9]+$/.test(codIbge)) codIbge = '';
      // Corrige TIPO_TECNOLOGIA: deixa sempre maiúsculo
      let tipoTec = (linha.TIPO_TECNOLOGIA || '').toUpperCase();
      // Corrige VELOCIDADE: remove vírgulas extras e limita a 6 dígitos
      let velocidade = (linha.VELOCIDADE || '').replace(/,+/g, ',').replace(/(,.*?,)/g, ',');
      velocidade = velocidade.replace(/[^0-9,]/g, '');
      if (velocidade.length > 6) velocidade = velocidade.slice(0,6);
      return {
        ...linha,
        CNPJ: cnpjCorrigido,
        COD_IBGE: codIbge,
        TIPO_TECNOLOGIA: tipoTec,
        VELOCIDADE: velocidade
      };
    });
    setLinhas(linhasCorrigidas);
    alert('Linhas corrigidas!');
  };

  const handleGerarCSV = () => {
    if (linhas.length === 0) return;
    const header = ordemCSV.join(';');
    // Insere o CNPJ do cliente em cada linha, apenas números
    // CNPJ: só números, 14 dígitos com zeros à esquerda
    const cnpjLimpo = (cnpj || '').replace(/\D/g, '').padStart(14, '0');
    const linhasComCnpj = linhas.map(linha => {
      // VELOCIDADE: só vírgula, sem ponto
      let velocidade = (linha.VELOCIDADE || '').replace(/\./g, '');
      // Remove espaços extras dos campos
      const obj = {};
      ordemCSV.forEach(campo => {
        obj[campo] = (linha[campo] || '').toString().trim();
      });
      obj.CNPJ = cnpjLimpo;
      obj.VELOCIDADE = velocidade;
      return obj;
    });
    // Gera linhas CSV com separador ponto e vírgula e CRLF, sem linha em branco final
    const rows = linhasComCnpj.map(linha => ordemCSV.map(c => linha[c] || '').join(';'));
    let csvContent = [header, ...rows].join('\r\n');
    setCsv(csvContent);
    // Nome do arquivo: SCM_RAZAOSOCIAL_ANO_MES.csv
    let ano = linhasComCnpj[0]?.ANO || '';
    let mes = linhasComCnpj[0]?.MES || '';
    // Busca razão social do localStorage se não vier via props
    let nomeRazao = razaoSocial;
    if (!nomeRazao) {
      try {
        const salvo = localStorage.getItem('clienteSelecionado');
        if (salvo) {
          const obj = JSON.parse(salvo);
          nomeRazao = obj.razaoSocial;
        }
      } catch {}
    }
    nomeRazao = (nomeRazao || '').replace(/[^a-zA-Z0-9]/g, '_') || 'CLIENTE';
    const nomeArquivo = `SCM_${nomeRazao}_${ano}_${mes}.csv`;
    // Não faz download automático. Apenas salva no histórico.
    // Histórico: nome igual ao arquivo gerado
    const novoHistorico = [{ nome: nomeArquivo, conteudo: csvContent, data: new Date().toLocaleString() }, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem(historicoKey, JSON.stringify(novoHistorico));
    // Não limpa as linhas após gerar o CSV
    // Log da ação no backend
    fetch(`${API_URL}/api/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'GERAR_CSV_SCM',
        usuario: cnpj || 'desconhecido',
        detalhes: { nomeArquivo, ano, mes, razaoSocial: nomeRazao }
      })
    });
  };

  // Atualiza o localStorage ao excluir do histórico
  const handleExcluirHistorico = idx => {
    if (window.confirm('Tem certeza que deseja excluir este arquivo CSV do histórico? Essa ação não poderá ser desfeita.')) {
      const novo = historico.filter((_, i) => i !== idx);
      setHistorico(novo);
      // Usa a mesma chave dinâmica do localStorage usada para salvar
      localStorage.setItem(historicoKey, JSON.stringify(novo));
    }
  };


  // Mapeamento de código UF para sigla
  const codUfToSigla = {
    12: 'AC', 27: 'AL', 13: 'AM', 16: 'AP', 29: 'BA', 23: 'CE', 53: 'DF', 32: 'ES',
    52: 'GO', 21: 'MA', 51: 'MT', 50: 'MS', 31: 'MG', 15: 'PA', 25: 'PB', 41: 'PR',
    26: 'PE', 22: 'PI', 33: 'RJ', 24: 'RN', 43: 'RS', 11: 'RO', 14: 'RR', 42: 'SC',
    28: 'SE', 35: 'SP', 17: 'TO'
  };

  // Filtra municípios pelo estado selecionado, aceitando diferentes formatos
  const municipiosFiltrados = form.ESTADO
    ? municipios.filter(m => {
        if (m.uf || m.UF) return (m.uf || m.UF) === form.ESTADO;
        if (m.codigo_uf) return codUfToSigla[m.codigo_uf] === form.ESTADO;
        return false;
      })
    : [];

  // Função para importar e corrigir arquivo CSV SCM
  const importarCorrigirArquivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      // Divide linhas e ignora cabeçalho
      const linhasArquivo = text.split(/\r?\n/).filter(l => l.trim()).slice(1);
      let novasLinhas = linhasArquivo.map(linha => {
        const valores = linha.split(';');
        const obj = {};
        ordemCSV.forEach((campo, idx) => {
          obj[campo] = valores[idx] || '';
        });
        // Se não vier ACESSOS mas vier QT_ACESSOS, usa esse valor
        if ((!obj.ACESSOS || obj.ACESSOS === '') && valores.length === ordemCSV.length) {
          // nada a fazer, já está mapeado
        } else if ((!obj.ACESSOS || obj.ACESSOS === '') && valores.length > ordemCSV.length) {
          // tenta pegar o valor de QT_ACESSOS (última coluna extra)
          obj.ACESSOS = valores[ordemCSV.length] || '';
        }
        // Corrige CNPJ: remove pontuação
        obj.CNPJ = (obj.CNPJ || cnpj || '').replace(/[\.\/-]/g, '');
        // Corrige COD_IBGE: se não for número, coloca vazio
        if (!/^[0-9]+$/.test(obj.COD_IBGE)) obj.COD_IBGE = '';
        // Corrige TIPO_TECNOLOGIA: deixa sempre maiúsculo
        obj.TIPO_TECNOLOGIA = (obj.TIPO_TECNOLOGIA || '').toUpperCase();
        // Corrige TIPO_PRODUTO: sempre 'internet'
        obj.TIPO_PRODUTO = 'internet';
        // Corrige VELOCIDADE: remove vírgulas extras e limita a 6 dígitos
        let velocidade = (obj.VELOCIDADE || '').replace(/,+/g, ',').replace(/(,.*?,)/g, ',');
        velocidade = velocidade.replace(/[^0-9,]/g, '');
        if (velocidade.length > 6) velocidade = velocidade.slice(0,6);
        obj.VELOCIDADE = velocidade;
        return obj;
      });
      // Remove linhas sem COD_IBGE válido (apenas números)
      novasLinhas = novasLinhas.filter(linha => /^[0-9]+$/.test(linha.COD_IBGE));
      // Agrupa linhas idênticas somando ACESSOS
      const agrupadas = [];
      novasLinhas.forEach(linha => {
        // Chave de comparação: todas as colunas exceto ACESSOS
        const chave = ordemCSV.filter(c => c !== 'ACESSOS').map(c => linha[c]).join('|');
        const existente = agrupadas.find(l => ordemCSV.filter(c => c !== 'ACESSOS').every(c => l[c] === linha[c]));
        if (existente) {
          // Soma ACESSOS (convertendo para número)
          const acessosAtual = parseInt(existente.ACESSOS || '0', 10);
          const acessosNovo = parseInt(linha.ACESSOS || '0', 10);
          existente.ACESSOS = String(acessosAtual + acessosNovo);
        } else {
          agrupadas.push({ ...linha });
        }
      });
      setLinhas([...linhas, ...agrupadas]);
      alert('Arquivo importado, linhas corrigidas, agrupadas e apenas com COD IBGE válido!');
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div style={{maxWidth:500,margin:'2rem auto',background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px #0001'}}>
        <h2>Cadastro SCM</h2>
        <div style={{marginBottom:16}}>
          <label style={{fontWeight:600,marginRight:8}}>Importar e Corrigir Arquivo SCM:</label>
          <input type="file" accept=".csv,text/csv" onChange={importarCorrigirArquivo} />
        </div>
        <form onSubmit={handleSalvarLinha} style={{display:'flex',flexDirection:'column',gap:12}}>
          {campos.map(campo => (
            campo.name === 'COD_IBGE' ? (
              <div key={campo.name} style={{display:'flex',flexDirection:'column'}}>
                <label htmlFor={campo.name} style={{fontWeight:600}}>{campo.label}:</label>
                <input
                  list="municipios-ibge"
                  id={campo.name}
                  name={campo.name}
                  value={form[campo.name] || ''}
                  onChange={handleChange}
                  required={campo.required}
                  placeholder={form.ESTADO ? "Digite ou selecione o município" : "Escolha o estado primeiro"}
                  style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                  autoComplete="off"
                  disabled={!form.ESTADO}
                />
                <datalist id="municipios-ibge">
                  {municipiosFiltrados.map(m => (
                    <option
                      key={m.codigo_ibge || m.codigo}
                      value={m.codigo_ibge || m.codigo}
                    >
                      {m.nome} - {(m.uf || m.UF)}
                    </option>
                  ))}
                </datalist>
              </div>
            ) : (
              <div key={campo.name} style={{display:'flex',flexDirection:'column'}}>
                <label htmlFor={campo.name} style={{fontWeight:600}}>{campo.label}:</label>
                {campo.type === 'select' ? (
                  <select
                    id={campo.name}
                    name={campo.name}
                    value={form[campo.name] || ''}
                    onChange={handleChange}
                    required={campo.required}
                    style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                  >
                    <option value="">{
                      campo.name === 'ANO' ? 'Selecione o ano' :
                      campo.name === 'ESTADO' ? 'Selecione o estado' :
                      campo.name === 'MES' ? 'Selecione o mês' :
                      'Selecione'
                    }</option>
                    {campo.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={campo.name}
                    name={campo.name}
                    value={form[campo.name] || ''}
                    onChange={handleChange}
                    required={campo.required}
                    style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                  />
                )}
              </div>
            )
          ))}
          <button type="submit" style={{marginTop:16,background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'0.7rem 2rem',fontWeight:'bold',fontSize:16,cursor:'pointer'}}>Salvar Linha</button>
        </form>
        {linhas.length > 0 && (
          <div style={{marginTop:24}}>
            <h4>Linhas salvas:</h4>
            <button onClick={corrigirLinhas} style={{marginBottom:12,background:'#fbc02d',color:'#333',border:'none',borderRadius:4,padding:'0.5rem 1.5rem',fontWeight:'bold',fontSize:15,cursor:'pointer'}}>Corrigir Linhas</button>
            <table style={{width:'100%',background:'#eee',borderRadius:6,padding:8}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left',padding:'4px 8px'}}>CNPJ</th>
                  {campos.map(c => <th key={c.name} style={{textAlign:'left',padding:'4px 8px'}}>{c.label}</th>)}
                  <th style={{textAlign:'center',padding:'4px 8px'}}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, idx) => (
                  <tr key={idx} style={{background: idx%2?'#f9f9f9':'#fff'}}>
                    <td style={{padding:'4px 8px'}}>{cnpj}</td>
                    {campos.map(c => <td key={c.name} style={{padding:'4px 8px'}}>{linha[c.name]}</td>)}
                    <td style={{textAlign:'center',padding:'4px 8px'}}>
                      <button onClick={() => setLinhas(linhas.filter((_, i) => i !== idx))} style={{background:'none',border:'none',cursor:'pointer',color:'#d32f2f',fontSize:18}} title="Excluir linha" aria-label="Excluir linha">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleGerarCSV} style={{marginTop:16,background:'#388e3c',color:'#fff',border:'none',borderRadius:4,padding:'0.7rem 2rem',fontWeight:'bold',fontSize:16,cursor:'pointer'}}>Gerar CSV</button>
          </div>
        )}
      </div>
      {/* Histórico de arquivos gerados */}
      {historico.length > 0 && (
        <div style={{marginTop:32}}>
          <h3>Histórico de arquivos gerados</h3>
          <table style={{width:'100%',background:'#f4f4f4',borderRadius:6,padding:8}}>
            <thead>
              <tr>
                <th style={{textAlign:'left',padding:'4px 8px'}}>Nome do Arquivo</th>
                <th style={{textAlign:'left',padding:'4px 8px'}}>Data</th>
                <th style={{textAlign:'center',padding:'4px 8px'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item, idx) => (
                <tr key={idx} style={{background: idx%2?'#fafafa':'#fff'}}>
                  <td style={{padding:'4px 8px'}}>{item.nome}</td>
                  <td style={{padding:'4px 8px'}}>{item.data}</td>
                  <td style={{textAlign:'center',padding:'4px 8px', display:'flex', gap:8, justifyContent:'center'}}>
                    <button onClick={() => {
                      // Força BOM UTF-8, separador vírgula, CRLF e sem linha em branco final
                      const BOM = '\uFEFF';
                      let conteudo = item.conteudo.replace(/^\s+/, '');
                      // Garante que a primeira linha é o cabeçalho correto e com vírgula
                      const header = 'CNPJ;ANO;MES;COD_IBGE;TIPO_CLIENTE;TIPO_ATENDIMENTO;TIPO_MEIO;TIPO_PRODUTO;TIPO_TECNOLOGIA;VELOCIDADE;ACESSOS';
                      let linhas = conteudo.split(/\r?\n/);
                      linhas[0] = header;
                      conteudo = linhas.join('\r\n') + '\r\n'; // Garante CRLF ao final
                      // Força CRLF em todas as linhas (caso haja algum \n isolado)
                      conteudo = conteudo.replace(/([^\r])\n/g, '$1\r\n');
                      const blob = new Blob([BOM + conteudo], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.setAttribute('download', item.nome);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }} style={{background:'none',border:'none',cursor:'pointer',padding:2}} title="Baixar arquivo" aria-label="Baixar arquivo">
                      <IconDownload />
                    </button>
                    <button onClick={() => handleExcluirHistorico(idx)} style={{background:'none',border:'none',cursor:'pointer',padding:2}} title="Excluir do histórico" aria-label="Excluir do histórico">
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default CadastroSCM;
