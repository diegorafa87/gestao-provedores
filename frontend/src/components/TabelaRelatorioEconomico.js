import API_URL from '../services/api';
// ...restante do código permanece igual...
import React, { useState } from 'react';

const campos = [
  { name: 'CN', label: 'CN' },
  { name: 'DadoInformado', label: 'Dado Informado' },
  { name: 'Servico', label: 'Serviço' },
  { name: 'UF', label: 'UF' },
  { name: 'Valores', label: 'Valores' },
  { name: 'CNPJ', label: 'CNPJ' },
  { name: 'DATA', label: 'DATA' },
];

const opcoesDadoInformado = [
  'Receita_Operacional_Líquida_ROL',
  'Capital_Expenditure_CAPEX',
  'Tráfego_Dados_Total_MB',
];

const opcoesServico = ['SCM', 'SeAC', 'OUTROS'];
const opcoesUF = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function TabelaRelatorioEconomico({ cnpjPadrao, dataPadrao, datasPadrao, razaoSocial = '', semestre = 'SEM1', ano = '' }) {
  // Busca o CNPJ do cliente do card (localStorage)
  let cnpjCliente = cnpjPadrao;
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.cnpj) cnpjCliente = obj.cnpj;
    }
  } catch {}
  // Histórico de exportações CSV
  const historicoKey = `historicoCSVRelatorioEconomico_${cnpjCliente}`;
  const [historicoCSV, setHistoricoCSV] = useState(() => {
    const salvo = localStorage.getItem(historicoKey);
    if (!salvo) return [];
    // Garante que cada item tenha uma URL de download válida
    return JSON.parse(salvo).map(item => {
      if (item.url) return item;
      const blob = new Blob([item.conteudo], { type: 'text/csv;charset=utf-8;' });
      return { ...item, url: URL.createObjectURL(blob) };
    });
  });

  const [linhas, setLinhas] = useState([
    { CN: '0', DadoInformado: 'Receita_Operacional_Líquida_ROL', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[0] : (dataPadrao || '') },
    { CN: '0', DadoInformado: 'Capital_Expenditure_CAPEX', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[1] : (dataPadrao || '') },
    { CN: '0', DadoInformado: 'Tráfego_Dados_Total_MB', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[2] : (dataPadrao || '') },
    { CN: '0', DadoInformado: 'Receita_Operacional_Líquida_ROL', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[3] : (dataPadrao || '') },
    { CN: '0', DadoInformado: 'Capital_Expenditure_CAPEX', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[4] : (dataPadrao || '') },
    { CN: '0', DadoInformado: 'Tráfego_Dados_Total_MB', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[5] : (dataPadrao || '') },
  ]);

  const [linhasSalvas, setLinhasSalvas] = useState([]);
  const handleSalvarLinhas = () => {
    setLinhasSalvas([...linhasSalvas, ...linhas]);
    setLinhas([
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[0] : (dataPadrao || '') },
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[1] : (dataPadrao || '') },
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[2] : (dataPadrao || '') },
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[3] : (dataPadrao || '') },
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[4] : (dataPadrao || '') },
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: datasPadrao ? datasPadrao[5] : (dataPadrao || '') },
    ]);
  };

  // Limpa linhas salvas somente após gerar CSV
  // (Função duplicada removida. A versão correta de handleCSV permanece no arquivo.)

  // Função correta para excluir do histórico (agora no escopo do componente)
  const handleExcluirHistorico = (idx) => {
    setHistoricoCSV(prev => {
      const novoHistorico = prev.filter((item, i) => {
        if (i === idx && item.url) {
          // Libera o blob da memória
          URL.revokeObjectURL(item.url);
        }
        return i !== idx;
      });
      localStorage.setItem(historicoKey, JSON.stringify(novoHistorico.map(({url, ...rest}) => rest)));
      return novoHistorico;
    });
  };

  const handleChange = (idx, campo, valor) => {
    setLinhas(linhas => linhas.map((linha, i) => i === idx ? { ...linha, [campo]: valor } : linha));
  };

  const handleCSV = () => {
    // Cabeçalho e ordem conforme exemplo fornecido
    const header = 'CN;DADO_INFORMADO;SERVICO;UNIDADE_DA_FEDERACAO_UF;VALORES;CNPJ;DATA';
    const rows = linhasSalvas.map(linha => [
      linha.CN || '',
      linha.DadoInformado || '',
      linha.Servico || '',
      linha.UF || '',
      linha.Valores || '',
      linha.CNPJ || '',
      linha.DATA || ''
    ].join(';'));
    // Usa CRLF como quebra de linha e garante CRLF ao final
    const csv = [header, ...rows].join('\r\n') + '\r\n';
    // Monta nome do arquivo conforme padrão solicitado
    let nomeRazao = razaoSocial
      ? razaoSocial.normalize('NFD').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').toUpperCase()
      : 'RAZAOSOCIAL';
    let nomeAno = ano || (datasPadrao && datasPadrao[0] ? (datasPadrao[0].split('/')[2] || '') : 'ANO');
    let sem = (semestre || '').toString().replace(/[^12]/g, '').replace(/^$/, '1');
    let nomeArquivo = `REL_ECON_${nomeRazao}_${nomeAno}_SEM${sem}.csv`;
    // Download automático
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Salvar histórico com URL de download
    const novoHistorico = [
      { data: new Date().toLocaleString(), conteudo: csv, nome: nomeArquivo, url },
      ...historicoCSV
    ].slice(0, 10); // Limita a 10 últimos
    setHistoricoCSV(novoHistorico);
    localStorage.setItem(historicoKey, JSON.stringify(novoHistorico));
    // Log da ação no backend
      fetch(`${API_URL}/api/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'GERAR_CSV_RELATORIO_ECONOMICO',
        usuario: cnpjCliente || 'desconhecido',
        detalhes: { nomeArquivo, semestre, ano: nomeAno, razaoSocial }
      })
    });
    // Não limpa linhasSalvas após gerar CSV
  };

  const handleAdicionarLinha = () => {
    setLinhas(linhas => ([
      ...linhas,
      { CN: '0', DadoInformado: '', Servico: 'SCM', UF: '', Valores: '', CNPJ: cnpjCliente || '', DATA: '' }
    ]));
  };

  return (
    <div style={{background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px #0001',maxWidth:1200,margin:'2rem auto'}}>
      <h2>Formulário</h2>
      <table style={{width:'100%',marginBottom:16,tableLayout:'fixed'}}>
        <colgroup><col style={{width:'32px', minWidth:'32px'}} /><col style={{width:'8px'}} /><col style={{width:'80px', minWidth:'70px'}} /><col style={{width:'50px', minWidth:'40px'}} /><col style={{width:'36px', minWidth:'30px'}} /><col style={{width:'38px', minWidth:'32px'}} /><col style={{width:'8px'}} /><col style={{width:'70px', minWidth:'60px'}} /><col style={{width:'8px'}} /><col style={{width:'60px', minWidth:'45px'}} /></colgroup>
        <thead>
          <tr>
            <th style={{textAlign:'center',fontWeight:600}}>CN</th>
            <th style={{width:'8px'}}></th>
            <th style={{textAlign:'center',fontWeight:600}}>Dado Informado</th>
            <th style={{textAlign:'center',fontWeight:600}}>Serviço</th>
            <th style={{textAlign:'center',fontWeight:600}}>UF</th>
            <th style={{textAlign:'center',fontWeight:600}}>Valores</th>
            <th style={{width:'8px'}}></th>
            <th style={{textAlign:'center',fontWeight:600}}>CNPJ</th>
            <th style={{width:'8px'}}></th>
            <th style={{textAlign:'center',fontWeight:600}}>DATA</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, idx) => (
            <tr key={idx}>
              <td style={{textAlign:'center'}}><input value={linha.CN} onChange={e => handleChange(idx, 'CN', e.target.value)} style={{width:'100%',textAlign:'center'}} /></td>
              <td></td>
              <td>
                <select value={linha.DadoInformado} onChange={e => handleChange(idx, 'DadoInformado', e.target.value)} style={{width:'100%'}}>
                  <option value="">Selecione</option>
                  {opcoesDadoInformado.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td>
                <select value={linha.Servico} onChange={e => handleChange(idx, 'Servico', e.target.value)} style={{width:'100%'}}>
                  {opcoesServico.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td style={{textAlign:'center'}}>
                <select value={linha.UF} onChange={e => handleChange(idx, 'UF', e.target.value)} style={{width:'100%',textAlign:'center'}}>
                  <option value="">Selecione</option>
                  {opcoesUF.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td style={{textAlign:'center'}}>
                <input
                  value={linha.Valores}
                  onChange={e => {
                    let valor = e.target.value.replace(/[^0-9]/g, '');
                    if (!valor) valor = '0';
                    valor = (parseInt(valor, 10) / 100).toFixed(2).replace('.', ',');
                    handleChange(idx, 'Valores', valor);
                  }}
                  placeholder="0,00"
                  style={{background: linha.Valores ? undefined : '#f5f5f5', width:'100%',textAlign:'center'}}
                  inputMode="numeric"
                />
              </td>
              <td></td>
              <td style={{textAlign:'center'}}>
                <input value={linha.CNPJ} onChange={e => handleChange(idx, 'CNPJ', e.target.value)} placeholder={cnpjCliente || ''} style={{width:'100%',textAlign:'center'}} />
              </td>
              <td></td>
              <td style={{textAlign:'center'}}>
                <input value={linha.DATA} onChange={e => handleChange(idx, 'DATA', e.target.value)} style={{width:'100%',textAlign:'center'}} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleAdicionarLinha}
        style={{
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.45rem 1.2rem',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          marginRight: 10,
          boxShadow: '0 1px 4px #1976d233',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 16px #1976d244';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px #1976d233';
        }}
      >
        Adicionar Linha
      </button>
      <button
        onClick={handleSalvarLinhas}
        style={{
          background: 'linear-gradient(90deg, #388e3c 0%, #66bb6a 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.45rem 1.2rem',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          marginRight: 10,
          boxShadow: '0 1px 4px #388e3c33',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 16px #388e3c44';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px #388e3c33';
        }}
      >
        Salvar Linhas
      </button>
      <button
        onClick={handleCSV}
        style={{
          background: 'linear-gradient(90deg, #d32f2f 0%, #ff5252 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '0.45rem 1.2rem',
          fontWeight: 600,
          fontSize: 15,
          cursor: 'pointer',
          marginRight: 10,
          boxShadow: '0 1px 4px #d32f2f33',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 16px #d32f2f44';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 1px 4px #d32f2f33';
        }}
      >
        Gerar CSV
      </button>

      {linhasSalvas.length > 0 && (
        <div style={{marginTop:32}}>
          <h3>Linhas Salvas</h3>
          <table style={{width:'100%',background:'#f4f4f4',borderRadius:6,padding:8}}>
            <thead>
              <tr>
                {campos.map(c => <th key={c.name}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {linhasSalvas.map((linha, idx) => (
                <tr key={idx}>
                  {campos.map(c => <td key={c.name}>{linha[c.name]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {/* Histórico de exportações CSV */}
        {historicoCSV.length > 0 && (
          <div style={{marginTop:32}}>
            <h3>Histórico de Arquivos Gerados</h3>
            <ul style={{listStyle:'none',padding:0}}>
              {historicoCSV.map((item, idx) => (
                <li key={idx} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                  <span style={{fontSize:14,color:'#555',fontFamily:'monospace'}}>{item.nome || 'relatorio_economico.csv'}</span>
                  <span style={{fontSize:14,color:'#333'}}>{item.data}</span>
                  <a href={item.url} download={item.nome || 'relatorio_economico.csv'} target="_blank" rel="noopener noreferrer">
                    <button style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'0.3rem 1.2rem',fontWeight:'bold',cursor:'pointer'}}>Download</button>
                  </a>
                  <button onClick={() => handleExcluirHistorico(idx)} style={{background:'#d32f2f',color:'#fff',border:'none',borderRadius:4,padding:'0.3rem 1.2rem',fontWeight:'bold',cursor:'pointer'}}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}
