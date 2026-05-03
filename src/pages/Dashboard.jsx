import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard Financiero</h1>
      <nav>
        <Link to="/transactions">Ver Historial de Transacciones</Link>
        <br />
        <Link to="/login">Login</Link>
        <br />
        <Link to="/registro">Registro</Link>
      </nav>
    </div>
  );
};

export default Dashboard;