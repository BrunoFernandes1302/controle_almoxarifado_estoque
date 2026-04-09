import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import styles from './Footer.module.css';
function Footer() {
    return (
        <footer className={styles.footer}>
            <p>&copy; 2025 AXM. Todos os direitos reservados.</p>
            <div>
                <a href="https://wa.me/5551999999999" target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                </a>
                <a href="https://www.linkedin.com/in/username" target="_blank" rel="noopener noreferrer">
                    <LinkedInIcon />
                </a>
                <a href="https://www.instagram.com/username" target="_blank" rel="noopener noreferrer">
                    <InstagramIcon />
                </a>
                <a href="mailto:0kZQf@example.com" target="_blank" rel="noopener noreferrer">
                    <EmailIcon />
                </a>
            </div>
        </footer>
    );
}

export default Footer;