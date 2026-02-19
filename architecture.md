
# Архитектура OpenNetInventory

## 1. Стек технологий
- **Frontend**: React 18, TypeScript, Tailwind CSS. Визуализация и мониторинг состояния.
- **Backend (Python/FastAPI)**: Обработка API запросов, бизнес-логика связки "сотрудник-устройство", координация задач сканирования.
- **Слой сканирования (Local CLI)**:
    - `nmap` для сканирования портов и определения ОС.
    - `arp-scan` для быстрого маппинга локальных сегментов.
    - `PySNMP` для детального сбора данных с оборудования.
- **База данных**: PostgreSQL (для продакшена) или SQLite (для простой локальной установки).
- **Очереди задач**: Celery + Redis (или APScheduler для малых систем) для фонового сканирования.

## 2. Схема БД (Логика сущностей)
- **Employees (Сотрудники)**: `id`, `name`, `dept`, `pos`, `status`.
- **Devices (Устройства)**: `id`, `mac` (уникальный), `ip`, `hostname`, `type`, `vendor`, `last_seen`, `online_status`, `x_pos`, `y_pos`.
- **Отношения**: 1 Сотрудник -> Много устройств.
- **Floors (Планы)**: `id`, `name`, `image_path`.

## 3. Логика сканирования
Python вызывает системные утилиты через subprocess:
`nmap -sP 192.168.1.0/24` для обнаружения.
`nmap -O -sV <ip>` для определения типа ОС и сервисов.
Результаты парсятся и обновляются в таблице `Devices` на основе MAC-адреса.

## 4. Развертывание (Docker Compose)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: inventory_user
      POSTGRES_PASSWORD: secret_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    privileged: true # Необходимо для низкоуровневого сканирования (nmap/arp)
    depends_on:
      - db
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "80:80"

volumes:
  postgres_data:
```
