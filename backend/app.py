import logging
import sys
import warnings
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import yfinance as yf
from datetime import datetime, timedelta
import os
from pandas.errors import SettingWithCopyWarning
from requests.exceptions import RequestException
import time
import difflib

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('/app/app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Suppress warnings
warnings.simplefilter(action="ignore", category=FutureWarning)
warnings.simplefilter(action="ignore", category=SettingWithCopyWarning)

app = Flask(__name__)
CORS(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
try:
    db = SQLAlchemy(app)
    logger.info("SQLAlchemy initialized successfully")
except Exception as e:
    logger.error(f"Error initializing SQLAlchemy: {str(e)}", exc_info=True)
    raise

# Define Portfolio model
class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

# Create tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}", exc_info=True)
        raise

# S&P 500 tickers list (as of October 2024)
SP500_TICKERS = [
    "A", "AAL", "AAP", "AAPL", "ABBV", "ABC", "ABMD", "ABT", "ACN", "ADBE", "ADI", "ADM", "ADP", "ADSK", "AEE", "AEP", "AES", "AFL", "AIG", "AIZ", "AJG", "AKAM", "ALB", "ALGN", "ALK", "ALL", "ALLE", "AMAT", "AMCR", "AMD", "AME", "AMGN", "AMP", "AMT", "AMZN", "ANET", "ANSS", "ANTM", "AON", "AOS", "APA", "APD", "APH", "APTV", "ARE", "ATO", "ATVI", "AVB", "AVGO", "AVY", "AWK", "AXP", "AZO", "BA", "BAC", "BAX", "BBWI", "BBY", "BDX", "BEN", "BF.B", "BIIB", "BIO", "BK", "BKNG", "BKR", "BLK", "BLL", "BMY", "BR", "BRK.B", "BRO", "BSX", "BWA", "BXP", "C", "CAG", "CAH", "CARR", "CAT", "CB", "CBOE", "CBRE", "CCI", "CCL", "CDNS", "CDW", "CE", "CEG", "CERN", "CF", "CFG", "CHD", "CHRW", "CHTR", "CI", "CINF", "CL", "CLX", "CMA", "CMCSA", "CME", "CMG", "CMI", "CMS", "CNC", "CNP", "COF", "COO", "COP", "COST", "CPB", "CPRT", "CRL", "CRM", "CSCO", "CSX", "CTAS", "CTLT", "CTSH", "CTVA", "CTXS", "CVS", "CVX", "CZR", "D", "DAL", "DD", "DE", "DFS", "DG", "DGX", "DHI", "DHR", "DIS", "DISH", "DLR", "DLTR", "DOV", "DOW", "DPZ", "DRE", "DRI", "DTE", "DUK", "DVA", "DVN", "DXC", "DXCM", "EA", "EBAY", "ECL", "ED", "EFX", "EIX", "EL", "EMN", "EMR", "ENPH", "EOG", "EQIX", "EQR", "ES", "ESS", "ETN", "ETR", "ETSY", "EVRG", "EW", "EXC", "EXPD", "EXPE", "EXR", "F", "FANG", "FAST", "FB", "FBHS", "FCX", "FDS", "FDX", "FE", "FFIV", "FIS", "FISV", "FITB", "FLT", "FMC", "FOX", "FOXA", "FRC", "FRT", "FTNT", "FTV", "GD", "GE", "GILD", "GIS", "GL", "GLW", "GM", "GNRC", "GOOG", "GOOGL", "GPC", "GPN", "GRMN", "GS", "GWW", "HAL", "HAS", "HBAN", "HCA", "HD", "HES", "HIG", "HII", "HLT", "HOLX", "HON", "HPE", "HPQ", "HRL", "HSIC", "HST", "HSY", "HUM", "HWM", "IBM", "ICE", "IDXX", "IEX", "IFF", "ILMN", "INCY", "INTC", "INTU", "IP", "IPG", "IQV", "IR", "IRM", "ISRG", "IT", "ITW", "IVZ", "J", "JBHT", "JCI", "JKHY", "JNJ", "JNPR", "JPM", "K", "KEY", "KEYS", "KHC", "KIM", "KLAC", "KMB", "KMI", "KMX", "KO", "KR", "L", "LDOS", "LEN", "LH", "LHX", "LIN", "LKQ", "LLY", "LMT", "LNC", "LNT", "LOW", "LRCX", "LUMN", "LUV", "LVS", "LW", "LYB", "LYV", "MA", "MAA", "MAR", "MAS", "MCD", "MCHP", "MCK", "MCO", "MDLZ", "MDT", "MET", "MGM", "MHK", "MKC", "MKTX", "MLM", "MMC", "MMM", "MNST", "MO", "MOH", "MOS", "MPC", "MPWR", "MRK", "MRNA", "MRO", "MS", "MSCI", "MSFT", "MSI", "MTB", "MTCH", "MTD", "MU", "NCLH", "NDAQ", "NEE", "NEM", "NFLX", "NI", "NKE", "NLOK", "NLSN", "NOC", "NOW", "NRG", "NSC", "NTAP", "NTRS", "NUE", "NVDA", "NVR", "NWL", "NWS", "NWSA", "NXPI", "O", "ODFL", "OGN", "OKE", "OMC", "ORCL", "ORLY", "OTIS", "OXY", "PAYC", "PAYX", "PBCT", "PCAR", "PEAK", "PEG", "PENN", "PEP", "PFE", "PFG", "PG", "PGR", "PH", "PHM", "PKG", "PKI", "PLD", "PM", "PNC", "PNR", "PNW", "POOL", "PPG", "PPL", "PRGO", "PRU", "PSA", "PSX", "PTC", "PVH", "PWR", "PXD", "PYPL", "QCOM", "QRVO", "RCL", "RE", "REG", "REGN", "RF", "RHI", "RJF", "RL", "RMD", "ROK", "ROL", "ROP", "ROST", "RSG", "RTX", "SBAC", "SBUX", "SCHW", "SEE", "SHW", "SIVB", "SJM", "SLB", "SNA", "SNPS", "SO", "SPG", "SPGI", "SRE", "STE", "STT", "STX", "STZ", "SWK", "SWKS", "SYF", "SYK", "SYY", "T", "TAP", "TDG", "TDY", "TEL", "TER", "TFC", "TFX", "TGT", "TJX", "TMO", "TMUS", "TPR", "TRMB", "TROW", "TRV", "TSCO", "TSLA", "TSN", "TT", "TTWO", "TXN", "TXT", "TYL", "UA", "UAA", "UAL", "UDR", "UHS", "ULTA", "UNH", "UNM", "UNP", "UPS", "URI", "USB", "V", "VFC", "VIAC", "VLO", "VMC", "VNO", "VRSK", "VRSN", "VRTX", "VTR", "VTRS", "VZ", "WAB", "WAT", "WBA", "WDC", "WEC", "WELL", "WFC", "WHR", "WLTW", "WM", "WMB", "WMT", "WRB", "WRK", "WST", "WU", "WY", "WYNN", "XEL", "XLNX", "XOM", "XRAY", "XYL", "YUM", "ZBH", "ZBRA", "ZION", "ZTS"
]

def get_stock_data_with_retry(ticker, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            stock = yf.Ticker(ticker)
            info = stock.info
            if info and 'symbol' in info:
                return stock, info
        except RequestException as e:
            logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(delay * (2 ** attempt))  # Exponential backoff
    return None, None

def find_closest_ticker(ticker):
    matches = difflib.get_close_matches(ticker.upper(), SP500_TICKERS, n=1, cutoff=0.6)
    return matches[0] if matches else None

@app.route('/', methods=['GET'])
def health_check():
    logger.info("Health check endpoint called")
    health_status = {
        'status': 'healthy',
        'database': 'unhealthy'
    }
    status_code = 200

    # Check database connection
    try:
        db.session.execute('SELECT 1')
        health_status['database'] = 'healthy'
        logger.info("Health check passed")
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['database_error'] = str(e)
        status_code = 500
        logger.error(f"Health check failed: {str(e)}", exc_info=True)

    return jsonify(health_status), status_code

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    logger.info("Get portfolio endpoint called")
    try:
        portfolio = Portfolio.query.all()
        logger.info(f"Retrieved {len(portfolio)} portfolio items")
        return jsonify([{'id': stock.id, 'ticker': stock.ticker, 'quantity': stock.quantity} for stock in portfolio])
    except Exception as e:
        logger.error(f"Error retrieving portfolio: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to retrieve portfolio'}), 500

@app.route('/api/stock/<ticker>', methods=['GET'])
def get_stock_info(ticker):
    logger.info(f"Get stock info endpoint called for ticker: {ticker}")
    
    # Check if the ticker is in the S&P 500 list
    if ticker.upper() not in SP500_TICKERS:
        closest_ticker = find_closest_ticker(ticker)
        if closest_ticker:
            logger.info(f"Ticker {ticker} not found. Using closest match: {closest_ticker}")
            ticker = closest_ticker
        else:
            logger.warning(f"Invalid ticker: {ticker}")
            return jsonify({'error': f'Invalid ticker: {ticker}'}), 400

    try:
        stock, info = get_stock_data_with_retry(ticker)

        if not stock or not info:
            logger.warning(f"No valid info found for ticker: {ticker}")
            return jsonify({'error': f'Failed to retrieve data for ticker: {ticker}'}), 404

        # Get historical data for the last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        logger.debug(f"Fetching historical data for {ticker} from {start_date} to {end_date}")
        
        try:
            hist = stock.history(start=start_date, end=end_date)
        except Exception as e:
            logger.warning(f"Error fetching history: {str(e)}. Attempting to fetch last month's data.")
            hist = stock.history(period="1mo")
        
        if hist.empty:
            logger.warning(f"No historical data available for {ticker}")
            historical_data = []
        else:
            historical_data = [
                {"date": date.strftime('%Y-%m-%d'), "close": float(close)}
                for date, close in zip(hist.index, hist['Close'])
            ]

        response_data = {
            'symbol': info.get('symbol', ticker),
            'name': info.get('longName', 'N/A'),
            'price': info.get('currentPrice', info.get('regularMarketPrice', 'N/A')),
            'historicalData': historical_data
        }
        logger.info(f"Returning stock info for {ticker}")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error retrieving stock info for {ticker}: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to retrieve stock info for {ticker}'}), 500

@app.route('/api/trade', methods=['POST'])
def trade():
    logger.info("Trade endpoint called")
    try:
        data = request.json
        ticker = data.get('ticker')
        quantity = int(data.get('quantity', 0))  # Convert to int
        action = data.get('action')

        if not all([ticker, quantity, action]):
            return jsonify({'error': 'Missing required fields'}), 400

        if action not in ['buy', 'sell']:
            return jsonify({'error': 'Invalid action'}), 400

        # Check if the ticker is valid (in S&P 500 list)
        if ticker not in SP500_TICKERS:
            closest_ticker = find_closest_ticker(ticker)
            if closest_ticker:
                logger.info(f"Ticker {ticker} not found. Using closest match: {closest_ticker}")
                ticker = closest_ticker
            else:
                logger.warning(f"Invalid ticker: {ticker}")
                return jsonify({'error': f'Invalid ticker: {ticker}'}), 400

        portfolio_item = Portfolio.query.filter_by(ticker=ticker).first()

        if action == 'buy':
            if portfolio_item:
                portfolio_item.quantity += quantity
            else:
                new_item = Portfolio(ticker=ticker, quantity=quantity)
                db.session.add(new_item)
        elif action == 'sell':
            if not portfolio_item or portfolio_item.quantity < quantity:
                return jsonify({'error': 'Insufficient shares to sell'}), 400
            portfolio_item.quantity -= quantity
            if portfolio_item.quantity == 0:
                db.session.delete(portfolio_item)

        db.session.commit()
        logger.info(f"Successfully {action}ed {quantity} shares of {ticker}")
        return jsonify({'message': f'Successfully {action}ed {quantity} shares of {ticker}'}), 200

    except ValueError:
        logger.error("Invalid quantity provided", exc_info=True)
        return jsonify({'error': 'Invalid quantity provided'}), 400
    except Exception as e:
        logger.error(f"Error processing trade: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to process trade'}), 500

@app.errorhandler(404)
def not_found_error(error):
    logger.error(f"404 error: {error}")
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {error}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(host='0.0.0.0', port=5001)