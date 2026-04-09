import React from 'react';
import Select from 'react-select';
import styles from './Select.module.css';

function Seletor({ text, name, options, value, handleChange }) {
    // Formatando as opções para o formato que o react-select espera
    const formattedOptions = options.map(option => ({
        value: option.value,
        label: option.label,
    }));

    return (
        <div className={styles.form_control}>
            <label htmlFor={name}>{text}:</label>
            <Select 
                name={name}
                value={options.find(option => option.value === value)} 
                onChange={handleChange}
                options={options}
                placeholder="Selecione uma opção"
            />
        </div>
    );
}

export default Seletor;
