# core/logging_config.py

import logging
import sys
import os

def setup_logger():
    logger = logging.getLogger('stock_portfolio_app')
    logger.setLevel(logging.DEBUG)

    # Determine log file path
    log_dir = os.environ.get('LOG_DIR', os.path.dirname(os.path.abspath(__file__)))
    log_file = os.path.join(log_dir, 'app.log')

    # Create log directory if it doesn't exist
    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    file_handler = logging.FileHandler(log_file)
    console_handler = logging.StreamHandler(sys.stdout)

    formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger