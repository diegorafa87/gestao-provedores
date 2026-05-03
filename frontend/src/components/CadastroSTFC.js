import API_URL from '../services/api';
import { IconDownload, IconTrash } from './IconsHistorico';
import React, { useState, useEffect } from 'react';

// Ordem e nomes dos campos para o CSV STFC padrão ANSAT
const camposCSV_STFC = [
  'CNPJ',
  'ANO',
  'MES',
  'COD_IBGE',
  'TIPO_CLIENTE',
  'TIPO_ATENDIMENTO',
  'TIPO_MEIO',
  'ACESSOS',
];

// Campos para o formulário (mantém os labels para o usuário)
const camposSTFC = [
  { name: 'ANO', label: 'Ano', required: true, type: 'select', options: ['2024', '2025', '2026'] },
  { name: 'MES', label: 'Mês', required: true, type: 'select', options: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { name: 'UF', label: 'Estado', required: true, type: 'select', options: ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] },
  { name: 'MUNICIPIO', label: 'Município', required: true, type: 'select' },
  { name: 'TIPO_CLIENTE', label: 'Tipo Cliente', required: true, type: 'select', options: ['PF', 'PJ'] },
  { name: 'TIPO_ATENDIMENTO', label: 'Tipo Atendimento', required: true, type: 'select', options: ['URBANO', 'RURAL'] },
  { name: 'TIPO_MEIO', label: 'Tipo Meio', required: true, type: 'select', options: ['fibra', 'cabo_coaxial', 'cabo_metalico'] },
  { name: 'ACESSOS', label: 'Acessos', required: false },
];

