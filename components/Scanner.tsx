
import React, { useState, useEffect } from 'react';
import { Device, DeviceStatus } from '../types';

interface ScannerProps {
  isContinuous: boolean;
  setIsContinuous: (val: boolean) => void;
  devices: Device[];
}

export const Scanner: React.FC<ScannerProps> = ({ isContinuous, setIsContinuous, devices }) => {
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'success'}[]>([]);

  useEffect(() => {
    if (!isContinuous) return;
    
    // Добавляем запись в лог при изменении статусов (упрощенно)
    const onlineCount = devices.filter(d => d.status === DeviceStatus.ONLINE).length;
    const newLog = {
      msg: `Сканирование завершено. Обнаружено в сети: ${onlineCount} узлов.`,
      time: new Date().toLocaleTimeString(),
      type: 'info' as const
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  }, [devices, isContinuous]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
              isContinuous ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-400 shadow-none'
            }`}>
              <i className={`fa-solid fa-satellite-dish text-2xl ${isContinuous ? 'animate-pulse' : ''}`}></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Фоновый монитор</h3>
              <p className="text-slate-500 text-sm">Автоматическое обнаружение изменений в сети 24/7.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border">
            <span className="text-xs font-bold text-slate-500 ml-2">Режим 24/7</span>
            <button 
              onClick={() => setIsContinuous(!isContinuous)}
              className={`w-14 h-7 rounded-full relative transition-colors ${isContinuous ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 bg-white w-5 h-5 rounded-full shadow-sm transition-all ${isContinuous ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Интервал опроса</p>
            <p className="text-lg font-bold text-slate-700">5 секунд</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Методы</p>
            <p className="text-lg font-bold text-slate-700">ARP, ICMP, SNMP</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Статус потока</p>
            <p className="text-lg font-bold text-emerald-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              LIVE
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i className="fa-solid fa-list-ul text-slate-400"></i> Журнал событий сканера
          </h4>
          <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-emerald-400 h-64 overflow-y-auto space-y-2 border-4 border-slate-800 shadow-inner">
            {logs.length === 0 && <div className="text-slate-500 italic">Ожидание первого цикла сканирования...</div>}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 border-l border-emerald-900/50 pl-4">
                <span className="text-slate-500">[{log.time}]</span>
                <span>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
