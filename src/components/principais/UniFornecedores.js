import React from 'react';
import styles from './UniFornecedores.module.css';
import { ExternalLink } from 'lucide-react';

function UniFornecedores({ material, descricao, fornecedor, imagem, valor, link }) {
    const handleRedirect = () => {
        if (link) {
            window.open(link, '_blank');
        }
    };

    return (
        <div className={styles.unifornecedores}>
            <div className={styles.imagem}>
                <img
                    src={imagem}
                    alt={material}
                    className={styles.produtoImagem}
                />
            </div>
            
            <div className={styles.descricao}>
                <h2>{material}</h2>
                <p>R${valor}</p>
                <p>{descricao}</p>
            </div>
            
            <div className={styles.descricao}>
                <p>{fornecedor}</p>
                <button 
                    onClick={handleRedirect}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        marginTop: '10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    <span>Visitar</span>
                    <ExternalLink size={20} />
                </button>
            </div>
        </div>
    );
}

export default UniFornecedores;