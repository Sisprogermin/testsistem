import React, { useState } from 'react';
import { Device, DeviceStatus, DeviceType } from '../types';

interface ScannerProps {
  devices: Device[];
  onDevicesFound: (newDevices: Device[]) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ devices, onDevicesFound }) => {
  const [subnet, setSubnet] = useState('10.60.7.0/24');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{t: string, m: string, s: 'cmd'|'info'|'ok'}[]>([]);

  const addLog = (m: string, s: 'cmd'|'info'|'ok' = 'info') => {
    setLogs(prev => [{ t: new Date().toLocaleTimeString(), m, s }, ...prev].slice(0, 50));
  };

  const runRealScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setProgress(10);
    setLogs([]);

    // Относительный путь через Nginx прокси
    const apiUrl = `/api/scan?subnet=${encodeURIComponent(subnet)}`;

    addLog(`Запуск системного сканирования ${subnet}...`, 'cmd');

    try {
      const response = await fetch(apiUrl);
      setProgress(50);
      
      if (!response.ok) throw new Error("Ошибка сервера");
      
      const data = await response.json();
      setProgress(90);
      
      if (data.results && data.results.length > 0) {
        addLog(`Найдено активных узлов: ${data.results.length}`, 'ok');
        onDevicesFound(data.results);
      } else {
        addLog('Узлы в данной подсети не обнаружены.', 'info');
      }
      setProgress(100);
    } catch (e: any) {
      addLog(`Ошибка: Сканер недоступен. Проверьте статус контейнера.`, 'info');
      setProgress(0);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-4xl border shadow-sm space-y-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Контроллер сети</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Сегмент сети</label>
              <input 
                type="text" 
                value={subnet} 
                onChange={e => setSubnet(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-mono font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              onClick={runRealScan}
              disabled={isScanning}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isScanning ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl'
              }`}
            >
              {isScanning ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-satellite-dish mr-2"></i>}
              Начать поиск
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-4xl border shadow-sm">
             <div className="flex justify-between items-end mb-4">
                <h4 className="font-black text-slate-800 uppercase tracking-tight">Терминал сканера</h4>
                <span className="text-4xl font-black text-indigo-600">{progress}%</span>
             </div>
             <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${progress}%` }}></div>
             </div>
             <div className="bg-slate-900 rounded-3xl p-6 font-mono text-[11px] h-80 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                {logs.map((l, i) => (
                  <div key={i} className="py-1.5 flex gap-4 border-b border-white/5 last:border-0">
                    <span className="text-slate-500">[{l.t}]</span>
                    <span className={l.s === 'cmd' ? 'text-sky-400' : l.s === 'ok' ? 'text-emerald-400' : 'text-slate-300'}>
                      {l.s === 'cmd' ? '# ' : ''}{l.m}
                    </span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
