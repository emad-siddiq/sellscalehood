import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title, Text } = Typography;

interface HistoricalDataPoint {
  date: string;
  close: number;
}

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  historicalData: HistoricalDataPoint[];
}

// Array of appropriate ticker symbols and company names
const funnyTickers = [
  { symbol: 'JAVA', name: 'Just Another Value Asset, Inc.' },
  { symbol: 'ALGO', name: 'Algorithmic Growth Opportunities, Ltd.' },
  { symbol: 'CODE', name: 'Coders On Demand Enterprise' },
  { symbol: 'BYTE', name: 'Better Yield Tech Exports' },
  { symbol: 'GEEK', name: 'Global Engineering & Electronics Kinetics' },
  { symbol: 'SUDO', name: 'Sustainable Development Utilities Organization' },
  { symbol: 'HACK', name: 'Highly Advanced Computing Knowledge' },
  { symbol: 'TECH', name: 'Total Electronic Commerce Holdings' },
  { symbol: 'IDEA', name: 'Innovative Designs & Engineering Applications' },
  { symbol: 'SOFT', name: 'Solutions for Tomorrow Software' }
];

// Function to generate random stock data with an appropriate ticker
const generateRandomStockData = (): StockInfo => {
  const randomTicker = funnyTickers[Math.floor(Math.random() * funnyTickers.length)];
  const today = new Date();
  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      close: 100 + Math.random() * 20 - 10 // Random value between 90 and 110
    };
  });

  return {
    symbol: randomTicker.symbol,
    name: randomTicker.name,
    price: historicalData[historicalData.length - 1].close,
    historicalData: historicalData
  };
};

const StockSearch: React.FC = () => {
  const [ticker, setTicker] = useState<string>('');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRandomData, setIsRandomData] = useState<boolean>(false);

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    setIsRandomData(false);
    try {
      const response = await fetch(`http://localhost:5001/api/stock/${symbol}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: StockInfo = await response.json();
      setStockInfo(data);
    } catch (error) {
      console.error('Error fetching stock info:', error);
      message.warning('Failed to fetch real data. Showing example stock data instead.');
      setStockInfo(generateRandomStockData());
      setIsRandomData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData('AAPL');
  }, []);

  const handleSearch = () => {
    if (!ticker) {
      message.warning('Please enter a stock ticker');
      return;
    }
    fetchStockData(ticker);
  };

  const chartData = stockInfo?.historicalData || [];
  const latestPrice = stockInfo?.price || 0;
  const firstPrice = chartData[0]?.close || 0;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercentage = (priceChange / firstPrice) * 100;
  const priceColor = priceChange >= 0 ? '#00C805' : '#FF5000';

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      backgroundColor: '#121212', 
      minHeight: '100vh'
    }}>
      <Card 
        title="Stock Search" 
        style={{ 
          backgroundColor: '#1E1E1E', 
          border: '1px solid #333' 
        }}
        headStyle={{ 
          backgroundColor: '#252525', 
          color: '#E0E0E0', 
          borderBottom: '1px solid #333' 
        }}
      >
        <Input.Search
          placeholder="Enter a stock ticker to see data"
          enterButton={
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              style={{ backgroundColor: '#00C805', borderColor: '#00C805' }}
            >
              Search
            </Button>
          }
          size="large"
          value={ticker}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicker(e.target.value)}
          onSearch={handleSearch}
          loading={loading}
          style={{ 
            backgroundColor: '#252525', 
            borderColor: '#333' 
          }}
        />
      </Card>
      <Card 
        style={{ 
          marginTop: '20px', 
          backgroundColor: '#1E1E1E', 
          border: '1px solid #333' 
        }}
      >
        <Spin spinning={loading}>
          {stockInfo && (
            <>
              <Title level={3} style={{ color: '#E0E0E0' }}>{stockInfo.name} ({stockInfo.symbol})</Title>
              <Text strong style={{ color: priceColor }}>
                Current Price: ${latestPrice.toFixed(2)}
              </Text>
              <Text style={{ marginLeft: '10px', color: priceColor }}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercentage.toFixed(2)}%)
              </Text>
              {isRandomData && (
                <Text style={{ display: 'block', color: '#888', marginTop: '10px' }}>
                  Note: This is example data for demonstration purposes.
                </Text>
              )}
            </>
          )}
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick: string) => new Date(tick).toLocaleDateString()}
                  stroke="#E0E0E0"
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(tick: number) => `$${tick.toFixed(2)}`}
                  stroke="#E0E0E0"
                />
                <Tooltip 
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString()}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Close']}
                  contentStyle={{ backgroundColor: '#252525', border: '1px solid #333', color: '#E0E0E0' }}
                />
                <Line type="monotone" dataKey="close" stroke="#00C805" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default StockSearch;