import AdminLogin from './components/AdminLogin';
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
import PrivateRoute from './components/PrivateRoute';

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

const AppRouter = () => {
  const [admin, setAdmin] = useState(null);
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
        {/* Rota de login do admin */}
        <Route path="/admin-login" element={<AdminLogin onLogin={setAdmin} />} />

        {/* Todas as outras rotas protegidas individualmente */}
        <Route path="/admin-area" element={<PrivateRoute>{admin ? <div style={{padding:40}}><h2>Bem-vindo, Admin!</h2><p>Você está autenticado como administrador.</p></div> : <AdminLogin onLogin={setAdmin} />}</PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><App /></PrivateRoute>} />
        <Route path="/cliente/:id" element={<PrivateRoute><DetalheCliente /></PrivateRoute>} />
        <Route path="/scm/cadastro" element={<PrivateRoute><PaginaCadastroSCM /></PrivateRoute>} />
        <Route path="/editar-perfil/:id" element={<PrivateRoute><EditarPerfil /></PrivateRoute>} />
        <Route path="/tvpa/cadastro" element={<PrivateRoute><PaginaCadastroTVpA /></PrivateRoute>} />
        <Route path="/tvpa/acompanhamento" element={<PrivateRoute><PaginaAcompanhamentoTVpA /></PrivateRoute>} />
        <Route path="/stfc/cadastro" element={<PrivateRoute><PaginaCadastroSTFC /></PrivateRoute>} />
        <Route path="/stfc/acompanhamento" element={<PrivateRoute><PaginaAcompanhamentoSTFC /></PrivateRoute>} />
        <Route path="/relatorio-economico/primeiro-semestre" element={<PrivateRoute><RelatorioPrimeiroSemestre /></PrivateRoute>} />
        <Route path="/relatorio-economico/segundo-semestre" element={<PrivateRoute><RelatorioSegundoSemestre /></PrivateRoute>} />
        <Route path="/relatorio-economico/acompanhamento" element={<PrivateRoute><PaginaAcompanhamentoRelatorioEconomico /></PrivateRoute>} />
        <Route path="/infra/estacoes" element={<PrivateRoute><EstacoesPage clienteInfo={clienteInfo} /></PrivateRoute>} />
        <Route path="/infra/enlaces-proprios" element={<PrivateRoute><EnlacesPropriosPage /></PrivateRoute>} />
        <Route path="/infra/enlaces-contratados" element={<PrivateRoute><EnlacesContratadosPage /></PrivateRoute>} />
        <Route path="/infra/acompanhamento" element={<PrivateRoute><PaginaAcompanhamentoInfra razaoSocial={clienteInfo?.props?.children?.[0]?.props?.children || ''} /></PrivateRoute>} />
        <Route path="/postes/acompanhamento" element={<PrivateRoute><PaginaAcompanhamentoPostes /></PrivateRoute>} />
        <Route path="/gerenciador/acesso" element={<PrivateRoute><SubmenuAcessoCampos /></PrivateRoute>} />
        <Route path="/contratos-e-certidoes/contratos" element={<PrivateRoute><ContratosPage /></PrivateRoute>} />
        <Route path="/contratos-e-certidoes/certidoes" element={<PrivateRoute><CertidoesPage /></PrivateRoute>} />
        <Route path="/postes/compartilhamento" element={<PrivateRoute><CompartilhamentoPostesPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
