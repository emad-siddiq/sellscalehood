FROM python:3.9

WORKDIR /app

# Create a virtual environment
RUN python -m venv /opt/venv

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip
RUN pip install --upgrade pip

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install debugpy
RUN pip install debugpy

# Copy the rest of the application
COPY . .

EXPOSE 5001 5678

# Use the virtual environment's Python to run the application
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]