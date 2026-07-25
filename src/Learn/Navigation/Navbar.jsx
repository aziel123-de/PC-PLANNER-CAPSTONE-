import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
  <NavLink to="/learn/components" className="nav-item">Components</NavLink>
  <NavLink to="/learn/compatibility" className="nav-item">Compatibility</NavLink>
  <NavLink to="/learn/bottlenecks" className="nav-item">Bottlenecks</NavLink>
  <NavLink to="/learn/budget-tips" className="nav-item">Budget Tips</NavLink>
      
    </nav>
  );
};

export default Navbar;