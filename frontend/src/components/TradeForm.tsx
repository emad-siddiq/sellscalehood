import React, { useState, ChangeEvent, FormEvent } from 'react';

// Mock S&P 500 stocks list (replace with actual list in production)
const SP500_TICKERS = [
  "A", "AAL", "AAP", "AAPL", "ABBV", "ABC", "ABMD", "ABT", "ACN", "ADBE", "ADI", "ADM", "ADP", "ADSK", "AEE", "AEP", "AES", "AFL", "AIG", "AIZ", "AJG", "AKAM", "ALB", "ALGN", "ALK", "ALL", "ALLE", "AMAT", "AMCR", "AMD", "AME", "AMGN", "AMP", "AMT", "AMZN", "ANET", "ANSS", "ANTM", "AON", "AOS", "APA", "APD", "APH", "APTV", "ARE", "ATO", "ATVI", "AVB", "AVGO", "AVY", "AWK", "AXP", "AZO", "BA", "BAC", "BAX", "BBWI", "BBY", "BDX", "BEN", "BF.B", "BIIB", "BIO", "BK", "BKNG", "BKR", "BLK", "BLL", "BMY", "BR", "BRK.B", "BRO", "BSX", "BWA", "BXP", "C", "CAG", "CAH", "CARR", "CAT", "CB", "CBOE", "CBRE", "CCI", "CCL", "CDNS", "CDW", "CE", "CEG", "CERN", "CF", "CFG", "CHD", "CHRW", "CHTR", "CI", "CINF", "CL", "CLX", "CMA", "CMCSA", "CME", "CMG", "CMI", "CMS", "CNC", "CNP", "COF", "COO", "COP", "COST", "CPB", "CPRT", "CRL", "CRM", "CSCO", "CSX", "CTAS", "CTLT", "CTSH", "CTVA", "CTXS", "CVS", "CVX", "CZR", "D", "DAL", "DD", "DE", "DFS", "DG", "DGX", "DHI", "DHR", "DIS", "DISH", "DLR", "DLTR", "DOV", "DOW", "DPZ", "DRE", "DRI", "DTE", "DUK", "DVA", "DVN", "DXC", "DXCM", "EA", "EBAY", "ECL", "ED", "EFX", "EIX", "EL", "EMN", "EMR", "ENPH", "EOG", "EQIX", "EQR", "ES", "ESS", "ETN", "ETR", "ETSY", "EVRG", "EW", "EXC", "EXPD", "EXPE", "EXR", "F", "FANG", "FAST", "FB", "FBHS", "FCX", "FDS", "FDX", "FE", "FFIV", "FIS", "FISV", "FITB", "FLT", "FMC", "FOX", "FOXA", "FRC", "FRT", "FTNT", "FTV", "GD", "GE", "GILD", "GIS", "GL", "GLW", "GM", "GNRC", "GOOG", "GOOGL", "GPC", "GPN", "GRMN", "GS", "GWW", "HAL", "HAS", "HBAN", "HCA", "HD", "HES", "HIG", "HII", "HLT", "HOLX", "HON", "HPE", "HPQ", "HRL", "HSIC", "HST", "HSY", "HUM", "HWM", "IBM", "ICE", "IDXX", "IEX", "IFF", "ILMN", "INCY", "INTC", "INTU", "IP", "IPG", "IQV", "IR", "IRM", "ISRG", "IT", "ITW", "IVZ", "J", "JBHT", "JCI", "JKHY", "JNJ", "JNPR", "JPM", "K", "KEY", "KEYS", "KHC", "KIM", "KLAC", "KMB", "KMI", "KMX", "KO", "KR", "L", "LDOS", "LEN", "LH", "LHX", "LIN", "LKQ", "LLY", "LMT", "LNC", "LNT", "LOW", "LRCX", "LUMN", "LUV", "LVS", "LW", "LYB", "LYV", "MA", "MAA", "MAR", "MAS", "MCD", "MCHP", "MCK", "MCO", "MDLZ", "MDT", "MET", "MGM", "MHK", "MKC", "MKTX", "MLM", "MMC", "MMM", "MNST", "MO", "MOH", "MOS", "MPC", "MPWR", "MRK", "MRNA", "MRO", "MS", "MSCI", "MSFT", "MSI", "MTB", "MTCH", "MTD", "MU", "NCLH", "NDAQ", "NEE", "NEM", "NFLX", "NI", "NKE", "NLOK", "NLSN", "NOC", "NOW", "NRG", "NSC", "NTAP", "NTRS", "NUE", "NVDA", "NVR", "NWL", "NWS", "NWSA", "NXPI", "O", "ODFL", "OGN", "OKE", "OMC", "ORCL", "ORLY", "OTIS", "OXY", "PAYC", "PAYX", "PBCT", "PCAR", "PEAK", "PEG", "PENN", "PEP", "PFE", "PFG", "PG", "PGR", "PH", "PHM", "PKG", "PKI", "PLD", "PM", "PNC", "PNR", "PNW", "POOL", "PPG", "PPL", "PRGO", "PRU", "PSA", "PSX", "PTC", "PVH", "PWR", "PXD", "PYPL", "QCOM", "QRVO", "RCL", "RE", "REG", "REGN", "RF", "RHI", "RJF", "RL", "RMD", "ROK", "ROL", "ROP", "ROST", "RSG", "RTX", "SBAC", "SBUX", "SCHW", "SEE", "SHW", "SIVB", "SJM", "SLB", "SNA", "SNPS", "SO", "SPG", "SPGI", "SRE", "STE", "STT", "STX", "STZ", "SWK", "SWKS", "SYF", "SYK", "SYY", "T", "TAP", "TDG", "TDY", "TEL", "TER", "TFC", "TFX", "TGT", "TJX", "TMO", "TMUS", "TPR", "TRMB", "TROW", "TRV", "TSCO", "TSLA", "TSN", "TT", "TTWO", "TXN", "TXT", "TYL", "UA", "UAA", "UAL", "UDR", "UHS", "ULTA", "UNH", "UNM", "UNP", "UPS", "URI", "USB", "V", "VFC", "VIAC", "VLO", "VMC", "VNO", "VRSK", "VRSN", "VRTX", "VTR", "VTRS", "VZ", "WAB", "WAT", "WBA", "WDC", "WEC", "WELL", "WFC", "WHR", "WLTW", "WM", "WMB", "WMT", "WRB", "WRK", "WST", "WU", "WY", "WYNN", "XEL", "XLNX", "XOM", "XRAY", "XYL", "YUM", "ZBH", "ZBRA", "ZION", "ZTS"
]
interface FormData {
  ticker: string;
  quantity: string;
  action: string;
}

type StyleKey = 'card' | 'cardTitle' | 'form' | 'formGroup' | 'label' | 'input' | 'select' | 'button' | 'suggestions' | 'suggestion';

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
    try {
      const response = await fetch('http://localhost:5001/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      await response.json();
      alert(`Successfully ${formData.action === 'buy' ? 'bought' : 'sold'} ${formData.quantity} shares of ${formData.ticker}`);
      setFormData({ ticker: '', quantity: '', action: '' });
      onTradeComplete();
    } catch (error) {
      console.error('Error trading stock:', error);
      alert('Error trading stock. Please try again.');
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
      </form>
    </div>
  );
};

export default TradeForm;