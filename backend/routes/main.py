
from flask import Blueprint, jsonify
from core.models import db
from core.logging_config import setup_logger

logger = setup_logger()
main = Blueprint('main', __name__)  # This should match your current structure

@main.route('/', methods=['GET'])
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