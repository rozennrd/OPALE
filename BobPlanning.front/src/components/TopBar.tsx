import './TopBar.css'; 
import Logo from '../assets/Logo_Bob_Planning_Transparent.png'; 
import { Link } from 'react-router-dom';  // Importez Link

const TopBar = () => {
    return (
        <div className="top-bar">
            <Link to="/">  {/* Utilisez Link au lieu de a */}
                <img className='logo' src={Logo} alt="Logo_Bob_Planning" />
            </Link>
            <nav className="nav-links">
                <Link to="/TrueHome">Home</Link>    
                <Link to="/parametres">Paramètres</Link>
                <Link to="/calendriers">Calendriers</Link>
                <Link to="/contact">Contact</Link>
            </nav>
        </div>
    );
};

export default TopBar;