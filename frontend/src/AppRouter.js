import PaginaAcompanhamentoPostes from './pages/AcompanhamentoPostesPage';
import CompartilhamentoPostesPage from './pages/CompartilhamentoPostesPage';
import CertidoesPage from './pages/CertidoesPage';
import ContratosPage from './pages/ContratosPage';
import EstacoesPage from './pages/EstacoesPage';
import PaginaAcompanhamentoInfra from './pages/AcompanhamentoInfraPage';
import SubmenuAcessoCampos from './pages/SubmenuAcessoCampos';
import EnlacesPropriosPage from './pages/EnlacesPropriosPage';
import EnlacesContratadosPage from './pages/EnlacesContratadosPage';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import App from './App';
import DetalheCliente from './pages/DetalheCliente';
import EditarPerfil from './pages/EditarPerfil';
import PaginaCadastroSCM from './pages/CadastroSCMPage';
import PaginaCadastroTVpA from './pages/PaginaCadastroTVpA';
import PaginaAcompanhamentoTVpA from './pages/AcompanhamentoTVpAPage';
import PaginaCadastroSTFC from './pages/CadastroSTFCPage';
import RelatorioPrimeiroSemestre from './pages/RelatorioPrimeiroSemestre';
import RelatorioSegundoSemestre from './pages/RelatorioSegundoSemestre';
import PaginaAcompanhamentoRelatorioEconomico from './pages/AcompanhamentoRelatorioEconomicoPage';
import PaginaAcompanhamentoSTFC from './pages/AcompanhamentoSTFCPage';
import Login from './components/Login';
import AdminSetup from './components/AdminSetup';

const AppRouter = () => {
  // Busca clienteSelecionado do localStorage
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
  return (
    <Router>
      <Routes>
        <Route path="/setup-admin" element={<AdminSetup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/cliente/:id" element={<DetalheCliente />} />
        <Route path="/scm/cadastro" element={<PaginaCadastroSCM />} />
        <Route path="/editar-perfil/:id" element={<EditarPerfil />} />
        <Route path="/tvpa/cadastro" element={<PaginaCadastroTVpA />} />
        <Route path="/tvpa/acompanhamento" element={<PaginaAcompanhamentoTVpA />} />
        <Route path="/stfc/cadastro" element={<PaginaCadastroSTFC />} />
        <Route path="/stfc/acompanhamento" element={<PaginaAcompanhamentoSTFC />} />
        <Route path="/relatorio-economico/primeiro-semestre" element={<RelatorioPrimeiroSemestre />} />
        <Route path="/relatorio-economico/segundo-semestre" element={<RelatorioSegundoSemestre />} />
        <Route path="/relatorio-economico/acompanhamento" element={<PaginaAcompanhamentoRelatorioEconomico />} />
        <Route path="/infra/estacoes" element={<EstacoesPage clienteInfo={clienteInfo} />} />
        <Route path="/infra/enlaces-proprios" element={<EnlacesPropriosPage />} />
        <Route path="/infra/enlaces-contratados" element={<EnlacesContratadosPage />} />
        <Route path="/infra/acompanhamento" element={<PaginaAcompanhamentoInfra razaoSocial={clienteInfo?.props?.children?.[0]?.props?.children || ''} />} />
        <Route path="/postes/acompanhamento" element={<PaginaAcompanhamentoPostes />} />
        <Route path="/gerenciador/acesso" element={<SubmenuAcessoCampos />} />
        <Route path="/contratos-e-certidoes/contratos" element={<ContratosPage />} />
        <Route path="/contratos-e-certidoes/certidoes" element={<CertidoesPage />} />
        <Route path="/postes/compartilhamento" element={<CompartilhamentoPostesPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
