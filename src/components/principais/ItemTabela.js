import React from 'react';

function ItemTabela({ nome, descricao, quantidade }) {
    return (
        <tr>
            <td>{nome}</td>
            <td>{descricao}</td>
            <td>{quantidade}</td>
        </tr>
    );
}

export default ItemTabela;
