import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../form/SubmitButton';
import styles from './MenuPrincipal.module.css';
import fundo from '../images/CAPA.png';
import { useUser } from '../contexts/UserContext';

// Importando as imagens
import IconeNormal from '../images/IconeNormal.png';
import IconeHover from '../images/IconeHover.png';

import MaterialNormal from '../images/MaterialNormal.png';
import MaterialHover from '../images/MaterialHover.png';

function MenuPrincipal() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false); // Estado para hover fornecedores
    const [isHoveredM, setIsHoveredM] = useState(false); // Estado para hover moteriais

    const { user } = useUser();

    return (
        <div
        className={styles.fundo}
        style={{
            backgroundImage: `url(${fundo})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px 150px',
        }}
    >
        <div className={styles.menuPrincipal}>
            {/* Ícone com configuração personalizada */}
            <a
                className={styles.fornecedores}
                onClick={() => navigate('/fornecedores')}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={() => setIsHovered(false)}
            >
                <img
                    src={isHovered ? IconeHover : IconeNormal}
                    alt="Logo Fornecedores"
                />
            </a>

            <a
                className={styles.materiais}
                onClick={() => navigate('/materiais')}
                onMouseOver={() => setIsHoveredM(true)}
                onMouseOut={() => setIsHoveredM(false)}
            >
                <img
                    src={isHoveredM ? MaterialHover : MaterialNormal}
                    alt="Logo Fornecedores"
                />
            </a>

                <h1>Menu Principal</h1>
                <span>Olá, {user && <p>{user.nome} ({user.email})</p>}</span>
                <SubmitButton text="Saída" onClick={() => navigate('/saida')} />
                <SubmitButton text="Entrada" onClick={() => navigate('/entrada')} />
                <SubmitButton text="Cadastro de Item" onClick={() => navigate('/cadastraritem')} />
                <SubmitButton text="Estoque" onClick={() => navigate('/estoque')} />
                <div className={styles.relatorio}>
                    <SubmitButton text="Relatório" onClick={() => navigate('/relatorio')} />
                </div>
                <div className={styles.sair}>
                    <button onClick={() => navigate('/')}>SAIR DA CONTA</button>
                </div>
            </div>
        </div>
    );
}

export default MenuPrincipal;
