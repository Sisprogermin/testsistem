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
    { id: 'devices', label: 'Устройства', icon: 'fa-server' },
    { id: 'employees', label: 'Сотрудники', icon: 'fa-user-tie' },
    { id: 'map', label: 'План этажа', icon: 'fa-map-location-dot' },
    { id: 'scanner', label: 'Сканер сети', icon: 'fa-satellite-dish' },
  ];

  const viewNames: Record<string, string> = {
    'dashboard': 'Обзор инфраструктуры',
    'devices': 'ИТ-активы организации',
    'employees': 'Управление доступом и персоналом',
    'map': 'Геолокация оборудования',
    'scanner': 'Мониторинг сегментов сети'
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Боковая панель: Современный темный стиль */}
      <aside className="w-72 bg-indigo-950 text-white flex-shrink-0 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-all">
            <i className="fa-solid fa-network-wired text-2xl"></i>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight leading-none text-white">OpenNetInv</h1>
            <p className="text-[10px] text-indigo-300/60 uppercase font-black tracking-widest mt-1">Enterprise Core</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                currentView === item.id 
                ? 'bg-white/10 text-white shadow-xl shadow-black/20 ring-1 ring-white/20' 
                : 'text-indigo-200/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg transition-transform group-hover:scale-110 ${currentView === item.id ? 'text-sky-400' : ''}`}></i>
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 bg-black/10">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-200/40 uppercase tracking-widest">System Status: OK</span>
           </div>
           <p className="text-[9px] text-indigo-300/30 font-bold uppercase tracking-tight">Open Source Network Inventory v1.0.0</p>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-10 z-10">
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Система управления</p>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{viewNames[currentView] || currentView}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`hidden md:flex items-center gap-3 text-xs px-5 py-2.5 rounded-2xl font-bold border transition-all ${
              isScanning ? 'text-emerald-700 bg-emerald-50 border-emerald-100 shadow-sm' : 'text-slate-500 bg-slate-100 border-slate-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              24/7 Сканер: {isScanning ? 'АКТИВЕН' : 'ПАУЗА'}
            </div>
            
            <button className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                <i className="fa-solid fa-bell"></i>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
               <div className="text-right">
                  <p className="text-xs font-black text-slate-800">Администратор</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Superuser</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black border-2 border-white shadow-md">
                 A
               </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-auto p-10 custom-scrollbar bg-slate-50/50">
          {children}
        </section>
      </main>
    </div>
  );
};