import { useState } from "react";
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer(){
    return(
    
        <footer className="site-footer">
  <div className="footer-container">
    
    <p className="developers-text">Developed by: Maligaya, Manuel, Sadangsal, Verecio</p>
    <p className="footer-text">&copy; {new Date().getFullYear()} PC Planner. All rights reserved.</p>
    <div className="footer-links">
      <Link to="/contact">Contact Us</Link>
    </div>
  </div>
</footer>


    );
}
export default Footer;