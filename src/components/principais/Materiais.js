import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Materiais.module.css';
import fundo from '../../images/CAPA.png';
import SubmitButton from '../../form/SubmitButton';
import { X } from 'lucide-react';

function Materiais() {
    const navigate = useNavigate();
    const [materiais, setMateriais] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [successMessage, setSuccessMessage] = useState('');
    const [editingMaterial, setEditingMaterial] = useState({
        nome: '',
        descricao: '',
        quantidade: 0,
        limite: 0
    });

    // Novos estados para o popup de senha
    const [showSenhaPopup, setShowSenhaPopup] = useState(false);
    const [senha, setSenha] = useState('');
    const [acaoConfirmada, setAcaoConfirmada] = useState(null);
    const [materialParaExcluir, setMaterialParaExcluir] = useState(null);

    useEffect(() => {
        fetchMateriais();
    }, []);

    const fetchMateriais = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/material');
            if (!response.ok) throw new Error('Erro ao buscar materiais');
            const data = await response.json();
            setMateriais(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedMateriais = [...materiais].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

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

    const handleEdit = (material) => {
        if (window.confirm('Deseja realmente editar este material?')) {
            setEditingId(material.codigo);
            setEditingMaterial({
                nome: material.nome,
                descricao: material.descricao,
                quantidade: material.quantidade,
                limite: material.limite
            });
        }
    };

    const handleDelete = async (codigo, quantidade) => {
        if (quantidade > 0) {
            alert('Não é possível excluir um material que ainda possui quantidade em estoque.');
            return;
        }

        if (window.confirm('Tem certeza que deseja excluir este material?')) {
            setMaterialParaExcluir({ codigo });
            setAcaoConfirmada('excluir');
            setShowSenhaPopup(true);
            setSenha('');
        }
    };

    const handleSave = () => {
        setAcaoConfirmada('editar');
        setShowSenhaPopup(true);
        setSenha('');
    };

    const handleConfirmarSenha = async () => {
        if (senha !== "0000") {
            alert("Senha incorreta!");
            return;
        }

        try {
            if (acaoConfirmada === 'editar') {
                const response = await fetch(`http://localhost:3001/api/material/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(editingMaterial),
                });

                if (!response.ok) throw new Error('Erro ao atualizar material');
                
                setMateriais(materiais.map(mat => 
                    mat.codigo === editingId ? { ...mat, ...editingMaterial } : mat
                ));
                
                setEditingId(null);
                setEditingMaterial({
                    nome: '',
                    descricao: '',
                    quantidade: 0
                });
                
                setSuccessMessage('Material atualizado com sucesso!');
            } else if (acaoConfirmada === 'excluir') {
                const response = await fetch(`http://localhost:3001/api/material/${materialParaExcluir.codigo}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok) {
                    alert("Não é possivel deletar material com registro de entrada ou saida!");
                    return;
                }

                setMateriais(materiais.filter(mat => mat.codigo !== materialParaExcluir.codigo));
                setSuccessMessage('Material excluído com sucesso!');
            }

            setShowSenhaPopup(false);
            setSenha('');
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (err) {
            setError(err.message);
            alert('Erro ao processar operação');
        }
    };

    const filteredMateriais = sortedMateriais.filter(material =>
        material.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return ' ↕';
    };

    return (
        <div className={styles.fundo} style={{backgroundImage: `url(${fundo})`, backgroundRepeat: 'repeat', backgroundSize: '150px 150px'}}>
            <div className={styles.materiais}>
                {error && <div className={styles.error}>{error}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}
                
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Pesquisar material por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <table className={styles.table}>
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
                            <th onClick={() => handleSort('limite')} className={styles.sortableHeader}>
                                Limite {renderSortIcon('limite')}
                            </th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMateriais.map((material) => (
                            <tr key={material.codigo}>
                                <td>{material.codigo}</td>
                                <td>
                                    {editingId === material.codigo ? (
                                        <input
                                            type="text"
                                            value={editingMaterial.nome}
                                            onChange={(e) => setEditingMaterial({
                                                ...editingMaterial,
                                                nome: e.target.value
                                            })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        material.nome
                                    )}
                                </td>
                                <td>
                                    {editingId === material.codigo ? (
                                        <input
                                            type="text"
                                            value={editingMaterial.descricao}
                                            onChange={(e) => setEditingMaterial({
                                                ...editingMaterial,
                                                descricao: e.target.value
                                            })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        material.descricao
                                    )}
                                </td>
                                <td>
                                    {editingId === material.codigo ? (
                                        <input
                                            type="number"
                                            value={editingMaterial.quantidade}
                                            onChange={(e) => setEditingMaterial({
                                                ...editingMaterial,
                                                quantidade: parseInt(e.target.value)
                                            })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        material.quantidade
                                    )}
                                </td>
                                <td>
                                    {editingId === material.codigo ? (
                                        <input
                                            type="number"
                                            value={editingMaterial.limite}
                                            onChange={(e) => setEditingMaterial({
                                                ...editingMaterial,
                                                limite: parseInt(e.target.value)
                                            })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        material.limite
                                    )}
                                </td>
                                <td>
                                    {editingId === material.codigo ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className={`${styles.actionButton} ${styles.saveButton}`}
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(material)}
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(material.codigo, material.quantidade)}
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                            >
                                                Excluir
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Popup de senha */}
                {showSenhaPopup && (
                    <div className={styles.popupOverlay}>
                        <div className={styles.popup}>
                            <button 
                                className={styles.closeButton}
                                onClick={() => setShowSenhaPopup(false)}
                            >
                                <X size={24} />
                            </button>
                            <h2>{acaoConfirmada === 'editar' ? 'Confirmar Edição' : 'Confirmar Exclusão'}</h2>
                            <p>Digite a senha para continuar:</p>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className={styles.senhaInput}
                            />
                            <button 
                                onClick={handleConfirmarSenha}
                                className={styles.confirmarButton}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                )}

                <SubmitButton text="Voltar" onClick={() => navigate('/menuprincipal')} />
            </div>
        </div>
    );
}

export default Materiais;