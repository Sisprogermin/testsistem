import os
import subprocess
import json
import sqlite3
import re
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

# Настройка логов для Docker
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("inventory-api")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "/app/inventory.db"

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                ip TEXT,
                mac TEXT,
                hostname TEXT,
                vendor TEXT,
                type TEXT,
                status TEXT,
                lastSeen TEXT,
                x REAL,
                y REAL
            )
        ''')
        conn.commit()
        conn.close()
        logger.info("База данных успешно инициализирована")
    except Exception as e:
        logger.error(f"Критическая ошибка инициализации БД: {e}")

init_db()

class DeviceModel(BaseModel):
    id: str
    ip: str
    mac: str
    hostname: str
    vendor: str
    type: str
    status: str
    lastSeen: str
    x: float
    y: float

@app.get("/api/devices")
async def get_devices():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        logger.error(f"Ошибка при получении списка устройств: {e}")
        return []

@app.post("/api/devices/sync")
async def sync_devices(devices: List[DeviceModel]):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        for d in devices:
            cursor.execute('''
                INSERT OR REPLACE INTO devices (id, ip, mac, hostname, vendor, type, status, lastSeen, x, y)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (d.id, d.ip, d.mac, d.hostname, d.vendor, d.type, d.status, d.lastSeen, d.x, d.y))
        conn.commit()
        conn.close()
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Ошибка при синхронизации: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scan")
async def run_scan(subnet: str = "10.60.7.0/24"):
    logger.info(f"Инициация сканирования подсети: {subnet}")
    try:
        # Запуск nmap с привилегиями (контейнер должен быть запущен с --privileged)
        process = subprocess.run(
            ["nmap", "-sn", subnet], 
            capture_output=True, 
            text=True,
            timeout=60
        )
        
        output = process.stdout
        found = []
        # Парсинг вывода nmap
        host_blocks = output.split("Nmap scan report for ")
        
        for block in host_blocks[1:]:
            lines = block.strip().splitlines()
            header = lines[0]
            
            # Извлечение IP
            ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', header)
            if not ip_match: continue
                
            ip = ip_match.group(1)
            # Извлечение Hostname
            hostname = header.replace(f"({ip})", "").strip() or f"Host-{ip.split('.')[-1]}"
            
            mac = "Unknown"
            vendor = "Unknown Vendor"
            
            for line in lines:
                if "MAC Address:" in line:
                    mac_match = re.search(r'MAC Address: ([0-9A-F:]{17})', line)
                    if mac_match:
                        mac = mac_match.group(1)
                        # Извлечение производителя
                        vendor_match = re.search(r'\((.*)\)', line)
                        if vendor_match: vendor = vendor_match.group(1)
            
            found.append({
                "id": f"net-{mac.replace(':', '') if mac != 'Unknown' else ip.replace('.', '')}",
                "ip": ip,
                "mac": mac,
                "hostname": hostname,
                "vendor": vendor,
                "type": "Неизвестно",
                "status": "онлайн",
                "lastSeen": "Только что",
                "x": 50,
                "y": 50
            })
        
        logger.info(f"Сканирование завершено. Найдено устройств: {len(found)}")
        return {"results": found}
    except subprocess.TimeoutExpired:
        logger.error("Превышено время ожидания сканирования")
        raise HTTPException(status_code=504, detail="Scan timeout")
    except Exception as e:
        logger.error(f"Ошибка сканера: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Запускаем на всех интерфейсах для связи внутри контейнера
    uvicorn.run(app, host="0.0.0.0", port=8000)