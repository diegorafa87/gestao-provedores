import React, { useState, useEffect } from 'react';

// Mapeamento de sigla UF para código IBGE
const UF_TO_CODIGO = {
  'RO': 11, 'AC': 12, 'AM': 13, 'RR': 14, 'PA': 15, 'AP': 16, 'TO': 17,
  'MA': 21, 'PI': 22, 'CE': 23, 'RN': 24, 'PB': 25, 'PE': 26, 'AL': 27, 'SE': 28, 'BA': 29,
  'MG': 31, 'ES': 32, 'RJ': 33, 'SP': 35,
  'PR': 41, 'SC': 42, 'RS': 43,
  'MS': 50, 'MT': 51, 'GO': 52, 'DF': 53
};

// Função utilitária para buscar municípios do arquivo JSON (apenas uma definição)
async function fetchMunicipios() {
  try {
    const resp = await fetch('/municipiosIBGE.json');
    if (!resp.ok) return [];
    const data = await resp.json();
    return data;
  } catch {
    return [];
  }
}

const campos = [
  'Ano',
  'Nome da Estação',
  'Número da estação',
  'Latitude',
  'Longitude',
  'UF',
  'Município',
  'Endereço', // Será substituído por subcampos
  'SN_ABERTURA',
  'TP_ESTACAO',
  'SN_ENLACE_PROPRIO',
  'SN_ENLACE_CONTRATADO',
  'SN_ENLACE_SATELITE'
];

