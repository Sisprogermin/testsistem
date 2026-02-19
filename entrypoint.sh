#!/bin/bash

# Запуск nginx в фоне
nginx -g "daemon on;"

# Запуск Python API
echo "Запуск FastAPI сервера инвентаризации..."
python3 server.py