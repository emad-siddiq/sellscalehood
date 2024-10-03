import React, { useState, useEffect } from 'react';

interface Stock {
  id: number;
  ticker: string;
  quantity: number;
}

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/portfolio');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPortfolio(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      }
    };

    fetchPortfolio();
  }, []);

  return (
    <div>
      <h2>Portfolio</h2>
      <ul>
        {portfolio.map((stock) => (
          <li key={stock.id}>
            {stock.ticker}: {stock.quantity} shares
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;