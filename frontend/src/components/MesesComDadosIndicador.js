import React, { useState, useEffect } from 'react';
import { getMesesComDados } from '../services/clienteMeses';

/**
 * Componente que exibe quais meses têm dados preenchidos para um cliente
 * Mostra visualmente com checkboxes/badges os meses de cada módulo
 * 
 * Props:
 * - clienteCNPJ: CNPJ do cliente para buscar dados
 * - tamanho: 'compacto' (padrão - apenas badges) ou 'expandido' (com nomes de módulos)
 */
export default function MesesComDadosIndicador({ clienteCNPJ, tamanho = 'compacto' }) {
  const [meses, setMeses] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(false);

  const mesesNomes = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const mesesFullNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  useEffect(() => {
    const buscarMeses = async () => {
      setCarregando(true);
      const dados = await getMesesComDados(clienteCNPJ);
      setMeses(dados);
      setCarregando(false);
    };
    
    if (clienteCNPJ) {
      buscarMeses();
    }
  }, [clienteCNPJ]);

  if (carregando) {
    return <div style={{ fontSize: '12px', color: '#999' }}>↻</div>;
  }

  if (!meses) {
    return <div style={{ fontSize: '12px', color: '#999' }}>-</div>;
  }

  // Cores para cada módulo
  const coresModulo = {
    'SCM': '#1976d2',
    'TVpA': '#f57c00',
    'STFC': '#388e3c',
    'Postes': '#7b1fa2',
    'Relatório Econômico': '#c2185b'
  };

  // Modo compacto: mostra um grid de checkboxes por mês
  if (tamanho === 'compacto') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        fontSize: '11px'
      }}>
        {/* Grid de meses 1-12 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '4px',
          marginBottom: '0.25rem'
        }}>
          {mesesNomes.map((mes, idx) => {
            const mesNum = idx + 1;
            // Verifica se qualquer módulo tem esse mês
            const temDados = Object.values(meses).some(mesesModulo => 
              mesesModulo.includes(mesNum)
            );

            return (
              <div
                key={mesNum}
                style={{
                  width: '20px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  background: temDados ? '#388e3c' : '#e0e0e0',
                  color: temDados ? '#fff' : '#999',
                  fontWeight: temDados ? 'bold' : 'normal',
                  border: temDados ? '1px solid #2e7d32' : '1px solid #bbb',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                title={`Mês ${mesNum} - ${Object.keys(meses)
                  .filter(mod => meses[mod].includes(mesNum))
                  .join(', ')}`}
              >
                {mes}
              </div>
            );
          })}
        </div>

        {/* Detalhes dos módulos (colapsível) */}
        <div style={{
          fontSize: '10px',
          cursor: 'pointer',
          color: '#153a6b',
          textDecoration: 'underline',
          marginTop: '0.25rem'
        }} onClick={() => setExpandido(!expandido)}>
          {expandido ? '▼' : '▶'} Detalhes
        </div>

        {expandido && (
          <div style={{
            fontSize: '10px',
            marginTop: '0.25rem',
            padding: '0.5rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {Object.entries(meses).map(([modulo, mesesModulo]) => (
              <div key={modulo} style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  fontWeight: 'bold',
                  color: coresModulo[modulo],
                  marginBottom: '0.25rem'
                }}>
                  {modulo}:
                </div>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}>
                  {mesesModulo.length > 0 ? (
                    mesesModulo.map(mesNum => (
                      <span
                        key={mesNum}
                        style={{
                          background: coresModulo[modulo],
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '9px'
                        }}
                      >
                        {mesesFullNomes[mesNum - 1]}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#999', fontSize: '9px' }}>Nenhum mês</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Modo expandido: mostra mais detalhes
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontSize: '12px',
      padding: '0.5rem',
      background: '#f5f5f5',
      borderRadius: '4px'
    }}>
      <div style={{ fontWeight: 'bold' }}>Meses com Dados:</div>
      {Object.entries(meses).map(([modulo, mesesModulo]) => (
        <div key={modulo}>
          <div style={{
            fontWeight: 'bold',
            color: coresModulo[modulo],
            fontSize: '11px'
          }}>
            {modulo}:
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginLeft: '0.5rem'
          }}>
            {mesesModulo.length > 0 ? (
              mesesModulo.map(mesNum => (
                <span
                  key={mesNum}
                  style={{
                    background: coresModulo[modulo],
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  {mesesFullNomes[mesNum - 1]}
                </span>
              ))
            ) : (
              <span style={{ color: '#999', fontSize: '11px' }}>Nenhum mês preenchido</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
