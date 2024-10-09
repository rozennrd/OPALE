import './TopBar.css'; // Make sure to create a corresponding CSS file for styling
import Logo from '../assets/Logo_Bob_Planning_Transparent.png'; // Make sure to create a corresponding image file for the logo


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