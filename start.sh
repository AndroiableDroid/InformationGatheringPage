APP="main"
PORT=10000
python3 -m uvicorn ${APP}:app --host 0.0.0.0 --port ${PORT}