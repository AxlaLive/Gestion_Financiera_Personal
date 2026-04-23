import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transacciones/usuario/1');
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error', err);
      const message = err.response?.data || err.message || 'Error al cargar las transacciones';
      setError(message);
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Historial de Transacciones</h2>
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.descripcion} - ${transaction.monto} - {transaction.fecha}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;