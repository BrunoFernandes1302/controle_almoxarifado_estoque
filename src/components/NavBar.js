import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';

function NavBar() {
  return (
    <nav className={styles.navbar}>
      {/* Primeira coluna */}
      <div className={styles.col1}>
        <img 
          src="logoaxm.png" 
          alt="Logo" 
          className={styles.logo}
        />
        <p>Pare de perder tempo procurando e comece a ganhar tempo controlando. simples, rapido e eficaz!</p>
        <p>AXM: estoque inteligente, sucesso permanente!</p>
        <div>
          <Link to="/entrar">Entrar</Link>
          <Link to="/registrar">Registrar</Link>
        </div>
      </div>

      {/* Segunda coluna */}
      <div className={styles.col2}>
        <img 
          src="teste.png" 
          alt="Ícone adicional" 
          className={styles.icon}
        />
      </div>
    </nav>
  );
}


export default NavBar;
