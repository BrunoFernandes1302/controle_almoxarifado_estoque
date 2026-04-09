import SubmitButton from '../form/SubmitButton';
import styles from './Registrar.module.css';
import { useNavigate } from 'react-router-dom';
import fundo from '../images/fundo.png';
import Input from '../form/Input';
import { useState } from 'react';
import React from 'react';

function Registrar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    passwordConfirm: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Atualiza os valores do formulário dinamicamente
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para tratar o envio do formulário
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf || !formData.password || !formData.passwordConfirm) {
      alert('Preencha todos os campos!');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      alert('As senhas não coincidem!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/almoxarife', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone,
          cpf: formData.cpf,
          senha: formData.password,
        }),
      });

      if (response.ok) {
        alert('Registro realizado com sucesso!');
        navigate('/menuprincipal'); // Redireciona para a página principal ou outro destino
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (err) {
      alert(`Erro ao conectar com o servidor: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registrar} style={{ backgroundImage: `url(${fundo})` }}>
      <div>
        <h1>Registrar</h1>
        <Input
          type="text"
          text="Digite seu nome"
          placeholder="Nome"
          name="name"
          value={formData.name}
          handleChange={handleChange}
        />
        <Input
          type="email"
          text="Digite seu e-mail"
          placeholder="E-mail"
          name="email"
          value={formData.email}
          handleChange={handleChange}
        />
        <Input
          type="number"
          text="Digite seu telefone"
          placeholder="Telefone"
          name="phone"
          value={formData.phone}
          handleChange={handleChange}
        />
        <Input
          type="number"
          text="Digite seu CPF"
          placeholder="CPF"
          name="cpf"
          value={formData.cpf}
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
        <Input
          type="password"
          text="Confirme sua senha"
          placeholder="Confirme sua senha"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          handleChange={handleChange}
        />
        <SubmitButton text={isLoading ? 'Registrando...' : 'Registrar'} onClick={handleRegister} disabled={isLoading} />
      </div>
      <button onClick={() => navigate('/')}>VOLTAR</button>
    </div>
  );
}

export default Registrar;