const CadastroSTFC = ({ cnpj }) => {
  const cnpjLimpo = (cnpj || '').replace(/[\.\/-]/g, '');
  // Sempre inicializa o form com CNPJ preenchido
  const [form, setForm] = useState(() => ({ CNPJ: cnpjLimpo }));
  const historicoKey = `historicoSTFC_${cnpj}`;
  const [historico, setHistorico] = useState(() => {
    const salvo = localStorage.getItem(historicoKey);
    return salvo ? JSON.parse(salvo) : [];
  });
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    fetch('/municipiosIBGE.json')
      .then(resp => resp.json())
      .then(data => {
        // Mapeia para o formato { nome, uf, codigo }
        const codUfToSigla = {
          12: 'AC', 27: 'AL', 13: 'AM', 16: 'AP', 29: 'BA', 23: 'CE', 53: 'DF', 32: 'ES',
          52: 'GO', 21: 'MA', 51: 'MT', 50: 'MS', 31: 'MG', 15: 'PA', 25: 'PB', 41: 'PR',
          26: 'PE', 22: 'PI', 33: 'RJ', 24: 'RN', 43: 'RS', 11: 'RO', 14: 'RR', 42: 'SC',
          28: 'SE', 35: 'SP', 17: 'TO'
        };
        setMunicipios(data.map(m => ({
          nome: m.nome,
          uf: codUfToSigla[m.codigo_uf],
          codigo: m.codigo_ibge ? String(m.codigo_ibge) : ''
        })));
      });
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'CNPJ') return;
    if (e.target.name === 'UF') {
      setForm(prev => ({ ...prev, UF: e.target.value, MUNICIPIO: '' }));
    } else if (e.target.name === 'MUNICIPIO') {
      setForm(prev => ({ ...prev, MUNICIPIO: e.target.value }));
    } else {
      setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const [linhas, setLinhas] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Garante que todos os campos estejam presentes na linha
    const novaLinha = {};
    camposSTFC.forEach(campo => {
      if (campo.name === 'CNPJ') {
        novaLinha[campo.name] = cnpjLimpo;
      } else {
        novaLinha[campo.name] = form[campo.name] || '';
      }
    });
    // Garante que COD_IBGE seja preenchido com o valor do campo MUNICIPIO
    novaLinha["COD_IBGE"] = form["MUNICIPIO"] || '';
    setLinhas([...linhas, novaLinha]);
    setForm({ CNPJ: cnpjLimpo });
  };

  const handleGerarCSV = () => {
    if (linhas.length === 0) return;
    // Cabeçalho fixo padrão ANSAT, separador ponto e vírgula
    const header = camposCSV_STFC.join(';');
    // Monta as linhas do CSV na ordem correta, separador vírgula
    const rows = linhas.map(linha => {
      return camposCSV_STFC.map(campo => {
        if (campo === 'CNPJ') return cnpjLimpo;
        return linha[campo] || '';
      }).join(';');
    });
    // Usa CRLF como quebra de linha, sem linha em branco final
    let csvContent = [header, ...rows].join('\r\n');
    // Busca razão social do localStorage se não vier via props
    let nomeRazao = '';
    if (typeof window !== 'undefined') {
      try {
        const salvo = localStorage.getItem('clienteSelecionado');
        if (salvo) {
          const obj = JSON.parse(salvo);
          nomeRazao = obj.razaoSocial;
        }
      } catch {}
    }
    if (!nomeRazao && typeof cliente !== 'undefined' && cliente && cliente.razaoSocial) {
      nomeRazao = cliente.razaoSocial;
    }
    nomeRazao = (nomeRazao || 'CLIENTE').replace(/[^a-zA-Z0-9]/g, '_');
    let ano = linhas[0]?.ANO || '';
    let mes = linhas[0]?.MES || '';
    const nomeArquivo = `STFC_${nomeRazao}_${ano}_${mes}.csv`;
    // Força BOM UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
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
        acao: 'GERAR_CSV_STFC',
        usuario: cnpj || 'desconhecido',
        detalhes: { nomeArquivo }
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
        <h2>Novo Relatório STFC</h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          {camposSTFC.map(campo => {
            // Campo MUNICIPIO: input com datalist igual SCM
            if (campo.name === 'MUNICIPIO') {
              const municipiosFiltrados = municipios.filter(m => m.uf === form.UF);
              return (
                <div key={campo.name} style={{display:'flex',flexDirection:'column'}}>
                  <label htmlFor={campo.name} style={{fontWeight:600}}>{campo.label}:</label>
                  <input
                    list="municipios-ibge"
                    id={campo.name}
                    name={campo.name}
                    value={form[campo.name] || ''}
                    onChange={handleChange}
                    required={campo.required}
                    placeholder={form.UF ? "Digite ou selecione o município" : "Escolha o estado primeiro"}
                    style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                    autoComplete="off"
                    disabled={!form.UF}
                  />
                  <datalist id="municipios-ibge">
                    {municipiosFiltrados.map(m => (
                      <option key={m.codigo} value={m.codigo}>{m.nome} - {m.uf} ({m.codigo})</option>
                    ))}
                  </datalist>
                </div>
              );
            }
            // Demais campos
            return (
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
                    <option value="">Selecione</option>
                    {campo.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={campo.name}
                    name={campo.name}
                    value={campo.name === 'CNPJ' ? cnpjLimpo : (form[campo.name] || '')}
                    onChange={handleChange}
                    required={campo.required}
                    style={{padding:8,borderRadius:4,border:'1px solid #ccc'}}
                    readOnly={campo.readonly}
                  />
                )}
              </div>
            );
          })}
          <button type="submit" style={{marginTop:16,background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'0.7rem 2rem',fontWeight:'bold',fontSize:16,cursor:'pointer'}}>Salvar Linha</button>
        </form>
        {linhas.length > 0 && (
          <div style={{marginTop:24}}>
            <h4>Linhas salvas:</h4>
            <table style={{width:'100%',background:'#eee',borderRadius:6,padding:8}}>
              <thead>
                <tr>
                  {camposSTFC.map(c => <th key={c.name} style={{textAlign:'left',padding:'4px 8px'}}>{c.label}</th>)}
                  <th style={{textAlign:'center',padding:'4px 8px'}}>Excluir</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha, idx) => (
                  <tr key={idx} style={{background: idx%2?'#f9f9f9':'#fff'}}>
                    {camposSTFC.map(c => <td key={c.name} style={{padding:'4px 8px'}}>{linha[c.name]}</td>)}
                    <td style={{textAlign:'center'}}>
                      <button onClick={() => setLinhas(linhas.filter((_, i) => i !== idx))} style={{background:'#d32f2f',color:'#fff',border:'none',borderRadius:4,padding:'2px 10px',cursor:'pointer'}}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleGerarCSV} style={{marginTop:12,background:'#388e3c',color:'#fff',border:'none',borderRadius:4,padding:'0.7rem 2rem',fontWeight:'bold',fontSize:16,cursor:'pointer'}}>Gerar CSV</button>
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
                      const header = 'CNPJ,ANO,MES,COD_IBGE,TIPO_CLIENTE,TIPO_ATENDIMENTO,TIPO_MEIO,ACESSOS';
                      let linhas = conteudo.split(/\r?\n/);
                      linhas[0] = header;
                      conteudo = linhas.join('\r\n');
                      // Remove linha em branco final
                      conteudo = conteudo.replace(/(\r\n)+$/g, '');
                      // Força CRLF em todas as linhas
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

export default CadastroSTFC;
