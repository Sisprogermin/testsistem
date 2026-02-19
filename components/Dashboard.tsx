import React from 'react';
import { Device, DeviceStatus, DeviceType } from '../types.ts';
import { View } from '../App.tsx';

interface DashboardProps {
  devices: Device[];
  setView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ devices, setView }) => {
  const total = devices.length;
  const onlineCount = devices.filter(d => d.status === DeviceStatus.ONLINE).length;
  const offlineCount = total - onlineCount;
  const healthScore = total > 0 ? Math.round((onlineCount / total) * 100) : 0;

  const distribution = Object.values(DeviceType).map(type => ({
    label: type,
    count: devices.filter(d => d.type === type).length,
    color: type === DeviceType.PC ? 'bg-indigo-500' : 
           type === DeviceType.PRINTER ? 'bg-sky-400' : 
           type === DeviceType.NETWORK ? 'bg-emerald-400' : 
           type === DeviceType.LAPTOP ? 'bg-violet-400' : 'bg-slate-300'
  })).filter(item => item.count > 0 || item.label === DeviceType.UNKNOWN);

  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  const stats = [
    { label: 'Всего активов', value: total, icon: 'fa-box', color: 'indigo', trend: '+2 за сегодня', target: 'devices' as View },
    { label: 'Узлы ONLINE', value: onlineCount, icon: 'fa-signal', color: 'emerald', trend: 'Стабильно', target: 'scanner' as View },
    { label: 'Узлы OFFLINE', value: offlineCount, icon: 'fa-plug-circle-xmark', color: 'rose', trend: offlineCount > 0 ? 'Требует внимания' : 'Чисто', target: 'devices' as View },
    { label: 'Здоровье сети', value: `${healthScore}%`, icon: 'fa-heart-pulse', color: 'amber', trend: 'Live', target: 'scanner' as View },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            onClick={() => setView(stat.target)}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative cursor-pointer active:scale-95"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150 bg-${stat.color}-600`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                <p className={`text-[10px] mt-2 font-bold ${stat.color === 'rose' && offlineCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                   {stat.trend}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
                <i className={`fa-solid ${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Распределение ресурсов</h4>
              <p className="text-slate-400 text-xs">Автоматический подсчет по типам оборудования</p>
            </div>
          </div>
          <div className="flex items-end gap-6 h-56 px-4">
            {distribution.map((bar) => (
              <div 
                key={bar.label} 
                onClick={() => setView('devices')}
                className="flex-1 flex flex-col items-center gap-4 group/bar cursor-pointer"
              >
                <div className="relative w-full flex flex-col justify-end h-40">
                  <div 
                    className={`${bar.color} w-full rounded-t-2xl transition-all duration-700 ease-out relative shadow-lg group-hover/bar:brightness-110 group-hover/bar:scale-x-105`} 
                    style={{ height: `${(bar.count / maxCount) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                      {bar.count} шт.
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-700 uppercase leading-none mb-1">{bar.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{Math.round((bar.count / total) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Лог мониторинга</h4>
            <p className="text-slate-400 text-xs">Последние изменения в сети</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {devices.slice().sort((a,b) => a.status === DeviceStatus.OFFLINE ? -1 : 1).slice(0, 5).map((dev) => (
              <div 
                key={dev.id} 
                onClick={() => setView('devices')}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer active:scale-95"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  dev.status === DeviceStatus.ONLINE ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                }`}>
                  <i className={`fa-solid ${
                    dev.type === DeviceType.PC ? 'fa-desktop' : 
                    dev.type === DeviceType.PRINTER ? 'fa-print' : 'fa-network-wired'
                  } text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-800 truncate">{dev.hostname}</p>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      dev.status === DeviceStatus.ONLINE ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
                    }`}>
                      {dev.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{dev.ip}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setView('scanner')}
            className="mt-6 w-full py-3 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
          >
            Смотреть весь журнал
          </button>
        </div>
      </div>
    </div>
  );
};