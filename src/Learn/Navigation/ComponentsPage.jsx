
import React from 'react';
import PROCESSOR from '../Components/PROCESSOR';
import GRAPHICS from '../Components/GRAPHICS';
import Mobo from '../Components/Mobo';
import Ram from '../Components/Ram';
import Storage from '../Components/Storage';
import PSU from '../Components/PSU';
import Case from '../Components/Case';
import Monitor from '../Components/Monitor';
import Keyboard from '../Components/Keyboard';
import Mouse from '../Components/Mouse';
import './ComponentsPage.css';
import Navbar from '../Navigation/Navbar.jsx';

function ComponentsPage() {
  return (
    <div className="components-page">
      <h1>Understanding PC Components</h1>
      <p className="page-description">Every PC is made up of several key components that 
        work together. Here's what each one does:</p>
         <Navbar />
      
      <div className="card-container">
        <PROCESSOR />
        <GRAPHICS />
        <Mobo />
        <Ram />
        <Storage />
        <PSU />
        <Case />
        <Monitor />
        <Keyboard />
        <Mouse />
      </div>
    </div>
  );
}

export default ComponentsPage;