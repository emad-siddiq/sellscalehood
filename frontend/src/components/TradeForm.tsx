import React, { useState } from 'react';

const TradeForm: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');

  const handleTrade = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          quantity,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await response.json();
      alert(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${ticker}`);
      setTicker('');
      setQuantity(0);
    } catch (error) {
      console.error('Error trading stock:', error);
      alert('Error trading stock. Please try again.');
    }
  };

  return (
    <div>
      <h2>Trade Stocks</h2>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Enter stock ticker"
      />
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
        placeholder="Enter quantity"
      />
      <select value={action} onChange={(e) => setAction(e.target.value as 'buy' | 'sell')}>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <button onClick={handleTrade}>Execute Trade</button>
    </div>
  );
};

export default TradeForm;