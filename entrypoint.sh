#!/bin/bash

# Создаем файл базы данных, если его нет, и даем права на запись
touch /app/inventory.db
chmod 666 /app/inventory.db

echo "--- Инициализация OpenNetInventory ---"

# Запуск Nginx в фоновом режиме
echo "[1/2] Запуск веб-сервера Nginx..."
service nginx start

# Запуск FastAPI бэкенда через Python
echo "[2/2] Запуск API сервера (FastAPI)..."
python3 server.py