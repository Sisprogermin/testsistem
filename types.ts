
export enum DeviceType {
  PC = 'ПК',
  LAPTOP = 'Ноутбук',
  PRINTER = 'Принтер',
  PHONE = 'Телефон',
  NETWORK = 'Сетевое оборудование',
  UNKNOWN = 'Неизвестно'
}

export enum DeviceStatus {
  ONLINE = 'онлайн',
  OFFLINE = 'оффлайн'
}

export interface Employee {
  id: string;
  fullName: string;
  department: string;
  position: string;
  isActive: boolean;
}

export interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeen: string;
  employeeId?: string;
  x: number; // Процент от ширины плана
  y: number; // Процент от высоты плана
  floorId?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ScanJob {
  id: string;
  subnet: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  resultsFound: number;
  startTime: string;
}
