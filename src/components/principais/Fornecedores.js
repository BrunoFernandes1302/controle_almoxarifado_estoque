import styles from './Fornecedores.module.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../../form/SubmitButton';
import fundo from '../../images/CAPA.png';
import Unifornecedores from './UniFornecedores';

function Fornecedores() {
    const [dadosFornecedor, setDadosFornecedor] = useState(null);
    const navigate = useNavigate();

    // Função para buscar os dados da API
    useEffect(() => {
        async function fetchDados() {
            try {
                const response = await fetch('http://localhost:3001/api/fornecedores'); // URL da sua API
                const data = await response.json(); // Converte o JSON da resposta
                setDadosFornecedor(data); // Atualiza o estado com os dados recebidos
            } catch (error) {
                console.error('Erro ao buscar dados dos fornecedores:', error);
            }
        }

        fetchDados();
    }, []); // O array vazio significa que o fetch será executado apenas uma vez ao montar o componente

    // Exibe um loader enquanto os dados não são carregados
    if (!dadosFornecedor) {
        return <div>Carregando dados...</div>;
    }

    return (
        <div className={styles.fundo} style={{ backgroundImage: `url(${fundo})`, backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px'}}>
            <div className={styles.fornecedores}>
                <h1>Fornecedores</h1>
                
                {/* Mapeando todos os fornecedores e criando um Unifornecedores para cada um */}
                <div className={styles.listaFornecedores}>
                    {dadosFornecedor.length > 0 ? (
                        dadosFornecedor.map((fornecedor, index) => (
                            <Unifornecedores
                                key={index}
                                material={fornecedor.material || 'N/A'}
                                valor={fornecedor.valor || 'N/A'}
                                descricao={fornecedor.descricao || 'N/A'}
                                fornecedor={fornecedor.nome_fornecedor || 'N/A'}
                                imagem={fornecedor.imagem || 'https://via.placeholder.com/200'}
                                link={fornecedor.link || 'N/A'}
                            />
                        ))
                    ) : (
                        <div>Não há fornecedores cadastrados.</div>
                    )}
                </div>

                <SubmitButton text="Voltar" onClick={() => navigate('/menuprincipal')} />
            </div>
        </div>    
    );
}

export default Fornecedores;
