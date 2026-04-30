import React, { useState, useEffect } from 'react';
import { salvarHistoricoNoStorage, carregarHistoricoDoStorage } from '../utils/localStorageHistorico';
import MenuLateral from '../components/MenuLateral';
import { Link, useLocation } from 'react-router-dom';

export default function EnlacesContratadosPage() {
  // Carrega valores salvos do formulário do localStorage
  const formStorageKey = 'enlacesContratadosForm';
  const formStorage = (() => {
    try {
      return JSON.parse(localStorage.getItem(formStorageKey)) || {};
    } catch { return {}; }
  })();
  const [ano, setAno] = useState(formStorage.ano || '2024');
  const [origem, setOrigem] = useState(formStorage.origem || '');
  const [destino, setDestino] = useState(formStorage.destino || '');
  const [idEnlace, setIdEnlace] = useState(formStorage.idEnlace || '');
  const [meio, setMeio] = useState(formStorage.meio || '');
  const [cnpj, setCnpj] = useState(formStorage.cnpj || '');
  const [linhas, setLinhas] = useState([]);
  // Recupera info do cliente do localStorage
  const location = useLocation();
  const [clienteSelecionado, setClienteSelecionado] = useState({ cnpj: 'semcnpj' });

  // Sempre que a rota mudar, recarrega o clienteSelecionado e o histórico
  useEffect(() => {
    try {
      const salvo = localStorage.getItem('clienteSelecionado');
      if (salvo) {
        const obj = JSON.parse(salvo);
        if (obj.cnpj) {
          setClienteSelecionado(obj);
          return;
        }
      }
    } catch {}
    setClienteSelecionado({ cnpj: 'semcnpj' });
  }, [location]);

  const [historicoArquivos, setHistoricoArquivos] = useState([]);

  // Sempre que o clienteSelecionado.cnpj mudar, recarrega o histórico correto
  useEffect(() => {
    setHistoricoArquivos(carregarHistoricoDoStorage(clienteSelecionado.cnpj));
  }, [clienteSelecionado.cnpj]);

  function gerarCSV() {
    if (!linhas || linhas.length === 0) return;
    const header = ['Ano', 'Origem', 'Destino', 'ID Enlace', 'Meio', 'CNPJ'];
    const csvRows = [header.join(';')];
    linhas.forEach(linha => {
      csvRows.push([
        linha.ano,
        '"' + (linha.origem || '') + '"',
        '"' + (linha.destino || '') + '"',
        '"' + (linha.idEnlace || '') + '"',
        '"' + (linha.meio || '') + '"',
        '"' + (linha.cnpj || '') + '"'
      ].join(';'));
    });
    // Usa CRLF como quebra de linha e garante CRLF ao final
    const csvContent = csvRows.join('\r\n') + '\r\n';
    let razao = '';
    try {
      if (clienteSelecionado && clienteSelecionado.razaoSocial) {
        razao = clienteSelecionado.razaoSocial.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }
    } catch {}
    const fileName = `ENL_CONTR_${razao || 'SEMRAZAO'}_${ano}`;
    // Download removido daqui. Agora só pelo botão do histórico.
    setHistoricoArquivos(prev => {
      const novo = [
        { nome: fileName, conteudo: csvContent, data: new Date().toLocaleString() },
        ...prev
      ];
      salvarHistoricoNoStorage(novo, clienteSelecionado.cnpj);
      return novo;
    });
  }

  function handleCnpjChange(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 14);
    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
    value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    setCnpj(value);
    // Salva no localStorage
    localStorage.setItem(formStorageKey, JSON.stringify({
      ano, origem, destino, idEnlace, meio, cnpj: value
    }));
  }

  function handleSalvarLinha() {
    setLinhas([
      ...linhas,
      {
        ano,
        origem,
        destino,
        idEnlace,
        meio,
        cnpj
      }
    ]);
    setOrigem('');
    setDestino('');
    setIdEnlace('');
    setMeio('');
    setCnpj('');
    // Limpa o localStorage do formulário
    localStorage.removeItem(formStorageKey);
  }

  useEffect(() => {
    salvarHistoricoNoStorage(historicoArquivos, clienteSelecionado.cnpj);
  }, [historicoArquivos, clienteSelecionado.cnpj]);

  // Recupera info do cliente do localStorage (apenas para exibir)
  const [clienteInfo, setClienteInfo] = useState(null);
  useEffect(() => {
    if (clienteSelecionado && clienteSelecionado.razaoSocial && clienteSelecionado.cnpj) {
      setClienteInfo(
        <div style={{marginBottom: 16, textAlign: 'center'}}>
          <div style={{fontWeight:700, fontSize: '1.1rem', color: '#fff'}}>{clienteSelecionado.razaoSocial}</div>
          <div style={{fontWeight:500, fontSize: '0.95rem', color: '#fff'}}>CNPJ: {clienteSelecionado.cnpj}</div>
        </div>
      );
    } else {
      setClienteInfo(null);
    }
  }, [clienteSelecionado]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <MenuLateral
        voltarLink={<Link to="/" style={{textDecoration:'none',color:'#1976d2',fontWeight:'bold',fontSize:'1.1rem',display:'block',marginBottom:'1.5rem',marginTop:'1rem'}}>&larr; Voltar</Link>}
        clienteInfo={clienteInfo}
      />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 0' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 400, width: '100%' }}>
          <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Enlaces Contratados</h2>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600 }}>
              Ano
              <select value={ano} onChange={e => { setAno(e.target.value); localStorage.setItem(formStorageKey, JSON.stringify({ ano: e.target.value, origem, destino, idEnlace, meio, cnpj })); }} style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Estação de Origem (ID)
              <input
                type="text"
                placeholder="O código de identificação da estação de onde parte o sinal."
                value={origem}
                onChange={e => { setOrigem(e.target.value); localStorage.setItem(formStorageKey, JSON.stringify({ ano, origem: e.target.value, destino, idEnlace, meio, cnpj })); }}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Estação de Destino (ID)
              <input
                type="text"
                placeholder="O código de identificação da estação onde chega o sinal."
                value={destino}
                onChange={e => { setDestino(e.target.value); localStorage.setItem(formStorageKey, JSON.stringify({ ano, origem, destino: e.target.value, idEnlace, meio, cnpj })); }}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Identificação do Link (ID Enlace)
              <input
                type="text"
                placeholder="O código único desse circuito/link. Atenção: Não repita códigos no mesmo arquivo."
                value={idEnlace}
                onChange={e => { setIdEnlace(e.target.value); localStorage.setItem(formStorageKey, JSON.stringify({ ano, origem, destino, idEnlace: e.target.value, meio, cnpj })); }}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              Meio de Transporte
              <input
                type="text"
                placeholder="Como o sinal é transmitido (Ex: Fibra Óptica, Rádio, Satélite)."
                value={meio}
                onChange={e => { setMeio(e.target.value); localStorage.setItem(formStorageKey, JSON.stringify({ ano, origem, destino, idEnlace, meio: e.target.value, cnpj })); }}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
              CNPJ da Fornecedora
              <input
                type="text"
                placeholder="Se o link for contratado de terceiros, informe o CNPJ da empresa fornecedora"
                value={cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontStyle: 'italic', fontFamily: 'monospace' }}
                inputMode="numeric"
                pattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSalvarLinha}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginTop: 8
            }}
          >
            Salvar linha
          </button>

          {linhas.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12 }}>Linhas salvas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f4f6fa' }}>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>Ano</th>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>Origem</th>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>Destino</th>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>ID Enlace</th>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>Meio</th>
                    <th style={{ border: '1px solid #ccc', padding: 6 }}>CNPJ</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.ano}</td>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.origem}</td>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.destino}</td>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.idEnlace}</td>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.meio}</td>
                      <td style={{ border: '1px solid #ccc', padding: 6 }}>{linha.cnpj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={gerarCSV}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#388e3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginTop: 16
                }}
              >
                Gerar CSV
              </button>
            </div>
          )}

          {/* HISTÓRICO SEMPRE FIXO NO FINAL */}
          <div style={{ marginTop: 48, borderTop: '2px solid #eee', paddingTop: 32 }}>
            <h3 style={{ fontSize: 18, marginBottom: 12 }}>Histórico de arquivos gerados</h3>
            {historicoArquivos.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: 14, padding: 8, background: '#f9f9f9', borderRadius: 6 }}>
                Nenhum arquivo gerado ainda.
              </div>
            ) : (
              <ul style={{ padding: 0, listStyle: 'none' }}>
                {historicoArquivos.map((arq, idx) => (
                  <li key={idx} style={{ marginBottom: 8, background: '#f4f6fa', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      <b>{arq.nome}</b> <span style={{ color: '#888', fontSize: 12 }}>({arq.data})</span>
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => {
                          const blob = new Blob([arq.conteudo], { type: 'text/csv;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = arq.nome;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Baixar
                      </button>
                      <button
                        style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => {
                          setHistoricoArquivos(prev => {
                            const novo = prev.filter((_, i) => i !== idx);
                            salvarHistoricoNoStorage(novo, clienteSelecionado.cnpj);
                            return novo;
                          });
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Adicione aqui os demais campos e funcionalidades da página */}
        </div>
      </div>
    </div>
  );
}
