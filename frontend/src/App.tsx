import React, { useState } from 'react';
import { Layout, Typography, Menu, Row, Col } from 'antd';
import { 
  LineChartOutlined, 
  PieChartOutlined, 
} from '@ant-design/icons';
import StockSearch from './components/StockSearch';
import Portfolio from './components/Portfolio';
import TradeForm from './components/TradeForm';
import './darkTheme.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'portfolio'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMenuClick = (key: string) => {
    if (key === '1') {
      setActiveView('dashboard');
    } else if (key === '2') {
      setActiveView('portfolio');
    }
  };

  const handleTradeComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--rh-black)' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          background: 'var(--rh-black)'
        }}
      >
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'var(--rh-black)' }} />
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['1']}
          onClick={({ key }) => handleMenuClick(key.toString())}
          style={{ background: 'var(--rh-black)' }}
        >
          <Menu.Item key="1" icon={<LineChartOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<PieChartOutlined />}>
            Portfolio
          </Menu.Item>
          
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: 200, background: 'var(--rh-black)' }}>
        <Header style={{ background: 'var(--rh-black)', padding: 0, borderBottom: '1px solid var(--rh-border)' }}>
          <Title level={3} style={{ color: 'var(--rh-white)', margin: '16px 24px' }}>
            {activeView === 'dashboard' ? 'Scalehood Dashboard' : 'Your Portfolio'}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: 'var(--rh-black)', minHeight: 'calc(100vh - 112px)' }}>
            {activeView === 'dashboard' ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12} style={{ height: '100%' }}>
                  <StockSearch />
                </Col>
                <Col xs={24} lg={12} style={{ height: '100%' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <TradeForm onTradeComplete={handleTradeComplete} />
                  </div>
                  <Portfolio refreshTrigger={refreshTrigger} />
                </Col>
              </Row>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={16} style={{ height: '100%' }}>
                  <Portfolio expanded refreshTrigger={refreshTrigger} />
                </Col>
                <Col xs={24} lg={8} style={{ height: '100%' }}>
                  <TradeForm onTradeComplete={handleTradeComplete} />
                </Col>
              </Row>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;