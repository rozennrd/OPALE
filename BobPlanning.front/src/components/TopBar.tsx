import './TopBar.css'; 
import Logo from '../assets/Logo_Bob_Planning_Transparent.png'; 


const TopBar = () => {
    return (
        <div className="top-bar">
            <a href="/">
            <img className='logo' src={Logo} alt="Logo_Bob_Planning" />
            </a>
            <nav className="nav-links">
                <a href="/">Home</a>    
                <a href="/parametres">Paramètres</a>
                <a href="/calendriers">Calendriers</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    );
};

export default TopBar;