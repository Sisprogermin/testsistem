#!/bin/bash

# Убеждаемся, что база данных доступна для записи
touch /app/inventory.db
chmod 666 /app/inventory.db

echo "--- Запуск системы OpenNetInventory ---"

# Запуск Nginx
echo "[1/2] Запуск Nginx..."
service nginx start

# Запуск FastAPI бэкенда
echo "[2/2] Запуск API сервера..."
# Используем python3 напрямую для запуска server.py
python3 server.py