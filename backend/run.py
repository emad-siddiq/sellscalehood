from core.app import create_app
from core.logging_config import setup_logger

logger = setup_logger()
app = create_app()

if __name__ == '__main__':
    logger.info("Starting Flask application")
    app.run(host='0.0.0.0', port=5001)