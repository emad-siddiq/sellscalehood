from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import yfinance as yf
import os

app = Flask(__name__)
CORS(app)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define Portfolio model
class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/stock/<ticker>', methods=['GET'])
def get_stock_info(ticker):
    stock = yf.Ticker(ticker)
    info = stock.info
    return jsonify({
        'symbol': info['symbol'],
        'name': info['longName'],
        'price': info['currentPrice']
    })

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    portfolio = Portfolio.query.all()
    return jsonify([{'id': stock.id, 'ticker': stock.ticker, 'quantity': stock.quantity} for stock in portfolio])

@app.route('/api/trade', methods=['POST'])
def trade_stock():
    data = request.json
    ticker = data['ticker']
    quantity = data['quantity']
    action = data['action']

    existing_stock = Portfolio.query.filter_by(ticker=ticker).first()

    if action == 'buy':
        if existing_stock:
            existing_stock.quantity += quantity
        else:
            new_stock = Portfolio(ticker=ticker, quantity=quantity)
            db.session.add(new_stock)
    elif action == 'sell':
        if existing_stock and existing_stock.quantity >= quantity:
            existing_stock.quantity -= quantity
            if existing_stock.quantity == 0:
                db.session.delete(existing_stock)
        else:
            return jsonify({'error': 'Not enough stocks to sell'}), 400

    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)