import styles from './CadastrarItem.module.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitButton from '../../form/SubmitButton';
import Input from '../../form/Input';
import Seletor from '../../form/Seletor';
import fundo from '../../images/CAPA.png';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

function CadastrarItem() {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [aviso, setAviso] = useState('');
    const [unidade, setUnidade] = useState('');
    const [unidades, setUnidades] = useState([]);
    const [generatedQRCode, setGeneratedQRCode] = useState(null);

    const handleUnidadeChange = (selectedOption) => {
        setUnidade(selectedOption ? selectedOption.value : '');
    };

    useEffect(() => {
        async function fetchUnidades() {
            try {
                const response = await axios.get('http://localhost:3001/api/unidade_medida');
                const unidadesData = response.data.map((unidade) => ({
                    value: unidade.nome,
                    label: unidade.nome,
                }));
                setUnidades(unidadesData);
            } catch (error) {
                console.error('Erro ao buscar as unidades de medida:', error);
            }
        }

        fetchUnidades();
    }, []);

    const generateQRCode = () => {
        const qrData = JSON.stringify({
            nome,
            descricao,
            unidade,
            aviso
        });
        setGeneratedQRCode(qrData);
    };

    const handleCadastrar = async () => {
        if (!nome || !descricao || !unidade || !generatedQRCode) {
            alert('Todos os campos são obrigatórios e um QR Code deve ser gerado.');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:3001/api/material', {
                nome,
                descricao,
                unidade_de_medida: unidade,
                limite: aviso ? parseInt(aviso) : null,
                qrcode_string: generatedQRCode
            });
    
            alert('Item cadastrado com sucesso!');
            navigate('/menuprincipal');
        } catch (error) {
            console.error('Erro ao cadastrar o item:', error);
            alert('Ocorreu um erro ao cadastrar o item. Tente novamente.');
        }
    };

    return (
        <div
            className={styles.fundo}
            style={{
                backgroundImage: `url(${fundo})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '150px 150px',
            }}
        >
            <div className={styles.cadastrarItem}>
                <h1>Cadastrar Item</h1>

                <Input
                    type="text"
                    text="Nome"
                    name="name"
                    placeholder="Digite o nome do item"
                    value={nome}
                    handleChange={(e) => setNome(e.target.value)}
                />

                <Input
                    type="text"
                    text="Descrição"
                    name="description"
                    placeholder="Digite a descrição do item"
                    value={descricao}
                    handleChange={(e) => setDescricao(e.target.value)}
                />

                <Input
                    type="number"
                    text="Limite para acionar o aviso"
                    name="limit"
                    placeholder="Digite um valor para o aviso"
                    value={aviso}
                    handleChange={(e) => setAviso(e.target.value)}
                />

                <Seletor
                    text="Unidade de Medida"
                    name="unidade"
                    value={unidade}
                    handleChange={handleUnidadeChange}
                    options={unidades}
                />

                <div className={styles.qrCodeSection}>
                    <button 
                        type="button" 
                        onClick={generateQRCode}
                        className={styles.generateQRButton}
                    >
                        Gerar QR Code
                    </button>

                    {generatedQRCode && (
                        <div>
                            <h3>QR Code Gerado:</h3>
                            <QRCodeSVG value={generatedQRCode} width={128} height={128} />
                        </div>
                    )}
                </div>

                <SubmitButton
                    text="Cadastrar"
                    onClick={handleCadastrar}
                />
                <SubmitButton
                    text="Voltar"
                    onClick={() => navigate('/menuprincipal')}
                />
                <SubmitButton
                    text="Adicionar Unidade de Medida"
                    onClick={() => navigate('/adicionarunidade')}
                    className={styles.adicionar}
                />
            </div>
        </div>
    );
}

export default CadastrarItem;