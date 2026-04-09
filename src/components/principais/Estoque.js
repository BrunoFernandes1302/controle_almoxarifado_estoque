import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer } from 'lucide-react';
import ItemTabela from './ItemTabela';
import SubmitButton from '../../form/SubmitButton';
import fundo from '../../images/CAPA.png';
import styles from '../principais/Estoque.module.css';

function Estoque() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [selectedQRCode, setSelectedQRCode] = useState(null);


    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/material');
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do servidor');
            }
            const data = await response.json();
            setItems(data);
        } catch (error) {
            setError(error.message);
            console.error('Erro:', error.message);
        }
    };

    // Função de ordenação
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Aplicar ordenação aos items
    const sortedItems = [...items].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Converter para minúsculas se for string
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Filtragem dos items baseada na pesquisa
    const filteredItems = sortedItems.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo.toString().includes(searchTerm)
    );

    // Função para renderizar o ícone de ordenação
    const renderSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return ' ↕';
    };

    // Função para determinar status do material - ajustada para capturar todos os casos
    const getMaterialStatus = (quantidade, limite) => {
        if (quantidade === null || limite === null) return 'normal';
        if (quantidade <= limite) {
            return quantidade === limite ? 'warning' : 'critical';
        }
        return 'normal';
    };

    // Calcular itens em alerta - atualizado para capturar todos os casos
    const alertItems = sortedItems.filter(item => 
        item.quantidade !== null && 
        item.limite !== null && 
        item.quantidade <= item.limite
    );

    // Função para gerar dados do QR code (similar ao CadastrarItem)
    const generateQRCodeData = (item) => {
        return JSON.stringify({
            nome: item.nome,
            descricao: item.descricao,
            unidade: item.unidade_de_medida,
            aviso: item.limite
        });
    };

    // Função para abrir o popup do QR code
    const handleQRCodeClick = (item) => {
        setSelectedQRCode(item);
    };

    // Função para fechar o popup
    const closeQRCodePopup = () => {
        setSelectedQRCode(null);
    };

    // Função para fechar o popup quando clicar fora dele
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            closeQRCodePopup();
        }
    };

    // Função para imprimir o QR code
    const handlePrint = (item) => {
        // Criar uma nova janela
        const printWindow = window.open('', '_blank', 'width=600,height=600');
        
        // Conteúdo HTML para impressão
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${item.nome}</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    .print-container {
                        text-align: center;
                        padding: 20px;
                    }
                    .item-info {
                        margin-bottom: 20px;
                    }
                    .item-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .item-desc {
                        font-size: 16px;
                        color: #666;
                        margin-bottom: 20px;
                    }
                    .qr-code {
                        margin: 20px auto;
                        width: 300px;
                        height: 300px;
                    }
                    @media print {
                        @page {
                            size: 80mm 80mm;
                            margin: 0;
                        }
                        body {
                            width: 80mm;
                            height: 80mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="item-info">
                        <div class="item-name">${item.nome}</div>
                        <div class="item-desc">${item.descricao}</div>
                    </div>
                    <div id="qrcode" class="qr-code"></div>
                </div>
                <script>
                    window.onload = function() {
                        new QRCode(document.getElementById("qrcode"), {
                            text: '${generateQRCodeData(item)}',
                            width: 300,
                            height: 300,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        
                        // Aguarda um momento para o QR code ser gerado antes de imprimir
                        setTimeout(() => {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        // Escrever o conteúdo na nova janela
        printWindow.document.write(printContent);
        printWindow.document.close();
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
            {alertItems.length > 0 && (
                <div className={styles.alertBanner}>
                    <strong>⚠️ Alerta de Estoque:</strong> 
                    {alertItems.length} {alertItems.length === 1 ? 'item' : 'itens'} 
                    {' '}em nível crítico de estoque
                </div>
            )}
            <div className={styles.estoque}>
                <div className={styles.nav}>
                    <h1>Estoque</h1>
                    <button
                        className={styles.voltar}
                        onClick={() => navigate('/menuprincipal')}
                    >
                        VOLTAR
                    </button>
                </div>

                {/* Barra de pesquisa */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Pesquisar por ID, nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.table}>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('codigo')} className={styles.sortableHeader}>
                                    ID {renderSortIcon('codigo')}
                                </th>
                                <th onClick={() => handleSort('nome')} className={styles.sortableHeader}>
                                    Nome {renderSortIcon('nome')}
                                </th>
                                <th onClick={() => handleSort('descricao')} className={styles.sortableHeader}>
                                    Descrição {renderSortIcon('descricao')}
                                </th>
                                <th onClick={() => handleSort('quantidade')} className={styles.sortableHeader}>
                                    Quantidade {renderSortIcon('quantidade')}
                                </th>
                                <th>QR Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => {
                                const status = getMaterialStatus(item.quantidade, item.limite);
                                return (
                                    <tr 
                                        key={item.codigo} 
                                        className={`
                                            ${status === 'warning' && styles.warningRow}
                                            ${status === 'critical' && styles.criticalRow}
                                        `}
                                    >
                                        <td>{item.codigo}</td>
                                        <td>{item.nome}</td>
                                        <td>{item.descricao}</td>
                                        <td>{item.quantidade}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleQRCodeClick(item)}
                                                className={styles.qrCodeButton}
                                                title="Visualizar QR Code"
                                            >
                                                <QrCode size={24} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Code Popup */}
            {selectedQRCode && (
                <div className={styles.qrCodePopup} onClick={handleBackdropClick}>
                    <div className={styles.qrCodePopupContent}>
                        <div className={styles.qrCodeHeader}>
                            <h3>QR Code do Item</h3>
                            <button 
                                onClick={closeQRCodePopup}
                                className={styles.closeIconButton}
                                aria-label="Fechar"
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.qrCodeInfo}>
                            <p className={styles.itemName}>{selectedQRCode.nome}</p>
                            <p className={styles.itemDesc}>{selectedQRCode.descricao}</p>
                        </div>
                        <div className={styles.qrCodeContainer}>
                            <QRCodeSVG 
                                value={generateQRCodeData(selectedQRCode)} 
                                width={200} 
                                height={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <div className={styles.qrCodeActions}>
                            <button 
                                onClick={() => handlePrint(selectedQRCode)}
                                className={styles.printButton}
                            >
                                <Printer size={20} />
                                Imprimir QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Estoque;