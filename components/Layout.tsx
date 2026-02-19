
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: any) => void;
  isScanning: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, isScanning }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Панель управления', icon: 'fa-chart-pie' },
    { id: 'devices', label: 'Устройства', icon: 'fa-laptop-code' },
    { id: 'employees', label: 'Сотрудники', icon: 'fa-users' },
    { id: 'map', label: 'План этажа', icon: 'fa-map' },
    { id: 'scanner', label: 'Сканирование сети', icon: 'fa-satellite-dish' },
  ];

  const viewNames: Record<string, string> = {
    'dashboard': 'Обзор системы',
    'devices': 'Список оборудования',
    'employees': 'Учёт сотрудников',
    'map': 'Карта здания',
    'scanner': 'Сканирование подсетей'
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Боковая панель */}
      <aside className="w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-network-wired text-xl"></i>
          </div>
          <span className="font-bold text-lg tracking-tight text-indigo-200">OpenNetInv</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-6`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest">
          v1.0.0-beta • {isScanning ? '24/7 ACTIVE' : 'MANUAL MODE'}
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">{viewNames[currentView] || currentView}</h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full border transition-colors ${
              isScanning ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              24/7 Сканер: {isScanning ? 'Активен' : 'Пауза'}
            </div>
            <button className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors">
              <i className="fa-solid fa-user"></i>
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-8">
          {children}
        </section>
      </main>
    </div>
  );
};
