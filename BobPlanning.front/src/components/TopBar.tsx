import './TopBar.css'; // Make sure to create a corresponding CSS file for styling
import Logo from '../assets/Logo_Bob_Planning_Transparent.png'; // Make sure to create a corresponding image file for the logo


const TopBar = () => {
    return (
        <div className="top-bar">
            <img className='logo' src={Logo} alt="Logo_Bob_Planning" />
            <nav className="nav-links">
                <a href="/home">Home</a>
                <a href="/about">About</a>
                <a href="/services">Services</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    );
};

export default TopBar;