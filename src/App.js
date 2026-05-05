import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Central from './components/Central';
import Centraldois from './components/Centraldois';
import Entrar from './components/Entrar';
import Registrar from './components/Registrar';
import Footer from './components/Footer';
import MenuPrincipal from './components/MenuPrincipal';
import Saida from './components/principais/Saida';
import Entrada from './components/principais/Entrada';
import CadastrarItem from './components/principais/CadastrarItem';
import Estoque from './components/principais/Estoque';
import Relatorio from './components/principais/Relatorio';
import AdicionarUnidade from './components/principais/AdicionarUnidade';
import QrCode from './components/principais/QrCode';
import Fornecedores from './components/principais/Fornecedores';
import Materiais from  './components/principais/Materiais';
import './App.css';
import fundo from './images/CAPA.png';
import React, { useEffect } from 'react';
import axios from 'axios';
import { useUser } from './contexts/UserContext';

function PrivateRoute({ children }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/entrar" replace />;
}

function App() {
  useEffect(() => {
    // Testa a comunicação com o backend
    axios
      .get('http://localhost:3001/api/check-db')
      .then((response) => {
        if (response.data.connected) {
          console.log('Conexão com o banco de dados bem-sucedida.');
        } else {
          console.error('Problema na conexão com o banco de dados:', response.data.error);
        }
      })
      .catch((error) => {
        console.error('Erro ao conectar ao backend:', error.message);
      });
  }, []);

  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const location = useLocation();

  // Define as rotas onde o NavBar e Central não devem ser exibidos
  const hideComponentsRoutes = [
    '/entrar',
    '/registrar',
    '/menuprincipal',
    '/saida',
    '/entrada',
    '/cadastraritem',
    '/estoque',
    '/relatorio',
    '/adicionarunidade',
    '/qrcode',
    '/fornecedores',
    '/materiais',
  ];
  const shouldHideComponents = hideComponentsRoutes.includes(location.pathname);

  // Define as rotas onde o Footer não deve ser exibido
  const hideFooterRoutes = [
    '/menuprincipal',
    '/saida',
    '/entrada',
    '/cadastraritem',
    '/estoque',
    '/relatorio',
    '/adicionarunidade',
    '/qrcode',
    '/fornecedores',
    '/materiais',
  ];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div
      style={{
        backgroundImage: `url(${fundo})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px',
      }}
    >
      {!shouldHideComponents && <NavBar />}
      {!shouldHideComponents && (
        <Central
          titulo="AXM - Almoxarimax"
          texto="Registre e acompanhe todos os itens em seu estoque com facilidade. Desde pequenas ferramentas até grandes equipamentos, mantenha tudo sob controle com poucos cliques."
          imagem="almoxarifado.png"
        />
      )}
      {!shouldHideComponents && (
        <Centraldois
          titulo="Quem Nós Somos"
          texto="Inicialmente éramos um grupo de amigos que nos reuníamos para jogar Minecraft, um jogo de exploração em um mundo virtual que demanda criatividade e organização. Identificamos que a organização era um problema no jogo e na vida real, principalmente para pequenas empresas. Assim, criamos o AXM-Almoxarimax para resolver esse problema."
          imagem="minecraft.png"
        />
      )}

      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/menuprincipal" element={<PrivateRoute><MenuPrincipal /></PrivateRoute>} />
        <Route path="/saida" element={<PrivateRoute><Saida /></PrivateRoute>} />
        <Route path="/entrada" element={<PrivateRoute><Entrada /></PrivateRoute>} />
        <Route path="/cadastraritem" element={<PrivateRoute><CadastrarItem /></PrivateRoute>} />
        <Route path="/estoque" element={<PrivateRoute><Estoque /></PrivateRoute>} />
        <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
        <Route path="/adicionarunidade" element={<PrivateRoute><AdicionarUnidade /></PrivateRoute>} />
        <Route path="/qrcode" element={<PrivateRoute><QrCode /></PrivateRoute>} />
        <Route path="/fornecedores" element={<PrivateRoute><Fornecedores /></PrivateRoute>} />
        <Route path="/materiais" element={<PrivateRoute><Materiais /></PrivateRoute>} />
      </Routes>

      {/* Renderiza o Footer somente se a rota atual não estiver na lista de exclusão */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

export default App;
