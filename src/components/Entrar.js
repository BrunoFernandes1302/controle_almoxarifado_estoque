import Input from '../form/Input';
import SubmitButton from '../form/SubmitButton';
import styles from './Entrar.module.css';
import { useNavigate } from 'react-router-dom';
import fundo from '../images/fundo.png';
import { useState } from 'react';
import React from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

function Entrar() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    if (formData.email && formData.password) {
      try {
        const response = await axios.post('http://localhost:3001/api/login', {
          email: formData.email,
          senha: formData.password, // Verifique se o backend espera "senha" como chave
        });

        if (response.status === 200) {
          console.log('Login bem-sucedido:', response.data.message);

          // Salvar os dados do usuário no contexto
          setUser({
            email: response.data.user?.email || formData.email,
            nome: response.data.user?.nome || 'Usuário',
            cpf: response.data.user?.cpf,
          });

          // Exibe uma mensagem de boas-vindas (opcional)
          alert(`Bem-vindo, ${response.data.user?.nome || 'Usuário'}!`);

          // Redirecionar após o login
          navigate('/menuprincipal');
        } else {
          setErrorMessage('Login falhou. Verifique suas credenciais.');
        }
      } catch (error) {
        // Tratamento detalhado do erro
        if (error.response) {
          console.error('Erro no backend:', error.response.data);
          setErrorMessage(
            error.response.data.error || 'Erro na autenticação. Tente novamente.'
          );
        } else if (error.request) {
          console.error('Nenhuma resposta do servidor:', error.request);
          setErrorMessage('Erro ao se conectar ao servidor. Tente novamente mais tarde.');
        } else {
          console.error('Erro ao configurar a requisição:', error.message);
          setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
        }
      }
    } else {
      setErrorMessage('Por favor, preencha todos os campos.');
    }
  };

  return (
    <div className={styles.entrar} style={{ backgroundImage: `url(${fundo})` }}>
      <div>
        <h1>Entrar</h1>
        <Input
          type="email"
          text="Digite seu e-mail"
          placeholder="E-mail"
          name="email"
          value={formData.email}
          handleChange={handleChange}
        />
        <Input
          type="password"
          text="Digite sua senha"
          placeholder="Senha"
          name="password"
          value={formData.password}
          handleChange={handleChange}
        />
        <SubmitButton text="Entrar" onClick={handleLogin} />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
      <button onClick={() => navigate('/')}>VOLTAR</button>
    </div>
  );
}

export default Entrar;