export default function EstacoesInfra() {
  const [valores, setValores] = useState(Array(campos.length).fill(''));
  const [municipios, setMunicipios] = useState([]);
  // Subcampos do endereço
  const [endereco, setEndereco] = useState({
    rua: '',
    numero: '',
    bairro: '',
    municipio: '',
    estado: '',
    cep: ''
  });
  // Lista de estações cadastradas
  const [estacoes, setEstacoes] = useState([]);
  // Função para gerar a chave do histórico por CNPJ
  function getHistoricoKey() {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        if (obj.cnpj) return 'historicoCsvEstacoes_' + obj.cnpj.replace(/\D/g, '');
      }
    } catch {}
    return 'historicoCsvEstacoes_semcnpj';
  }

  // Histórico de CSVs gerados (por cliente)
  const [csvHistorico, setCsvHistorico] = useState(() => {
    try {
      const salvo = localStorage.getItem(getHistoricoKey());
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  // Carregar histórico do localStorage sempre que o cliente mudar ou o localStorage for alterado (em outras abas)
  useEffect(() => {
    function atualizarHistorico() {
      try {
        const salvo = localStorage.getItem(getHistoricoKey());
        setCsvHistorico(salvo ? JSON.parse(salvo) : []);
      } catch {
        setCsvHistorico([]);
      }
    }
    atualizarHistorico();
    window.addEventListener('storage', atualizarHistorico);
    return () => window.removeEventListener('storage', atualizarHistorico);
  }, [localStorage.getItem('clienteSelecionado')]);

  useEffect(() => {
    fetchMunicipios().then(setMunicipios);
    // eslint-disable-next-line
  }, []);

  const handleChange = (idx, value) => {
    setValores(v => {
      const novo = [...v];
      // Se for o campo Endereço (posição 8)
      if (idx === 8) {
        novo[8] = value; // Não usado diretamente, mas mantido para compatibilidade
      } else {
        novo[idx] = value;
      }
      return novo;
    });
  };

  // Atualiza subcampos do endereço e concatena na ordem solicitada, mostrando nome do município e UF
  const handleEnderecoChange = (campo, valor) => {
    setEndereco(e => {
      const novo = { ...e, [campo]: valor };
      // Ordem: Rua, Número, Bairro, Municipio, Estado, CEP (todos do bloco Endereço)
      const concat = `${novo.rua}, ${novo.numero}, ${novo.bairro}, ${novo.municipio}, ${novo.estado}, ${novo.cep}`;
      setValores(v => {
        const arr = [...v];
        arr[8] = concat;
        return arr;
      });
      return novo;
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setEstacoes(estacoesAntigas => [...estacoesAntigas, valores]);
    setValores(Array(campos.length).fill(''));
    setEndereco({
      rua: '',
      numero: '',
      bairro: '',
      municipio: '',
      estado: '',
      cep: ''
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{maxWidth:500, margin:'0 auto', background:'#fff', padding:24, borderRadius:8, boxShadow:'0 2px 8px #0001'}}>
        <h2 style={{marginBottom:24}}>Cadastro de Estações</h2>
        {campos.map((campo, idx) => (
          campo === 'Endereço' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>Endereço</label>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <input
                  type="text"
                  value={endereco.rua}
                  onChange={e => handleEnderecoChange('rua', e.target.value)}
                  placeholder="Rua"
                  style={{flex:2, minWidth:120, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
                <input
                  type="text"
                  value={endereco.numero}
                  onChange={e => handleEnderecoChange('numero', e.target.value)}
                  placeholder="Número"
                  style={{flex:1, minWidth:60, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
                <input
                  type="text"
                  value={endereco.bairro}
                  onChange={e => handleEnderecoChange('bairro', e.target.value)}
                  placeholder="Bairro"
                  style={{flex:1.5, minWidth:100, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
                <input
                  type="text"
                  value={endereco.municipio}
                  onChange={e => handleEnderecoChange('municipio', e.target.value)}
                  placeholder="Município"
                  style={{flex:1.5, minWidth:100, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
                <input
                  type="text"
                  value={endereco.estado}
                  onChange={e => handleEnderecoChange('estado', e.target.value)}
                  placeholder="Estado"
                  style={{flex:1, minWidth:60, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
                <input
                  type="text"
                  value={endereco.cep}
                  onChange={e => handleEnderecoChange('cep', e.target.value)}
                  placeholder="CEP"
                  style={{flex:1, minWidth:80, padding:8, borderRadius:4, border:'1px solid #ccc'}}
                />
              </div>
              <div style={{fontSize:12, color:'#888', marginTop:4}}>
                {(endereco.rua || endereco.numero || endereco.bairro || endereco.municipio || endereco.estado || endereco.cep)
                  ? `Endereço completo: ${endereco.rua}, ${endereco.numero}, ${endereco.bairro}, ${endereco.municipio}, ${endereco.estado}, ${endereco.cep}`
                  : ''}
              </div>
            </div>
          ) : campo === 'SN_ABERTURA' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>SN_ABERTURA</label>
              <select
                value={valores[idx]}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  width:'100%',
                  padding:8,
                  borderRadius:4,
                  border:'1px solid #ccc',
                  fontWeight:400,
                  fontSize:15,
                  background:'#fff',
                  color: valores[idx] ? '#222' : '#888',
                  fontStyle: valores[idx] ? 'normal' : 'italic'
                }}
              >
                <option value="" disabled>Tem saída de tráfego/clientes nesta estação?</option>
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </div>
          ) : campo === 'TP_ESTACAO' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>TP_ESTACAO</label>
              <select
                value={valores[idx]}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  width:'100%',
                  padding:8,
                  borderRadius:4,
                  border:'1px solid #ccc',
                  fontWeight:400,
                  fontSize:15,
                  background:'#fff',
                  color: valores[idx] ? '#222' : '#888',
                  fontStyle: valores[idx] ? 'normal' : 'italic'
                }}
              >
                <option value="" disabled>Qual a natureza da estação?</option>
                <option value="propria">propria</option>
                <option value="terceiro">terceiro</option>
                <option value="nuvem">nuvem</option>
                <option value="virtual">virtual</option>
              </select>
            </div>
          ) : campo === 'SN_ENLACE_PROPRIO' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>SN_ENLACE_PROPRIO</label>
              <select
                value={valores[idx]}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  width:'100%',
                  padding:8,
                  borderRadius:4,
                  border:'1px solid #ccc',
                  fontWeight:400,
                  fontSize:15,
                  background:'#fff',
                  color: valores[idx] ? '#222' : '#888',
                  fontStyle: valores[idx] ? 'normal' : 'italic'
                }}
              >
                <option value="" disabled>Possui enlace próprio interligando ela?</option>
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </div>
          ) : campo === 'SN_ENLACE_CONTRATADO' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>SN_ENLACE_CONTRATADO</label>
              <select
                value={valores[idx]}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  width:'100%',
                  padding:8,
                  borderRadius:4,
                  border:'1px solid #ccc',
                  fontWeight:400,
                  fontSize:15,
                  background:'#fff',
                  color: valores[idx] ? '#222' : '#888',
                  fontStyle: valores[idx] ? 'normal' : 'italic'
                }}
              >
                <option value="" disabled>Possui enlace de terceiros interligando ela?</option>
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </div>
          ) : campo === 'SN_ENLACE_SATELITE' ? (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight:700,
                marginBottom:4
              }}>SN_ENLACE_SATELITE</label>
              <select
                value={valores[idx]}
                onChange={e => handleChange(idx, e.target.value)}
                style={{
                  width:'100%',
                  padding:8,
                  borderRadius:4,
                  border:'1px solid #ccc',
                  fontWeight:400,
                  fontSize:15,
                  background:'#fff',
                  color: valores[idx] ? '#222' : '#888',
                  fontStyle: valores[idx] ? 'normal' : 'italic'
                }}
              >
                <option value="" disabled>Possui conexão via satélite?</option>
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </div>
          ) : (
            <div key={campo} style={{marginBottom:16}}>
              <label style={{
                display:'block',
                fontWeight: (idx === 0 || campo === 'Nome da Estação' || campo === 'Número da estação' || campo === 'Latitude' || campo === 'Longitude' || campo === 'UF' || campo === 'Município' || campo === 'Endereço') ? 700 : 500,
                marginBottom:4,
                color: idx === 0 ? '#111' : undefined
              }}>{campo}</label>
              {idx === 0 ? (
                <select
                  value={valores[0]}
                  onChange={e => handleChange(0, e.target.value)}
                  style={{
                    width:'100%',
                    padding:8,
                    borderRadius:4,
                    border:'1px solid #ccc',
                    fontWeight:400,
                    fontSize:16,
                    background:'#f3f6fa',
                    color:'#222',
                    boxShadow:'none',
                    letterSpacing:0
                  }}
                >
                  <option value="">Selecione o ano</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              ) : campo === 'UF' ? (
                <select
                  value={valores[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  style={{
                    width:'100%',
                    padding:8,
                    borderRadius:4,
                    border:'1px solid #ccc',
                    fontWeight:400,
                    fontSize:15,
                    background:'#fff',
                    color:'#222'
                  }}
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre (AC)</option>
                  <option value="AL">Alagoas (AL)</option>
                  <option value="AP">Amapá (AP)</option>
                  <option value="AM">Amazonas (AM)</option>
                  <option value="BA">Bahia (BA)</option>
                  <option value="CE">Ceará (CE)</option>
                  <option value="DF">Distrito Federal (DF)</option>
                  <option value="ES">Espírito Santo (ES)</option>
                  <option value="GO">Goiás (GO)</option>
                  <option value="MA">Maranhão (MA)</option>
                  <option value="MT">Mato Grosso (MT)</option>
                  <option value="MS">Mato Grosso do Sul (MS)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="PA">Pará (PA)</option>
                  <option value="PB">Paraíba (PB)</option>
                  <option value="PR">Paraná (PR)</option>
                  <option value="PE">Pernambuco (PE)</option>
                  <option value="PI">Piauí (PI)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                  <option value="RN">Rio Grande do Norte (RN)</option>
                  <option value="RS">Rio Grande do Sul (RS)</option>
                  <option value="RO">Rondônia (RO)</option>
                  <option value="RR">Roraima (RR)</option>
                  <option value="SC">Santa Catarina (SC)</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="SE">Sergipe (SE)</option>
                  <option value="TO">Tocantins (TO)</option>
                </select>
              ) : campo === 'Município' ? (
                <>
                  <input
                    list="municipios-ibge"
                    value={valores[idx]}
                    onChange={e => handleChange(idx, e.target.value)}
                    placeholder={valores[5] ? "Digite ou selecione o município" : "Escolha o estado primeiro"}
                    style={{
                      width:'100%',
                      padding:8,
                      borderRadius:4,
                      border:'1px solid #ccc',
                      fontWeight:400,
                      fontSize:15,
                      background:'#fff',
                      color:'#222'
                    }}
                    disabled={!valores[5]}
                    autoComplete="off"
                  />
                  <datalist id="municipios-ibge">
                    {(() => {
                      const codigoUF = UF_TO_CODIGO[valores[5]];
                      return municipios.filter(m => m.codigo_uf === codigoUF).map(m => (
                        <option key={m.codigo_ibge || m.nome} value={m.codigo_ibge}>
                          {m.nome}
                        </option>
                      ));
                    })()}
                  </datalist>
                </>
              ) : (
                <input
                  type="text"
                  value={valores[idx]}
                  onChange={e => handleChange(idx, e.target.value)}
                  placeholder={campo === 'Nome da Estação' ? 'Nome que você dá a sua estação' : campo === 'Número da estação' ? 'Número da estação no sistema da Anatel.' : campo === 'Latitude' && idx === 3 ? 'Latitude em graus decimais. Ex.: -23,5505' : campo === 'Longitude' && idx === 4 ? 'Longitude em graus decimais. Ex.: -46,6333' : ''}
                  style={{
                    width:'100%',
                    padding:8,
                    borderRadius:4,
                    border:'1px solid #ccc',
                    fontWeight:400,
                    fontSize:15,
                    background:'#fff',
                    color:'#222',
                    fontStyle: ((campo === 'Nome da Estação' || campo === 'Número da estação' || (campo === 'Latitude' && idx === 3) || (campo === 'Longitude' && idx === 4)) && !valores[idx]) ? 'italic' : 'normal'
                  }}
                />
              )}
            </div>
          )
        ))}
        <button type="submit" style={{marginTop:16, padding:'10px 24px', background:'#1976d2', color:'#fff', border:'none', borderRadius:4, fontWeight:600, fontSize:16, cursor:'pointer'}}>Salvar</button>
      </form>
      {/* Lista de estações cadastradas */}
      {estacoes.length > 0 && (
        <div style={{maxWidth:900, margin:'32px auto 0', background:'#fff', padding:24, borderRadius:8, boxShadow:'0 2px 8px #0001'}}>
          <h3 style={{marginBottom:16}}>Estações cadastradas</h3>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {campos.map((campo, idx) => (
                  <th key={idx} style={{borderBottom:'1px solid #ccc', padding:'8px 4px', textAlign:'left', fontWeight:700, fontSize:15}}>{campo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estacoes.map((est, i) => (
                <tr key={i} style={{background: i%2 ? '#f8f9fb' : '#fff'}}>
                  {est.map((valor, j) => (
                    <td key={j} style={{padding:'8px 4px', fontSize:15}}>{valor}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => {
            // Cabeçalho igual ao EX_ESTACOES.csv
            const header = [
              'CNPJ',
              'ANO',
              'ID_ESTACAO',
              'NU_ESTACAO_BDTA_ANATEL',
              'LAT',
              'LONG',
              'CO_MUNICIPIO_IBGE',
              'ENDERECO',
              'SN_ABERTURA',
              'TP_ESTACAO',
              'SN_ENLACE_PROPRIO',
              'SN_ENLACE_CONTRATADO',
              'SN_ENLACE_SATELITE'
            ];
            // Recupera o CNPJ do cliente do localStorage
            let cnpj = '';
            try {
              const salvo = localStorage.getItem('clienteSelecionado');
              if (salvo) {
                const obj = JSON.parse(salvo);
                cnpj = (obj.cnpj || '').replace(/[\.\/-]/g, '');
              }
            } catch {}
            // Mapear os dados para a ordem correta
            const csvRows = [
              header.join(';'),
              ...estacoes.map(est => {
                // O campo endereço é sempre salvo na posição 8 como string completa
                // Garantir que não haja ; no endereço
                let enderecoCompleto = est[8] ? String(est[8]).replace(/;/g, ',') : '';
                return [
                  cnpj,
                  est[0] || '', // ANO
                  est[1] || '', // ID_ESTACAO (Nome da Estação)
                  est[2] || '', // NU_ESTACAO_BDTA_ANATEL (Número da estação)
                  est[3] || '', // LAT
                  est[4] || '', // LONG
                  est[6] || '', // CO_MUNICIPIO_IBGE
                  enderecoCompleto, // ENDERECO
                  est[9] || '', // SN_ABERTURA
                  est[10] || '', // TP_ESTACAO
                  est[11] || '', // SN_ENLACE_PROPRIO
                  est[12] || '', // SN_ENLACE_CONTRATADO
                  est[13] || ''  // SN_ENLACE_SATELITE
                ].join(';');
              })
            ];
            // Usa CRLF como quebra de linha e garante CRLF ao final
            const csvContent = csvRows.join('\r\n') + '\r\n';
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'estacoes.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Salvar histórico no localStorage
            const data = new Date();
            // Recuperar razão social do cliente selecionado
            let razaoSocial = '';
            try {
              const salvo = localStorage.getItem('clienteSelecionado');
              if (salvo) {
                const obj = JSON.parse(salvo);
                razaoSocial = (obj.razaoSocial || '').replace(/[^a-zA-Z0-9]/g, '_');
              }
            } catch {}
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const nomeArquivo = `ESTACOES_${razaoSocial}_${ano}_${mes}.csv`;
            const historicoItem = {
              nome: nomeArquivo,
              conteudo: csvContent,
              data: data.toLocaleString()
            };
            let novoHistorico = [historicoItem, ...csvHistorico];
            // Limitar histórico a 10 arquivos
            if (novoHistorico.length > 10) novoHistorico = novoHistorico.slice(0, 10);
            setCsvHistorico(novoHistorico);
            localStorage.setItem(getHistoricoKey(), JSON.stringify(novoHistorico));
          }}
            style={{marginTop:24, padding:'10px 24px', background:'#388e3c', color:'#fff', border:'none', borderRadius:4, fontWeight:700, fontSize:16, cursor:'pointer'}}
          >Gerar CSV</button>
        </div>
      )}
      {/* Histórico de CSVs gerados */}
      {csvHistorico.length > 0 && (
        <div style={{marginTop:32}}>
          <h4 style={{marginBottom:8}}>Histórico de CSVs gerados</h4>
          <ul style={{paddingLeft:0, listStyle:'none'}}>
            {csvHistorico.map((item, idx) => (
              <li key={idx} style={{marginBottom:6, fontSize:15, display:'flex', alignItems:'center', gap:12}}>
                <span style={{fontWeight:500}}>{item.nome} <span style={{color:'#888', fontSize:13}}>({item.data})</span></span>
                <button
                  style={{background:'#1976d2', color:'#fff', border:'none', borderRadius:3, padding:'2px 10px', fontSize:13, cursor:'pointer', marginLeft:4}}
                  title="Baixar este CSV"
                  onClick={() => {
                    const blob = new Blob([item.conteudo], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', item.nome);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >Baixar</button>
                <button
                  style={{background:'#e53935', color:'#fff', border:'none', borderRadius:3, padding:'2px 10px', fontSize:13, cursor:'pointer'}}
                  title="Excluir este CSV do histórico"
                  onClick={() => {
                    const novoHistorico = csvHistorico.filter((_, i) => i !== idx);
                    setCsvHistorico(novoHistorico);
                    localStorage.setItem(getHistoricoKey(), JSON.stringify(novoHistorico));
                  }}
                >Excluir</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
