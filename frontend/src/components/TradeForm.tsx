import React, { useState, ChangeEvent, FormEvent } from 'react';

// Assuming SP500_TICKERS is imported or defined somewhere
const SP500_TICKERS = [
  "AAPL", "MSFT", "AMZN", "GOOGL", "FB", "TSLA", "BRK.B", "JPM", "JNJ", "V",
  // ... add more tickers as needed
];

interface FormData {
  ticker: string;
  quantity: string;
  action: string;
}

type StyleKey = 'card' | 'cardTitle' | 'form' | 'formGroup' | 'label' | 'input' | 'select' | 'button' | 'suggestions' | 'suggestion' | 'errorMessage' | 'successMessage';

type Styles = {
  [key in StyleKey]: React.CSSProperties;
};

interface TradeFormProps {
  onTradeComplete: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onTradeComplete }) => {
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    quantity: '',
    action: ''
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    if (name === 'ticker') {
      const filteredSuggestions = SP500_TICKERS.filter(stock =>
        stock.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
    }

    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prevData => ({
      ...prevData,
      ticker: suggestion
    }));
    setSuggestions([]);
  };

  const handleTrade = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5001/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred during the trade');
      }

      setSuccessMessage(data.message);
      setFormData({ ticker: '', quantity: '', action: '' });
      onTradeComplete();
    } catch (error) {
      console.error('Error trading stock:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again later.');
      }
    }
  };

  const styles: Styles = {
    card: {
      backgroundColor: '#1E1E1E',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '24px',
      width: '400px',
      margin: '20px auto',
    },
    cardTitle: {
      color: '#00C805',
      fontSize: '24px',
      fontWeight: 500,
      marginBottom: '24px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    formGroup: {
      marginBottom: '20px',
      position: 'relative',
    },
    label: {
      display: 'block',
      color: '#00C805',
      marginBottom: '8px',
      fontSize: '14px',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: '#2C2C2C',
      border: '1px solid #434343',
      borderRadius: '4px',
      color: '#FFFFFF',
      fontSize: '14px',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: '#2C2C2C',
      border: '1px solid #434343',
      borderRadius: '4px',
      color: '#FFFFFF',
      fontSize: '14px',
      transition: 'all 0.3s',
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2300C805' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '30px',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#00C805',
      border: 'none',
      borderRadius: '4px',
      color: '#000000',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 500,
      transition: 'background-color 0.3s',
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#2C2C2C',
      border: '1px solid #434343',
      borderTop: 'none',
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      zIndex: 1,
      width: '100%',
      boxSizing: 'border-box',
    },
    suggestion: {
      padding: '8px 12px',
      cursor: 'pointer',
      color: '#FFFFFF',
      transition: 'background-color 0.3s',
    },
    errorMessage: {
      color: '#FF4136',
      fontSize: '14px',
      marginTop: '8px',
      textAlign: 'center',
    },
    successMessage: {
      color: '#00C805',
      fontSize: '14px',
      marginTop: '8px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Trade Stocks</h2>
      <form style={styles.form} onSubmit={handleTrade}>
        <div style={styles.formGroup}>
          <label htmlFor="ticker" style={styles.label}>Stock Ticker</label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Enter stock ticker"
            required
          />
          {suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.suggestion,
                    backgroundColor: index % 2 === 0 ? '#2C2C2C' : '#383838',
                  }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="quantity" style={styles.label}>Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Enter quantity"
            min="1"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="action" style={styles.label}>Action</label>
          <select
            id="action"
            name="action"
            value={formData.action}
            onChange={handleInputChange}
            style={styles.select}
            required
          >
            <option value="">Select an action</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <button type="submit" style={styles.button}>Execute Trade</button>

        {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
        {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      </form>
    </div>
  );
};

export default TradeForm;