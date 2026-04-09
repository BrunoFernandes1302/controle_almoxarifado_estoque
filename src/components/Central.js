import styles from './Central.module.css';
function Central ({titulo, texto, imagem}) {    
    return (
        <div className={styles.central}>
            <div>
                <h1>{titulo}</h1>
                <p>{texto}</p>
            </div>
            <img src={imagem} alt="Imagem" />
        </div>
    );
}

export default Central