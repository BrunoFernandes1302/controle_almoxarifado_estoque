import styles from './Centraldois.module.css';
function Centraldois ({titulo, texto, imagem}) {    
    return (
        <div className={styles.central}>
            <img src={imagem} alt="Imagem" />
            <div>
                <h1>{titulo}</h1>
                <p>{texto}</p>
            </div>
        </div>
    );
}

export default Centraldois