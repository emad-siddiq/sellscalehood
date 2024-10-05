from flask import Blueprint, jsonify
from core.utils import get_stock_data_with_retry, find_closest_ticker, SP500_TICKERS
from datetime import datetime, timedelta
from core.logging_config import setup_logger

logger = setup_logger()
stock = Blueprint('stock', __name__)

@stock.route('/api/stock/<ticker>', methods=['GET'])
def get_stock_info(ticker):
    logger.info(f"Get stock info endpoint called for ticker: {ticker}")
    
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
