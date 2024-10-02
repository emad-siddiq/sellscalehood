import React from 'react';
import StockSearch from './components/StockSearch';
import Portfolio from './components/Portfolio';
import TradeForm from './components/TradeForm';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>SellScaleHood Financial App</h1>
      <StockSearch />
      <TradeForm />
      <Portfolio />
    </div>
  );
};
export default App;
