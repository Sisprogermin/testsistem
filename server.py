import os
import subprocess
import json
import sqlite3
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Разрешаем CORS для всех, чтобы фронтенд мог достучаться до API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "inventory.db"

def init_db():
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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM devices")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/devices/sync")
async def sync_devices(devices: List[DeviceModel]):
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

@app.get("/api/scan")
async def run_scan(subnet: str = "10.60.7.0/24"):
    try:
        # Проверяем наличие nmap
        check_nmap = subprocess.run(["which", "nmap"], capture_output=True)
        if check_nmap.returncode != 0:
            raise HTTPException(status_code=500, detail="Nmap is not installed on server. Use 'sudo apt install nmap'")

        # Выполняем ARP-скан (пингование)
        # Мы используем -sn (ping scan), который на локальной сети автоматически делает ARP-запросы
        process = subprocess.run(
            ["nmap", "-sn", subnet], 
            capture_output=True, 
            text=True
        )
        
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Nmap error: {process.stderr}")

        output = process.stdout
        # Парсим вывод с помощью регулярных выражений для надежности
        # Ищем блоки вида:
        # Nmap scan report for 10.60.7.1
        # Host is up (0.00040s latency).
        # MAC Address: 00:50:56:C0:00:08 (VMware)
        
        found = []
        host_blocks = output.split("Nmap scan report for ")
        
        for block in host_blocks[1:]: # Пропускаем заголовок
            lines = block.strip().splitlines()
            header = lines[0]
            
            # Извлекаем IP и Hostname
            # Формат может быть: "hostname (10.60.7.1)" или просто "10.60.7.1"
            ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', header)
            if not ip_match:
                continue
                
            ip = ip_match.group(1)
            hostname = header.replace(f"({ip})", "").strip() or f"Host-{ip.split('.')[-1]}"
            
            mac = "Unknown"
            vendor = "Unknown Vendor"
            
            for line in lines:
                if "MAC Address:" in line:
                    mac_match = re.search(r'MAC Address: ([0-9A-F:]{17})', line)
                    if mac_match:
                        mac = mac_match.group(1)
                        vendor_match = re.search(r'\((.*)\)', line)
                        if vendor_match:
                            vendor = vendor_match.group(1)
            
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
        
        return {"results": found}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Запускаем на всех интерфейсах (0.0.0.0), чтобы был доступ из сети
    uvicorn.run(app, host="0.0.0.0", port=8000)
