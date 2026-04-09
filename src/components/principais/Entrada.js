import styles from './Entrada.module.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import Seletor from '../../form/Seletor';
import fundo from '../../images/CAPA.png';
import { Delete } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';

function Entrada() {
    const navigate = useNavigate();
    const { user } = useUser();
    
    const [materiais, setMateriais] = useState([]);
    const [item, setItem] = useState('');
    const [descricao, setDescricao] = useState('Descrição do item');
    const [quantidade, setQuantidade] = useState('');
    const [itens, setItens] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
        useEffect(() => {
            const fetchMateriais = async () => {
                try {
                    const response = await fetch('http://localhost:3001/api/material');
                    const data = await response.json();
                    const options = data.map((material) => ({
                        value: material.codigo,
                        label: material.nome,
                        descricao: material.descricao,
                        quantidade: material.quantidade,
                        unidade_medida: material.unidade_de_medida
                    }));
                    setMateriais(options);
                } catch (error) {
                    console.error('Erro ao buscar materiais:', error);
                }
            };
            fetchMateriais();
        }, []);
    
        const handleItemChange = (value) => {
            setItem(value);
            const itemSelecionado = materiais.find((material) => material.value === value);
            if (itemSelecionado) {
                setDescricao(itemSelecionado.descricao);
            }
        };

        const adicionarItem = () => {
            if (!quantidade || quantidade <= 0) {
                alert('A quantidade precisa ser maior que 0.');
                return;
            }
    
            const itemSelecionado = materiais.find((material) => material.value === item);
            if (!itemSelecionado) {
                alert('Selecione um item válido.');
                return;
            }
    
            const itemJaAdicionado = itens.some((i) => i.codigo === itemSelecionado.value);
            if (itemJaAdicionado) {
                alert('Este material já foi adicionado à lista.');
                return;
            }
    
            const novoItem = {
                id: Date.now(),
                codigo: itemSelecionado.value,
                nome: itemSelecionado.label,
                quantidade: parseInt(quantidade),
                descricao: itemSelecionado.descricao,
                unidade_medida: itemSelecionado.unidade_medida
            };
    
            setItens((prevItens) => [...prevItens, novoItem]);
            setQuantidade('');
        };
    
        const excluirItem = (id) => {
            setItens(itens.filter(item => item.id !== id));
        };

        const handleSubmit = async () => {
            if (itens.length === 0) {
                alert('Adicione pelo menos um item para registrar a entrada.');
                return;
            }
    
            if (!user?.cpf) {
                alert('Usuário não autenticado ou CPF não disponível.');
                return;
            }
    
            setIsSubmitting(true);
    
            try {
                const response = await fetch('http://localhost:3001/api/entrar/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        itens: itens.map(item => ({
                            codigo: item.codigo,
                            quantidade: item.quantidade
                        })),
                        cpf: user.cpf
                    })
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao registrar entradas');
                }
    
                alert('Entradas registradas com sucesso!');
                setItens([]);
                navigate('/menuprincipal');
            } catch (error) {
                console.error('Erro:', error);
                alert(error.message);
            } finally {
                setIsSubmitting(false);
            }
        };
    

    return (
        <div className={styles.fundo} style={{ backgroundImage: `url(${fundo})`, backgroundRepeat: 'repeat',
        backgroundSize: '150px 150px'}}>
            <div className={styles.entrar}>
            <div className={styles.divisorE}>
                    <div className={styles.divisorE1}>
                        <h1>Entrada</h1>
                        <Seletor
                            text="Selecione um Item"
                            name="item"
                            value={item}
                            handleChange={(e) => handleItemChange(e.value)}
                            options={materiais}
                        />
                        <Input
                            type="number"
                            text="Quantidade"
                            name="quantidade"
                            placeholder="Digite a quantidade"
                            value={quantidade}
                            handleChange={(e) => setQuantidade(e.target.value)}
                        />
                    </div>
                    <div className={styles.divisorE2}>
                        <p>{descricao}</p>
                    </div>
                </div>

                <div className={styles.divisorD}>
                    <div className={styles.divisorD1}>
                        <div className={styles.lista}>
                            {itens.length === 0 ? (
                                <p>Adicione um item na lista!</p>
                            ) : (
                                <ul>
                                    {itens.map((item) => (
                                        <li key={item.id} className={styles.itemLista}>
                                            <span>{item.nome} <br/> {item.quantidade} {item.unidade_medida}</span>
                                            <button onClick={() => excluirItem(item.id)} className={styles.botaoExcluir}>
                                                <Delete />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className={styles.divisorD2}>
                        <div>
                            <SubmitButton text="Adicionar" onClick={adicionarItem} />
                            <SubmitButton 
                                    text="Concluir" 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || itens.length === 0}
                                />
                            <SubmitButton text="Voltar" onClick={() => navigate('/menuprincipal')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Entrada;
