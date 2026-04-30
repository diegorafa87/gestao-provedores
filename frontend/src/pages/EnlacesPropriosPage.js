          <>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>ESTAÇÃO B</span>
                <input
                  type="text"
                  placeholder="Nome/ID da estação de origem. Deve ser o mesmo de Estações."
                  style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>ID ENLACE</span>
                <input
                  type="text"
                  placeholder="ID do enlace"
                  style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
                />
              </label>
            </div>
          </>
import React, { useState, useEffect } from 'react';
import MenuLateral from '../components/MenuLateral';

// Gera a chave do histórico por CNPJ
function getHistoricoKey() {
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.cnpj) return 'historicoEnlacesProprios_' + obj.cnpj.replace(/\D/g, '');
    }
  } catch {}
  return 'historicoEnlacesProprios_semcnpj';
}

const historicoKey = getHistoricoKey();

export default function EnlacesPropriosPage() {
  const [ano, setAno] = useState('2024');
  const [form, setForm] = useState({
    ANO: '2024',
    ESTACAO_A: '',
    ESTACAO_B: '',
    ID_ENLACE: '',
    MEIO: '',
    CAPACIDADE: '',
    SWAP: '',
    GEOMETRIA: '',
    SRID: ''
  });
  const [linhas, setLinhas] = useState([]);
  const [historico, setHistorico] = useState([]);

  // Carrega histórico do localStorage ao iniciar e sempre que o cliente mudar
  useEffect(() => {
    const key = getHistoricoKey();
    try {
      const salvo = localStorage.getItem(key);
      if (salvo) setHistorico(JSON.parse(salvo));
      else setHistorico([]);
    } catch {
      setHistorico([]);
    }
  }, [localStorage.getItem('clienteSelecionado')]);

  // Recupera info do cliente do localStorage
  let clienteInfo = null;
  try {
    const salvo = localStorage.getItem('clienteSelecionado');
    if (salvo) {
      const obj = JSON.parse(salvo);
      if (obj.razaoSocial && obj.cnpj) {
        clienteInfo = (
          <>
            <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{obj.razaoSocial}</div>
            <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {obj.cnpj}</div>
          </>
        );
      }
    }
  } catch {}

  // Atualiza o form ao digitar
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Salva a linha atual
  const handleSalvarLinha = e => {
    if (e) e.preventDefault();
    setLinhas([...linhas, { ...form }]);
    setForm({
      ANO: ano,
      ESTACAO_A: '',
      ESTACAO_B: '',
      ID_ENLACE: '',
      MEIO: '',
      CAPACIDADE: '',
      SWAP: '',
      GEOMETRIA: '',
      SRID: ''
    });
  };

  // Gera o CSV, salvando a linha antes se necessário
  const handleGerarCSV = () => {
    // Se o form atual tem dados, salva antes de exportar
    const algumCampoPreenchido = Object.values(form).some(v => v && v !== '');
    let novasLinhas = linhas;
    if (algumCampoPreenchido) {
      novasLinhas = [...linhas, { ...form }];
      setLinhas(novasLinhas);
      setForm({
        ANO: ano,
        ESTACAO_A: '',
        ESTACAO_B: '',
        ID_ENLACE: '',
        MEIO: '',
        CAPACIDADE: '',
        SWAP: '',
        GEOMETRIA: '',
        SRID: ''
      });
    }
      if (novasLinhas.length === 0) return;
      // Busca razão social e CNPJ do cliente
      let razao = '';
      let cnpj = '';
      try {
        const clienteSel = JSON.parse(localStorage.getItem('clienteSelecionado'));
        if (clienteSel && clienteSel.razaoSocial) {
          razao = clienteSel.razaoSocial.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        }
        if (clienteSel && clienteSel.cnpj) {
          cnpj = clienteSel.cnpj.replace(/\D/g, '');
        }
      } catch {}
      if (!razao) razao = 'CLIENTE';
      if (!cnpj) cnpj = '';
      const nomeArquivo = `ENLACES_PROPRIOS_${ano}_${razao}.csv`;

      // Cabeçalho e ordem dos campos conforme modelo
      const ordemCampos = ['CNPJ','ANO','ID_ESTACAO_A','ID_ESTACAO_B','ID_ENLACE','TP_MEIO_TRANSPORTE','CAPACIDADE_NOMINAL','SN_SWAP','GEOMETRIA_WKT','SRID'];
      const header = ordemCampos.join(';');
      const rows = novasLinhas.map(linha => {
        return [
          cnpj,
          linha.ANO || '',
          linha.ESTACAO_A || '',
          linha.ESTACAO_B || '',
          linha.ID_ENLACE || '',
          linha.MEIO || '',
          linha.CAPACIDADE || '',
          linha.SWAP || '',
          linha.GEOMETRIA || '',
          linha.SRID || ''
        ].join(';');
      });
      // Usa CRLF como quebra de linha e garante CRLF ao final
      const csvContent = [header, ...rows].join('\r\n') + '\r\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Salva histórico
    const novoHistorico = [{ nome: nomeArquivo, conteudo: csvContent, data: new Date().toLocaleString() }, ...historico];
    setHistorico(novoHistorico);
    localStorage.setItem(getHistoricoKey(), JSON.stringify(novoHistorico));
    setLinhas([]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={<a href="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</a>}
        clienteInfo={clienteInfo}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 600, width: '100%' }}>
          <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Enlaces Próprios</h2>
          {/* Formulário */}
          {/* ...formulário permanece igual... */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600 }}>
              Ano
              <select name="ANO" value={form.ANO} onChange={e => { setAno(e.target.value); handleChange(e); }} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>ESTAÇÃO A</span>
              <input
                type="text"
                name="ESTACAO_A"
                value={form.ESTACAO_A}
                onChange={handleChange}
                placeholder="Nome/ID da estação de origem. Deve ser o mesmo de Estações."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>ESTAÇÃO B</span>
              <input
                type="text"
                name="ESTACAO_B"
                value={form.ESTACAO_B}
                onChange={handleChange}
                placeholder="Nome/ID da estação de origem. Deve ser o mesmo de Estações."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>ID ENLACE</span>
              <input
                type="text"
                name="ID_ENLACE"
                value={form.ID_ENLACE}
                onChange={handleChange}
                placeholder="Código único deste enlace"
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>MEIO</span>
              <input
                type="text"
                name="MEIO"
                value={form.MEIO}
                onChange={handleChange}
                placeholder="Tipo de transporte utilizado \nEx: FIBRA OPTICA, RADIO, etc."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>CAPACIDADE</span>
              <input
                type="text"
                name="CAPACIDADE"
                value={form.CAPACIDADE}
                onChange={handleChange}
                placeholder="Ex: 1 Gbps, 100 Mbps, etc."
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>SWAP?</span>
              <select
                name="SWAP"
                value={form.SWAP}
                onChange={handleChange}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic', color: '#888' }}
              >
                <option value="" disabled>É contrato de troca (swap)?</option>
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>GEOMETRIA</span>
              <input
                type="text"
                name="GEOMETRIA"
                value={form.GEOMETRIA}
                onChange={handleChange}
                placeholder={`Coordenadas do percurso \n(WKT) \nEx: LINESTRING(-46.1 -23.5, -46.2 -23.6)`}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>SRID</span>
              <input
                type="text"
                name="SRID"
                value={form.SRID}
                onChange={handleChange}
                placeholder={`Código do sistema de mapas\nGeralmente 4326 (WGS 84)`}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={handleSalvarLinha} style={{ padding: '10px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Salvar Linha</button>
            <button onClick={handleGerarCSV} style={{ padding: '10px 18px', background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Gerar CSV</button>
          </div>

          {/* Tabela de linhas salvas */}
          {linhas.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#1976d2', marginBottom: 12, fontSize: 18 }}>Linhas salvas</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Ano</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Estação A</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Estação B</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>ID Enlace</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Meio</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Capacidade</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Swap?</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>Geometria</th>
                      <th style={{ border: '1px solid #ccc', padding: 6 }}>SRID</th>
                      <th style={{ border: '1px solid #ccc', padding: 6, textAlign:'center' }}>Excluir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((linha, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.ANO}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.ESTACAO_A}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.ESTACAO_B}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.ID_ENLACE}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.MEIO}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.CAPACIDADE}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.SWAP}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.GEOMETRIA}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.SRID}</td>
                        <td style={{ border: '1px solid #ccc', padding: 6, textAlign:'center' }}>
                          <button onClick={() => setLinhas(linhas.filter((_, i) => i !== idx))} style={{background:'none',border:'none',cursor:'pointer',color:'#d32f2f',fontSize:18}} title="Excluir linha" aria-label="Excluir linha">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {/* Histórico de arquivos gerados FORA do container do formulário */}
        {historico.length > 0 && (
          <div style={{marginTop:32, background:'#fff', borderRadius:12, boxShadow:'0 2px 8px #0001', padding:32, maxWidth:900, width:'100%'}}>
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
                    <td style={{textAlign:'center'}}>
                      <button onClick={() => {
                        const blob = new Blob([item.conteudo], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.setAttribute('download', item.nome);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }} style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:4,padding:'2px 10px',marginRight:8,cursor:'pointer'}}>Baixar</button>
                      <button onClick={() => {
                        const novoHistorico = historico.filter((_, i) => i !== idx);
                        setHistorico(novoHistorico);
                        localStorage.setItem(historicoKey, JSON.stringify(novoHistorico));
                      }} style={{background:'#d32f2f',color:'#fff',border:'none',borderRadius:4,padding:'2px 10px',cursor:'pointer'}}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
