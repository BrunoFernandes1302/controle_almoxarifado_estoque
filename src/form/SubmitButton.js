import styles from './SubmitButton.module.css';

function SubmitButton({ text, onClick }) {
    return (
        <div>
            <button className={styles.btn} onClick={onClick}>
                {text}
            </button>
        </div>
    );
}

export default SubmitButton;
