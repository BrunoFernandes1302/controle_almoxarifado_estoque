import styles from './QrCode.module.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function QrCode() {
    const navigate = useNavigate();
    const scannerRef = useRef(null);
    const [scannerOn, setScannerOn] = useState(false);

    useEffect(() => {
        if (scannerOn) {
            scannerRef.current = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: 250 }
            );
            
            const onScanSuccess = async (decodedText) => {
                try {
                    // Primeiro, pare o scanner
                    if (scannerRef.current) {
                        await scannerRef.current.clear();
                    }
                    
                    setScannerOn(false);
                    
                    // Tenta fazer o parse do JSON do QR code
                    const qrData = JSON.parse(decodedText);
                    
                    if (window.confirm("QR Code lido com sucesso. Deseja continuar?")) {
                        // Navega para Saida com os dados do QR e itemSelecionado como true
                        navigate('/saida', { 
                            state: { 
                                qrData: qrData,
                                fromQrCode: true // Indica que veio do QR code
                            } 
                        });
                    }
                } catch (error) {
                    console.error("Erro ao processar QR code:", error);
                    alert("QR code inválido. Certifique-se que o formato é JSON válido.");
                    
                    setTimeout(() => {
                        if (!scannerRef.current) {
                            setScannerOn(true);
                        }
                    }, 100);
                }
            };

            const onScanError = (errorMessage) => {
                console.warn(errorMessage);
            };

            scannerRef.current.render(onScanSuccess, onScanError);
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, [scannerOn, navigate]);

    const handleStartScanner = () => {
        setScannerOn(true);
    };

    const handleStopScanner = async () => {
        if (scannerRef.current) {
            await scannerRef.current.clear();
        }
        setScannerOn(false);
    };

    return (
        <div className={styles.fundo}>
            <div className={styles.qr}>
                <div className={styles.qrCode}>
                    <h1>Leitor de QR Code</h1>
                    <button 
                        className={styles.button} 
                        onClick={handleStartScanner}
                        disabled={scannerOn}
                    >
                        Ligar Scanner
                    </button>
                    <button 
                        className={styles.button} 
                        onClick={handleStopScanner} 
                        disabled={!scannerOn}
                    >
                        Desligar Scanner
                    </button>
                    <button 
                        className={styles.button} 
                        onClick={() => navigate('/saida')}
                    >
                        Voltar
                    </button>
                    <div id="qr-reader" style={{ display: scannerOn ? 'block' : 'none' }}></div>
                </div>
            </div>
        </div>
    );
}

export default QrCode;