APP="main"
PORT=3000
python3 -m uvicorn ${APP}:app --host 0.0.0.0 --port ${PORT} --reload