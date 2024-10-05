from flask import Blueprint, jsonify
from core.models import Portfolio
from core.logging_config import setup_logger

logger = setup_logger()
portfolio = Blueprint('portfolio', __name__)

@portfolio.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    logger.info("Get portfolio endpoint called")
    try:
        portfolio_items = Portfolio.query.all()
        logger.info(f"Retrieved {len(portfolio_items)} portfolio items")
        return jsonify([
            {
                'id': item.id,
                'ticker': item.ticker,
                'quantity': item.quantity
            } for item in portfolio_items
        ])
    except Exception as e:
        logger.error(f"Error retrieving portfolio: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to retrieve portfolio'}), 500