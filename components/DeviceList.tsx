
import React, { useState } from 'react';
import { Device, DeviceStatus, DeviceType } from '../types';

interface DeviceListProps {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export const DeviceList: React.FC<DeviceListProps> = ({ devices, setDevices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Состояние для нового устройства
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    hostname: '',
    ip: '',
    mac: '',
    type: DeviceType.PC,
    vendor: '',
    status: DeviceStatus.OFFLINE,
    lastSeen: 'Никогда',
    x: 0,
    y: 0
  });

  const filtered = devices.filter(d => 
    d.hostname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.ip.includes(searchTerm) ||
    d.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groups = [
    { title: 'Рабочие станции', icon: 'fa-desktop', types: [DeviceType.PC, DeviceType.LAPTOP], color: 'indigo' },
    { title: 'Печатная техника', icon: 'fa-print', types: [DeviceType.PRINTER], color: 'sky' },
    { title: 'Сетевое оборудование', icon: 'fa-server', types: [DeviceType.NETWORK], color: 'emerald' },
    { title: 'Мобильные устройства', icon: 'fa-mobile-screen-button', types: [DeviceType.PHONE], color: 'violet' },
    { title: 'Прочее / Неопознанное', icon: 'fa-question-circle', types: [DeviceType.UNKNOWN], color: 'slate' }
  ];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    setDevices(prev => prev.map(d => d.id === editingDevice.id ? editingDevice : d));
    setEditingDevice(null);
  };

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const completeDevice = { ...newDevice, id } as Device;
    setDevices(prev => [...prev, completeDevice]);
    setIsAddModalOpen(false);
    setNewDevice({ hostname: '', ip: '', mac: '', type: DeviceType.PC, vendor: '', status: DeviceStatus.OFFLINE, lastSeen: 'Никогда', x: 0, y: 0 });
  };

  const handleVNCConnect = (ip: string) => {
    window.location.href = `vnc://${ip}`;
  };

  const renderTable = (deviceGroup: Device[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            <th className="px-6 py-3 w-32">Статус</th>
            <th className="px-6 py-3">Устройство</th>
            <th className="px-6 py-3">IP-адрес</th>
            <th className="px-6 py-3">Вендор</th>
            <th className="px-6 py-3">Активность</th>
            <th className="px-6 py-3 text-center">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {deviceGroup.map((device) => (
            <tr key={device.id} className="hover:bg-indigo-50/30 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${device.status === DeviceStatus.ONLINE ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span className={`text-[10px] font-black uppercase tracking-wide ${device.status === DeviceStatus.ONLINE ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {device.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800 text-sm leading-tight">{device.hostname}</div>
                <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{device.mac}</div>
              </td>
              <td className="px-6 py-4">
                <span className="bg-white border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-sm">
                  {device.ip}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-600 font-medium">{device.vendor}</td>
              <td className="px-6 py-4 text-[10px] text-slate-500 font-medium">{device.lastSeen}</td>
              <td className="px-6 py-4 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleVNCConnect(device.ip)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><i className="fa-solid fa-desktop"></i></button>
                  <button onClick={() => setEditingDevice(device)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><i className="fa-solid fa-pen"></i></button>
                  <button onClick={() => setDevices(prev => prev.filter(d => d.id !== device.id))} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"><i className="fa-solid fa-trash-can"></i></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Поиск по имени, IP или производителю..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Обнаружено узлов</span>
             <span className="text-xl font-black text-slate-800">{filtered.length} / {devices.length}</span>
           </div>
           <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95"
           >
             <i className="fa-solid fa-plus"></i> Добавить узел
           </button>
        </div>
      </div>

      <div className="space-y-10">
        {groups.map((group) => {
          const groupDevices = filtered.filter(d => group.types.includes(d.type));
          if (groupDevices.length === 0 && searchTerm) return null;
          return (
            <div key={group.title} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${group.color}-100 text-${group.color}-600 flex items-center justify-center`}><i className={`fa-solid ${group.icon} text-sm`}></i></div>
                  <h4 className="font-black text-slate-700 text-sm uppercase tracking-tight">{group.title}</h4>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500">{groupDevices.length} ед.</span>
              </div>
              {groupDevices.length > 0 ? renderTable(groupDevices) : <div className="p-12 text-center text-slate-400 italic text-sm">В этой категории пока нет устройств</div>}
            </div>
          );
        })}
      </div>

      {/* Модалка добавления */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Новое устройство</h3>
              <button onClick={() => setIsAddModalOpen(false)}><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleAddDevice} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Имя устройства</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newDevice.hostname} onChange={e => setNewDevice({...newDevice, hostname: e.target.value})} placeholder="Напр: PC-OFFICE-01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP-адрес</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={newDevice.ip} onChange={e => setNewDevice({...newDevice, ip: e.target.value})} placeholder="192.168.1.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MAC-адрес</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={newDevice.mac} onChange={e => setNewDevice({...newDevice, mac: e.target.value})} placeholder="00:00:00:00:00:00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Категория</label>
                  <select className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer" value={newDevice.type} onChange={e => setNewDevice({...newDevice, type: e.target.value as DeviceType})}>
                    {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Вендор</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold" value={newDevice.vendor} onChange={e => setNewDevice({...newDevice, vendor: e.target.value})} placeholder="HP, Dell, Cisco..." />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Отмена</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка редактирования */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Редактирование</h3>
              <button onClick={() => setEditingDevice(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Имя устройства</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={editingDevice.hostname} onChange={e => setEditingDevice({...editingDevice, hostname: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IP-адрес</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" value={editingDevice.ip} onChange={e => setEditingDevice({...editingDevice, ip: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Категория</label>
                  <select className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer" value={editingDevice.type} onChange={e => setEditingDevice({...editingDevice, type: e.target.value as DeviceType})}>
                    {Object.values(DeviceType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingDevice(null)} className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Отмена</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Применить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
