import React, { useState } from 'react';

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
}

const StockSearch: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/stock/${ticker}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStockInfo(data);
    } catch (error) {
      console.error('Error fetching stock info:', error);
    }
  };

  return (
    <div>
      <h2>Stock Search</h2>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Enter stock ticker"
      />
      <button onClick={handleSearch}>Search</button>
      {stockInfo && (
        <div>
          <h3>{stockInfo.name} ({stockInfo.symbol})</h3>
          <p>Current Price: ${stockInfo.price}</p>
        </div>
      )}
    </div>
  );
};

export default StockSearch;