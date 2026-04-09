import styles from './Saida.module.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import Seletor from '../../form/Seletor';
import fundo from '../../images/CAPA.png';
import { Delete } from '@mui/icons-material';
import { useUser } from '../../contexts/UserContext';
import { useLocation } from 'react-router-dom';


function Saida() {
    const navigate = useNavigate();
    const { user } = useUser(); // Obtendo informações do usuário logado

    const location = useLocation();

    const [materiais, setMateriais] = useState([]);
    const [item, setItem] = useState('');
    const [descricao, setDescricao] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [itens, setItens] = useState([]);
    const [itemSelecionado, setItemSelecionado] = useState(false);


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
                
                // Verifica se temos dados do QR code
                if (location.state?.qrData) {
                    const qrData = location.state.qrData;
                    
                    // Procura um item que corresponda ao nome do QR code
                    const matchingItem = options.find(
                        (material) => material.label.toLowerCase() === qrData.nome.toLowerCase()
                    );
    
                    if (matchingItem) {
                        setItem(matchingItem.value);
                        setDescricao(matchingItem.descricao);
                        setItemSelecionado(true); // Define como true quando vem do QR code
                    } else {
                        alert('Item não encontrado no sistema. Verifique se o nome está correto.');
                    }
                } else if (item) {
                    // Se não tem QR code mas tem um item selecionado, mantém a descrição do item
                    const itemSelecionado = options.find((material) => material.value === item);
                    if (itemSelecionado) {
                        setDescricao(itemSelecionado.descricao);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar materiais:', error);
            }
        };
        fetchMateriais();
    }, [location.state?.qrData, item]); // Adicionamos item como dependência
    

    const handleItemChange = (value) => {
        setItem(value);
        setItemSelecionado(true);  // Definir como true quando um item for selecionado
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

        if (quantidade > itemSelecionado.quantidade) {
            alert(`A quantidade não pode exceder ${itemSelecionado.quantidade}.`);
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

    const registrarSaida = async () => {
        if (!user || !user.cpf) {
            alert('Usuário não autenticado!');
            return;
        }

        if (itens.length === 0) {
            alert('Adicione pelo menos um item para registrar a saída!');
            return;
        }

        try {
            // Registrar cada item da saída
            for (const item of itens) {
                const saidaData = {
                    codigo: item.codigo,
                    qtd: item.quantidade,
                    cpf: user.cpf
                };

                const response = await fetch('http://localhost:3001/api/saida', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(saidaData),
                });

                if (!response.ok) {
                    throw new Error('Erro ao registrar saída');
                }

                // Atualizar quantidade do material
                const updatedQuantity = {
                    quantidade: materiais.find(m => m.value === item.codigo).quantidade - item.quantidade
                };

                await fetch(`http://localhost:3001/api/material/${item.codigo}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedQuantity),
                });
            }

            alert('Saída registrada com sucesso!');
            setItens([]); // Limpar lista
            navigate('/menuprincipal');
        } catch (error) {
            console.error('Erro ao registrar saída:', error);
            alert('Erro ao registrar saída. Por favor, tente novamente.');
        }
    };

    return (
        <div className={styles.fundo} style={{ backgroundImage: `url(${fundo})`, backgroundRepeat: 'repeat', backgroundSize: '150px 150px' }}>
            <div className={styles.sair}>
                <div className={styles.divisorE}>
                    <div className={styles.divisorE1}>
                        <h1>Saída</h1>
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
    <p className={itemSelecionado ? styles.semDescricao : ''}>{descricao}</p>
</div>
                </div>

                <div className={styles.divisorD}>
                    <div className={styles.imgQr}>
                        <p>Ler QR Code</p>
                        <div className={styles.botaoQrCode}>
                            <button onClick={() => navigate('/qrcode')}><img src="Qrcode.png" alt="QR Code" /></button>
                        </div>
                    </div>
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
                            <SubmitButton text="Concluir" onClick={registrarSaida} />
                            <SubmitButton text="Voltar" onClick={() => navigate('/menuprincipal')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Saida;