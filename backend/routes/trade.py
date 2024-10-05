# routes/trade.py
from flask import Blueprint, jsonify, request
from core.models import db, Portfolio
from core.utils import find_closest_ticker, SP500_TICKERS
from core.logging_config import setup_logger

trade = Blueprint('trade', __name__)

logger = setup_logger()

@trade.route('/api/trade', methods=['POST'])
def process_trade():
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
    
