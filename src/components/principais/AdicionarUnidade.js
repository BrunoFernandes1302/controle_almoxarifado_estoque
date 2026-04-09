import styles from './AdicionarUnidade.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import fundo from '../../images/CAPA.png';

function AdicionarUnidade() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSave = async () => {
        if (!name) {
            alert('O nome da unidade é obrigatório.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/unidade_medida', { // Ajuste a URL conforme sua API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome: name }),
            });
            

            if (response.ok) {
                alert('Unidade de medida cadastrada com sucesso!');
                navigate('/cadastraritem');
            } else {
                alert('Erro ao cadastrar unidade de medida.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className={styles.fundo} style={{ backgroundImage: `url(${fundo})`, backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px'}}>
            <div className={styles.und}>
                <h1>Crie uma nova unidade de medida</h1>

                    <Input
                        type="text"
                        text="Nome"
                        name="name"
                        value={name}
                        handleChange={(e) => setName(e.target.value)} 
                        placeholder="Unidade de medida"
                    />


                <SubmitButton text="Salvar" onClick={handleSave} />
                <SubmitButton text="Cancelar" onClick={() => navigate('/cadastraritem')} />
            </div>
        </div>
    );
}

export default AdicionarUnidade;
