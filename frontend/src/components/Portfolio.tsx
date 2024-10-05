import React, { useState, useEffect } from 'react';
import { Table, Typography, Card, Spin, message } from 'antd';
import { StockOutlined } from '@ant-design/icons';
import './../darkTheme.css';  // Ensure you import your CSS file

const { Title } = Typography;

interface Stock {
  id: number;
  ticker: string;
  quantity: number;
  currentPrice?: number;
  totalValue?: number;
}

interface PortfolioProps {
  compact?: boolean;
  expanded?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ compact = false, expanded = false }) => {
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/portfolio');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const enhancedData = data.map((stock: Stock) => ({
          ...stock,
          currentPrice: Math.random() * 1000,
          totalValue: stock.quantity * (Math.random() * 1000),
        }));
        setPortfolio(enhancedData);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        message.error('Failed to fetch portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleRowClick = (record: Stock) => {
    setSelectedRowKey(record.id);  // Set selected row by stock id
  };

  const rowClassName = (record: Stock) => {
    return record.id === selectedRowKey ? 'selected-row' : 'portfolio-row';
  };

  const columns = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  const compactColumns = columns.slice(0, 2);  // Only show Ticker and Quantity in compact mode

  return (
    <div style={{ padding: '20px', height: '100%', backgroundColor: '#000000'}}>
      <Card
        title={<Title level={4} style={{color: 'var(--rh-green)' }}><StockOutlined  style={{color: 'var(--rh-green)' }}/> Your Portfolio</Title>}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: "#1E1E1E" }}  // Ensure Card background is gray
        bodyStyle={{ flex: 1, padding: 0, backgroundColor: '#1E1E1E' }}  // Ensure Card body has the same background color
      >
        <Table
          dataSource={portfolio}
          columns={compact ? compactColumns : columns}
          rowKey="id"
          pagination={compact ? { pageSize: 5 } : false}
          loading={{
            indicator: <Spin size="large" />,
            spinning: loading,
          }}
          scroll={expanded ? { y: 'calc(100% - 100px)' } : { y: 'calc(100% - 150px)' }}
          style={{ flex: 1}}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName={rowClassName}  // Apply row className conditionally
        />
      </Card>
    </div>
  );
};

export default Portfolio;