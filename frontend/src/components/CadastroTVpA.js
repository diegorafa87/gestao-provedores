import API_URL from '../services/api';
import { IconDownload, IconTrash } from './IconsHistorico';
import React, { useState, useEffect } from 'react';

// Ordem e nomes dos campos para o CSV padrão ANSAT (sem COD_IBGE)
const camposCSV = [
  'CNPJ',
  'ANO',
  'MES',
  'TIPO_CLIENTE',
  'TIPO_MEIO',
  'TIPO_TECNOLOGIA',
  'ACESSOS',
];

// Campos para o formulário (mantém os labels para o usuário)
const camposTVPA = [
  { name: 'ANO', label: 'Ano', required: true, type: 'select', options: ['2024', '2025', '2026'] },
  { name: 'MES', label: 'Mês', required: true, type: 'select', options: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { name: 'UF', label: 'Estado', required: true, type: 'select', options: ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] },
  { name: 'MUNICIPIO', label: 'Município', required: true },
  // { name: 'COD_IBGE', label: 'Código IBGE', required: true }, // Removido do CSV
  { name: 'TIPO_CLIENTE', label: 'Tipo Cliente', required: true, type: 'select', options: ['PF', 'PJ'] },
  { name: 'TIPO_MEIO', label: 'Tipo Meio', required: true, type: 'select', options: ['cabo_coaxial', 'cabo_metalico', 'satelite', 'radio', 'fibra'] },
  { name: 'TIPO_TECNOLOGIA', label: 'Tipo Tecnologia', required: true, type: 'select', options: ['FTTH', 'ETHERNET'] },
  { name: 'ACESSOS', label: 'Acessos', required: false },
];


const codUfToSigla = {
  12: 'AC', 27: 'AL', 13: 'AM', 16: 'AP', 29: 'BA', 23: 'CE', 53: 'DF', 32: 'ES',
  52: 'GO', 21: 'MA', 51: 'MT', 50: 'MS', 31: 'MG', 15: 'PA', 25: 'PB', 41: 'PR',
  26: 'PE', 22: 'PI', 33: 'RJ', 24: 'RN', 43: 'RS', 11: 'RO', 14: 'RR', 42: 'SC',
  28: 'SE', 35: 'SP', 17: 'TO'
};

