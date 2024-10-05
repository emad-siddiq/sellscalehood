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
    try:
        logger.debug(f"Initializing yfinance Ticker for {ticker}")
        stock = yf.Ticker(ticker)
        
        logger.debug(f"Fetching info for {ticker}")
        info = stock.info
        logger.info(f"Successfully fetched info for {ticker}")

        # Get historical data for the last 30 days
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        logger.debug(f"Fetching historical data for {ticker} from {start_date} to {end_date}")
        
        try:
            hist = stock.history(start=start_date, end=end_date)
        except AttributeError as e:
            logger.warning(f"AttributeError when fetching history: {str(e)}. Attempting workaround.")
            hist = stock.history(period="1mo")
        
        logger.info(f"Successfully fetched historical data for {ticker}")

        historical_data = [
            {"date": date.strftime('%Y-%m-%d'), "close": float(close)}
            for date, close in zip(hist.index, hist['Close'])
        ]

        response_data = {
            'symbol': info.get('symbol', ticker),
            'name': info.get('longName', 'N/A'),
            'price': info.get('currentPrice', 'N/A'),
            'historicalData': historical_data
        }
        logger.info(f"Returning stock info for {ticker}")
        return jsonify(response_data)
    except Exception as e:
        logger.error(f"Error retrieving stock info for {ticker}: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to retrieve stock info for {ticker}'}), 400

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