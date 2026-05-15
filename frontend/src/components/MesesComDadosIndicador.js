import React, { useState, useEffect } from 'react';
import { getMesesComDados } from '../services/clienteMeses';

/**
 * Componente que exibe quais meses têm dados preenchidos para um cliente
 * Com checkboxes interativas
 * 
 * Props:
 * - clienteCNPJ: CNPJ do cliente para buscar dados
 */
export default function MesesComDadosIndicador({ clienteCNPJ }) {
  const [meses, setMeses] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mesesMarcados, setMesesMarcados] = useState(new Set());

  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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

  const handleToggleMes = (mesNum) => {
    const novosMarcados = new Set(mesesMarcados);
    if (novosMarcados.has(mesNum)) {
      novosMarcados.delete(mesNum);
    } else {
      novosMarcados.add(mesNum);
    }
    setMesesMarcados(novosMarcados);
  };

  if (carregando) {
    return <div style={{ fontSize: '12px', color: '#999' }}>↻</div>;
  }

  if (!meses) {
    return <div style={{ fontSize: '12px', color: '#999' }}>-</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '0.5rem'
    }}>
      {mesesNomes.map((mes, idx) => {
        const mesNum = idx + 1;
        // Verifica se qualquer módulo tem esse mês
        const temDados = Object.values(meses).some(mesesModulo => 
          mesesModulo.includes(mesNum)
        );
        const marcado = mesesMarcados.has(mesNum);

        return (
          <label
            key={mesNum}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              opacity: temDados ? 1 : 0.6
            }}
          >
            <input
              type="checkbox"
              checked={marcado}
              onChange={() => handleToggleMes(mesNum)}
              style={{
                cursor: 'pointer',
                width: '16px',
                height: '16px'
              }}
              title={temDados ? `${mes} - com dados` : `${mes} - sem dados`}
            />
            <span style={{
              fontSize: '13px',
              color: '#333',
              userSelect: 'none',
              fontWeight: temDados ? 'normal' : '500'
            }}>
              {mes}
            </span>
          </label>
        );
      })}
    </div>
  );
}
