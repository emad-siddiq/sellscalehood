# core/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from .config import get_config
from .models import db
from .logging_config import setup_logger

# Import blueprints from routes package
from routes.main import main
from routes.portfolio import portfolio
from routes.stock import stock
from routes.trade import trade

logger = setup_logger()

def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())
    CORS(app)

    db.init_app(app)

    # Register blueprints
    app.register_blueprint(main)
    app.register_blueprint(portfolio)
    app.register_blueprint(stock)
    app.register_blueprint(trade)

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        logger.error(f"404 error: {error}")
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {error}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

    return app