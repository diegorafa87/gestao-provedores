import React, { useState, useEffect } from 'react';
import { getMesesComDados } from '../services/clienteMeses';

const STORAGE_KEY_PREFIX = 'checksMesesCliente:';

function normalizarCNPJ(cnpj = '') {
  return String(cnpj).replace(/\D/g, '');
}

function obterStorageKey(cnpj) {
  return `${STORAGE_KEY_PREFIX}${normalizarCNPJ(cnpj)}`;
}

function carregarMesesSalvos(cnpj) {
  try {
    const raw = localStorage.getItem(obterStorageKey(cnpj));
    if (!raw) return new Set();
    const lista = JSON.parse(raw);
    if (!Array.isArray(lista)) return new Set();
    return new Set(
      lista
        .map(Number)
        .filter((mes) => Number.isInteger(mes) && mes >= 1 && mes <= 12)
    );
  } catch {
    return new Set();
  }
}

function salvarMesesSalvos(cnpj, mesesSet) {
  try {
    const meses = Array.from(mesesSet)
      .map(Number)
      .filter((mes) => Number.isInteger(mes) && mes >= 1 && mes <= 12)
      .sort((a, b) => a - b);
    localStorage.setItem(obterStorageKey(cnpj), JSON.stringify(meses));
  } catch {
    // mantém silencioso para não quebrar a UI se storage estiver indisponível
  }
}

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

      const mesesComDados = Array.from(
        new Set(
          Object.values(dados || {})
            .flatMap((lista) => lista || [])
            .map(Number)
            .filter((mes) => Number.isInteger(mes) && mes >= 1 && mes <= 12)
        )
      );

      const mesesSalvos = carregarMesesSalvos(clienteCNPJ);
      if (mesesSalvos.size > 0) {
        setMesesMarcados(mesesSalvos);
      } else {
        const inicial = new Set(mesesComDados);
        setMesesMarcados(inicial);
        salvarMesesSalvos(clienteCNPJ, inicial);
      }

      setCarregando(false);
    };
    
    if (clienteCNPJ) {
      buscarMeses();
    }
  }, [clienteCNPJ]);

  const handleToggleMes = (mesNum) => {
    setMesesMarcados((anteriores) => {
      const novosMarcados = new Set(anteriores);
      if (novosMarcados.has(mesNum)) {
        novosMarcados.delete(mesNum);
      } else {
        novosMarcados.add(mesNum);
      }
      salvarMesesSalvos(clienteCNPJ, novosMarcados);
      return novosMarcados;
    });
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
