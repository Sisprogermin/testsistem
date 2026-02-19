
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DeviceList } from './components/DeviceList';
import { EmployeeList } from './components/EmployeeList';
import { FloorPlanMap } from './components/FloorPlanMap';
import { Scanner } from './components/Scanner';
import { Device, DeviceStatus, DeviceType, Employee } from './types';

export type View = 'dashboard' | 'devices' | 'employees' | 'map' | 'scanner';

const STORAGE_KEY_DEVICES = 'open_net_inv_devices_master';
const STORAGE_KEY_EMPLOYEES = 'open_net_inv_employees_master';
const STORAGE_KEY_DEPTS = 'open_net_inv_depts_master';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isContinuousScanning, setIsContinuousScanning] = useState(true);
  
  // Состояние устройств
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEVICES);
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:5E', hostname: 'PC-DEV-01', vendor: 'Dell Inc.', type: DeviceType.PC, status: DeviceStatus.ONLINE, lastSeen: 'Только что', x: 20, y: 30 },
      { id: '2', ip: '192.168.1.15', mac: 'AA:BB:CC:DD:EE:FF', hostname: 'PRN-AC-02', vendor: 'HP', type: DeviceType.PRINTER, status: DeviceStatus.OFFLINE, lastSeen: '2 часа назад', x: 50, y: 80 },
      { id: '3', ip: '192.168.1.22', mac: '12:34:56:78:9A:BC', hostname: 'SRV-STORAGE', vendor: 'Supermicro', type: DeviceType.NETWORK, status: DeviceStatus.ONLINE, lastSeen: 'Только что', x: 10, y: 10 },
    ];
  });

  // Состояние сотрудников
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (saved) return JSON.parse(saved);
    return [
      { id: 'e1', fullName: 'Александр Волков', department: 'IT Отдел', position: 'Старший админ', isActive: true },
      { id: 'e2', fullName: 'Дмитрий Петров', department: 'Разработка', position: 'Программист', isActive: true },
    ];
  });

  // Состояние отделов
  const [departments, setDepartments] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEPTS);
    if (saved) return JSON.parse(saved);
    return ['IT Отдел', 'Разработка', 'Маркетинг', 'Бухгалтерия'];
  });

  // Сохранение при изменениях
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departments));
  }, [devices, employees, departments]);

  useEffect(() => {
    if (!isContinuousScanning) return;
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => {
        if (Math.random() > 0.98) {
          const newStatus = d.status === DeviceStatus.ONLINE ? DeviceStatus.OFFLINE : DeviceStatus.ONLINE;
          return { ...d, status: newStatus, lastSeen: newStatus === DeviceStatus.ONLINE ? 'Только что' : d.lastSeen };
        }
        return d;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [isContinuousScanning]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard devices={devices} setView={setCurrentView} />;
      case 'devices': return <DeviceList devices={devices} setDevices={setDevices} />;
      case 'employees': return (
        <EmployeeList 
          employees={employees} 
          setEmployees={setEmployees} 
          departments={departments} 
          setDepartments={setDepartments}
        />
      );
      case 'map': return <FloorPlanMap devices={devices} setDevices={setDevices} />;
      case 'scanner': return (
        <Scanner 
          isContinuous={isContinuousScanning} 
          setIsContinuous={setIsContinuousScanning} 
          devices={devices}
        />
      );
      default: return <Dashboard devices={devices} setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} isScanning={isContinuousScanning}>
      {renderView()}
    </Layout>
  );
};

export default App;