const CadastroTVpA = ({ cnpj }) => {
  // Remove pontuação do CNPJ
  const [form, setForm] = useState({});
  const historicoKey = `historicoTVpA_${cnpj}`;
  const [historico, setHistorico] = useState(() => {
    const salvo = localStorage.getItem(historicoKey);
    return salvo ? JSON.parse(salvo) : [];
  });
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    fetch('/municipiosIBGE.json')
      .then(resp => resp.json())
      .then(data => setMunicipios(data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [linhas, setLinhas] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLinhas([...linhas, { ...form }]);
    setForm({});
  };

  const handleGerarCSV = () => {
    if (linhas.length === 0) return;
    // Cabeçalho fixo padrão ANSAT
    const header = camposCSV.join(';');
    // Busca CNPJ do cliente selecionado
    let cnpjValue = '';
    try {
      const clienteSel = JSON.parse(localStorage.getItem('clienteSelecionado'));
      if (clienteSel && clienteSel.cnpj) {
        cnpjValue = clienteSel.cnpj;
      }
    } catch {}
    // Monta as linhas do CSV na ordem correta
    const rows = linhas.map(linha => {
      return camposCSV.map(campo => {
        if (campo === 'CNPJ') return cnpjValue;
        return linha[campo] || '';
      }).join(';');
    });
    // Usa CRLF como quebra de linha e garante CRLF ao final
    const csvContent = [header, ...rows].join('\r\n') + '\r\n';
    // Nome do arquivo
    let razao = '';
    let ano = '';
    let mes = '';
    try {
      const clienteSel = JSON.parse(localStorage.getItem('clienteSelecionado'));
      if (clienteSel && clienteSel.razaoSocial) {
        razao = clienteSel.razaoSocial.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }
    } catch {}
    ano = linhas[0].ANO || '';
    mes = linhas[0].MES || '';
    const nomeArquivo = `TVpA_${razao}_${ano}_${mes}.csv`;
    // Download automático
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    const novoHistorico = [{ nome: nomeArquivo, conteudo: csvContent, data: new Date().toLocaleString() }, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem(historicoKey, JSON.stringify(novoHistorico));
    // Não limpa as linhas após gerar o CSV
    // Log da ação no backend
      fetch(`${API_URL}/api/acao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'GERAR_CSV_TVPA',
        usuario: cnpjValue || 'desconhecido',
        detalhes: { nomeArquivo, ano, mes, razao }
      })
    });
  };

  const handleExcluirHistorico = idx => {
    const novo = historico.filter((_, i) => i !== idx);
    setHistorico(novo);
    localStorage.setItem(historicoKey, JSON.stringify(novo));
  };

  return (
    <>
      <div style={{maxWidth:500,margin:'2rem auto',background:'#fff',padding:24,borderRadius:12,boxShadow:'0 2px 8px #0001'}}>
        <h2>Novo Relatório TVpA</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          {camposTVPA.map(campo => (
            <div key={campo.name} style={{display:'flex',flexDirection:'column'}}>
              <label htmlFor={campo.name} style={{fontWeight:600}}>{campo.label}:</label>
              {campo.name === 'CNPJ' ? (
                <input
                  id={campo.name}
                  name={campo.name}
                  value={form[campo.name] || ''}
                  readOnly
                  style={{padding:8,borderRadius:4,border:'1px solid #ccc',background:'#f5f5f5'}}
                />
              ) : campo.name === 'MUNICIPIO' ? (
                <>
                  <input
                    list="municipios-tvpa"
                    id={campo.name}
                    name={campo.name}
                    value={form[campo.name] || ''}
                    onChange={e => {
                      // Ao selecionar, salva apenas o código IBGE no campo
                      let valorDigitado = e.target.value;
                      let codigoIBGE = '';
                      // Se o valor vier no formato "Nome (codigo)", extrai só o código
                      const match = valorDigitado.match(/\((\d{6,7})\)$/);
                      if (match) {
                        codigoIBGE = match[1];
                      } else {
                        // Busca pelo nome e UF
                        const municipioSelecionado = municipios.find(m => {
                          if (form.UF) {
                            const nomeMatch = m.nome === valorDigitado;
                            const ufMatch = (m.uf || m.UF || codUfToSigla[m.codigo_uf]) === form.UF;
                            return nomeMatch && ufMatch;
                          }
                          return false;
                        });
                        if (municipioSelecionado) {
                          codigoIBGE = municipioSelecionado.codigo_ibge || municipioSelecionado.codigo || '';
                        }
                      }
                      setForm(f => ({
                        ...f,
                        [campo.name]: codigoIBGE,
                        COD_IBGE: codigoIBGE
                      }));
                    }}
                    required={campo.required}
                    placeholder={form.UF ? "Digite ou selecione o município" : "Escolha o estado primeiro"}
                    style={{padding:8,borderRadius:4,border:'1px solid #ccc'} }
                    autoComplete="off"
                    disabled={!form.UF}
                  />
                  <datalist id="municipios-tvpa">
                    {municipios.filter(m => {
                      if (form.UF) {
                        if (m.uf || m.UF) return (m.uf || m.UF) === form.UF;
                        if (m.codigo_uf) return codUfToSigla[m.codigo_uf] === form.UF;
                      }
                      return false;
                    }).map(m => (
                      <option
                        key={m.codigo_ibge || m.codigo}
                        value={`${m.nome} (${m.codigo_ibge || m.codigo})`}
                      >
                        {m.nome} ({m.codigo_ibge || m.codigo}) - {(m.uf || m.UF)}
                      </option>
                    ))}
                  </datalist>
                  {/* Mensagem de código IBGE removida conforme solicitado */}
                </>
              ) : campo.type === 'select' ? (
                <select
                  id={campo.name}
                  name={campo.name}
                  value={form[campo.name] || ''}
                  onChange={handleChange}
                  required={campo.required}
                  style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                >
                  <option value="">Selecione</option>
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
          ))}
          <button type="submit" style={{marginTop:16,background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'0.7rem 2rem',fontWeight:'bold',fontSize:16,cursor:'pointer'}}>Salvar Linha</button>
        </form>
        {linhas.length > 0 && (
          <div style={{marginTop:24}}>
            <h4>Linhas salvas:</h4>
            <table style={{width:'100%',background:'#eee',borderRadius:6,padding:8}}>
              <thead>
                <tr>
                  {camposTVPA.map(c => <th key={c.name} style={{textAlign:'left',padding:'4px 8px'}}>{c.label}</th>)}
                  <th style={{textAlign:'center',padding:'4px 8px'}}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, idx) => (
                  <tr key={idx} style={{background: idx%2?'#f9f9f9':'#fff'}}>
                    {camposTVPA.map(c => <td key={c.name} style={{padding:'4px 8px'}}>{linha[c.name]}</td>)}
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
                <tr key={item.nome} style={{background: idx%2?'#fafafa':'#fff'}}>
                  <td style={{padding:'4px 8px'}}>{item.nome}</td>
                  <td style={{padding:'4px 8px'}}>{item.data}</td>
                  <td style={{textAlign:'center',padding:'4px 8px', display:'flex', gap:8, justifyContent:'center'}}>
                    <button onClick={() => {
                      const blob = new Blob([item.conteudo], { type: 'text/csv;charset=utf-8;' });
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

export default CadastroTVpA;
