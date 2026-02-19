import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DeviceList } from './components/DeviceList';
import { EmployeeList } from './components/EmployeeList';
import { FloorPlanMap } from './components/FloorPlanMap';
import { Scanner } from './components/Scanner';
import { Device, DeviceStatus, DeviceType, Employee } from './types';

export type View = 'dashboard' | 'devices' | 'employees' | 'map' | 'scanner';

// Теперь используем относительный путь, так как Nginx объединяет фронт и бэк
const API_BASE = "/api";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [backendOnline, setBackendOnline] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>(['IT', 'Бухгалтерия', 'HR', 'Склад']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/devices`);
        if (res.ok) {
          const data = await res.json();
          setDevices(data);
          setBackendOnline(true);
        }
      } catch (e) {
        setBackendOnline(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (devices.length > 0 && backendOnline) {
      fetch(`${API_BASE}/devices/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devices)
      }).catch(() => setBackendOnline(false));
    }
  }, [devices, backendOnline]);

  const onDevicesFound = (newFound: Device[]) => {
    setDevices(prev => {
      const existingMacs = new Set(prev.map(d => d.mac));
      const filtered = newFound.filter(d => d.mac !== 'Unknown' && !existingMacs.has(d.mac));
      return [...prev, ...filtered];
    });
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView} isScanning={backendOnline}>
      <div className="mb-4">
        {!backendOnline && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
            <span className="text-[10px] font-black text-rose-700 uppercase">Связь с системным сканером отсутствует. Проверьте запуск контейнера.</span>
          </div>
        )}
      </div>
      {(() => {
        switch (currentView) {
          case 'dashboard': return <Dashboard devices={devices} setView={setCurrentView} />;
          case 'devices': return <DeviceList devices={devices} setDevices={setDevices} />;
          case 'employees': return <EmployeeList employees={employees} setEmployees={setEmployees} departments={departments} setDepartments={setDepartments} />;
          case 'map': return <FloorPlanMap devices={devices} setDevices={setDevices} />;
          case 'scanner': return <Scanner devices={devices} onDevicesFound={onDevicesFound} />;
        }
      })()}
    </Layout>
  );
};

export default App;
