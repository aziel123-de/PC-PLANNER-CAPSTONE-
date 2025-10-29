import React from "react";
import { NavLink } from "react-router-dom";
import "./PreBuilt_Nav.css";

const Navbar = () => {
  return (

    
    <div className="prebuilt-nav-header">
      <h2 className="prebuilt-title">Pre-built Builds</h2>
      <p className="prebuilt-desc">Pre-configured systems optimized for performance and value</p>
      <nav className="navbar">
        <NavLink to="/prebuilt/all" className="nav-item">All</NavLink>
        <NavLink to="/prebuilt/gaming" className="nav-item">Gaming</NavLink>
        <NavLink to="/prebuilt/productivity" className="nav-item">Productivity</NavLink>
        <NavLink to="/prebuilt/generaluse" className="nav-item">General Use</NavLink>
      </nav>
    </div>
  );
};

export default Navbar;
