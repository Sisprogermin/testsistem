import React, { useState, useRef } from 'react';
import { Device, DeviceStatus, DeviceType } from '../types.ts';

const STORAGE_KEY_IMAGE = 'open_net_inv_map_image';

interface FloorPlanMapProps {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
}

export const FloorPlanMap: React.FC<FloorPlanMapProps> = ({ devices, setDevices }) => {
  const [floorPlanImage, setFloorPlanImage] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_IMAGE) || 'https://picsum.photos/seed/map/1200/800';
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePointerDown = (id: string) => {
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    setDevices(prev => prev.map(d => d.id === draggingId ? { ...d, x: boundedX, y: boundedY } : d));
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Файл слишком большой. Пожалуйста, используйте изображение менее 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setFloorPlanImage(base64);
          localStorage.setItem(STORAGE_KEY_IMAGE, base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const resetMap = () => {
    if (confirm("Вы уверены?")) {
      localStorage.removeItem(STORAGE_KEY_IMAGE);
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-slate-800">Визуальная карта (Live)</h3>
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
              <i className="fa-solid fa-sync fa-spin mr-1"></i> ЖИВОЕ ОБНОВЛЕНИЕ
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          <button onClick={resetMap} className="bg-white border px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
            <i className="fa-solid fa-rotate-left"></i> Сброс
          </button>
          <button onClick={triggerFileUpload} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-700 shadow-lg">
            <i className="fa-solid fa-upload"></i> Загрузить план
          </button>
        </div>
      </div>

      <div 
        ref={mapRef}
        className="flex-1 bg-slate-200 rounded-3xl relative overflow-hidden shadow-inner border-4 border-white cursor-crosshair group/map"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url("${floorPlanImage}")` }}></div>
        
        {devices.map((device) => (
          <div
            key={device.id}
            onPointerDown={() => handlePointerDown(device.id)}
            style={{ left: `${device.x}%`, top: `${device.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full z-10 cursor-move transition-all duration-500 ${
              draggingId === device.id ? 'scale-125 opacity-80 z-20' : 'hover:scale-110'
            }`}
          >
            <div className={`relative group flex items-center justify-center w-10 h-10 rounded-xl shadow-lg border-2 border-white transition-colors duration-500 ${
              device.status === DeviceStatus.ONLINE ? 'bg-indigo-600' : 'bg-slate-400'
            }`}>
              <i className={`fa-solid text-white text-sm ${
                device.type === DeviceType.PC ? 'fa-desktop' : 
                device.type === DeviceType.PRINTER ? 'fa-print' : 'fa-wifi'
              }`}></i>
              
              <div className="absolute top-full mt-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none shadow-xl transition-opacity z-30">
                {device.hostname} • {device.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};