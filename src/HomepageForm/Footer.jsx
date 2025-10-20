import { useState } from "react";
import './Footer.css';

function Footer(){
    return(
    
        <footer className="site-footer">
  <div className="footer-container">
    
    <p className="developers-text">Developed by: Maligaya, Manuel, Sadangsal, Verecio</p>
    <p className="footer-text">&copy; {new Date().getFullYear()} PC Planner. All rights reserved.</p>
    <div className="footer-links">
      <a href="#">Contact Us</a>
    </div>
  </div>
</footer>


    );
}
export default Footer;