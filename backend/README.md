# Backend - FastAPI Chama System

## Setup

1. Install Python 3.8+
2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Setup environment variables:
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

5. Run the application:
   ```bash
   python -m app.main
   ```

## API Documentation

Once running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Features

- User authentication and management
- Group creation and management
- Blockchain integration for smart contracts
- Automated fund distribution
- Transaction tracking
