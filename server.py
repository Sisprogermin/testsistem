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

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "/app/inventory.db"

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
        # -sn: Ping scan (быстрое обнаружение)
        # Требует privileged: true в docker-compose для работы ARP
        process = subprocess.run(["nmap", "-sn", subnet], capture_output=True, text=True, timeout=120)
        output = process.stdout
        
        found = []
        # Парсим вывод Nmap
        for block in output.split("Nmap scan report for ")[1:]:
            lines = block.splitlines()
            header = lines[0]
            ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', header)
            if not ip_match: continue
            
            ip = ip_match.group(1)
            hostname = header.split(" (")[0] if "(" in header else f"Host-{ip.split('.')[-1]}"
            mac = "Unknown"
            vendor = "Unknown"
            
            for line in lines:
                if "MAC Address:" in line:
                    m = re.search(r'MAC Address: ([0-9A-F:]{17}) \((.*)\)', line)
                    if m:
                        mac, vendor = m.groups()
            
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
        logger.error(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)