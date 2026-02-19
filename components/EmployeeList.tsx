
import React, { useState, useMemo } from 'react';
import { Employee, Device, DeviceType, DeviceStatus } from '../types';

interface EmployeeListProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, setEmployees, departments, setDepartments }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'gear'>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Состояния модалок
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);

  // Формы
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    fullName: '',
    department: departments[0] || '',
    position: '',
    isActive: true
  });
  const [newDeptName, setNewDeptName] = useState('');

  const groupedEmployees = useMemo(() => {
    const filtered = employees.filter(emp => 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, Employee[]> = {};
    departments.forEach(dept => { groups[dept] = []; });
    filtered.forEach(emp => {
      if (groups[emp.department]) groups[emp.department].push(emp);
    });
    return groups;
  }, [searchTerm, employees, departments]);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.fullName || !newEmployee.department) return;
    const id = 'e' + Math.random().toString(36).substr(2, 5);
    setEmployees(prev => [...prev, { ...newEmployee, id } as Employee]);
    setIsAddEmployeeModalOpen(false);
    setNewEmployee({ fullName: '', department: departments[0], position: '', isActive: true });
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (trimmed && !departments.includes(trimmed)) {
      setDepartments(prev => [...prev, trimmed]);
      setNewDeptName('');
      setIsAddDeptModalOpen(false);
      // Обновляем дефолтный отдел в форме сотрудника, если он был пуст
      if (!newEmployee.department) setNewEmployee(prev => ({ ...prev, department: trimmed }));
    }
  };

  const removeDept = (deptName: string) => {
    if (employees.some(e => e.department === deptName)) {
      alert("Нельзя удалить отдел, пока в нем есть сотрудники.");
      return;
    }
    if (confirm(`Удалить структуру "${deptName}"?`)) {
      setDepartments(prev => prev.filter(d => d !== deptName));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Панель инструментов */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Структура штата</h3>
          <p className="text-slate-400 text-sm">Управление подразделениями и персоналом</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px]">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Поиск сотрудника..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddDeptModalOpen(true)}
            className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-folder-plus text-indigo-500"></i> Создать отдел
          </button>
          <button 
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i> Добавить сотрудника
          </button>
        </div>
      </div>

      {/* Группировка по отделам */}
      <div className="space-y-12 pb-20">
        {(Object.entries(groupedEmployees) as [string, Employee[]][]).map(([dept, deptEmployees]) => (
          <div key={dept} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-500">
                <i className="fa-solid fa-building-user"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight leading-none">{dept}</h4>
                  <button onClick={() => removeDept(dept)} className="text-slate-300 hover:text-rose-500 transition-colors text-xs"><i className="fa-solid fa-trash-can"></i></button>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {deptEmployees.length} {deptEmployees.length === 1 ? 'человек' : 'человек(а)'}
                </p>
              </div>
              <div className="hidden sm:block flex-[3] h-px bg-slate-200 ml-4"></div>
            </div>

            {deptEmployees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deptEmployees.map((emp) => (
                  <div key={emp.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center text-lg font-black border border-indigo-100/50">
                        {emp.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 truncate">{emp.fullName}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.position}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 relative z-10">
                      <button onClick={() => {setSelectedEmployee(emp); setActiveTab('profile');}} className="flex-1 py-2 bg-slate-50 border rounded-xl text-[10px] font-bold uppercase hover:bg-slate-900 hover:text-white transition-all">Профиль</button>
                      <button onClick={() => {setSelectedEmployee(emp); setActiveTab('gear');}} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-700 transition-all">Техника</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mx-2 p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 text-sm italic bg-white/50">
                Отдел пуст. Создайте штатные единицы.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Модалка: СОЗДАТЬ ОТДЕЛ */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-800 text-white">
              <h3 className="text-xl font-bold">Новое подразделение</h3>
              <button onClick={() => setIsAddDeptModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddDept} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Название отдела</label>
                <input required autoFocus type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Напр: Отдел аналитики" />
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Создать</button>
            </form>
          </div>
        </div>
      )}

      {/* Модалка: ДОБАВИТЬ СОТРУДНИКА */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Приём на работу</h3>
              <button onClick={() => setIsAddEmployeeModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Полное имя</label>
                <input required type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newEmployee.fullName} onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})} placeholder="ФИО сотрудника" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Отдел</label>
                  <select required className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none cursor-pointer" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}>
                    {departments.length === 0 && <option value="">Сначала создайте отдел</option>}
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Должность</label>
                  <input required type="text" className="w-full px-4 py-3 bg-slate-100 border-0 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" value={newEmployee.position} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} placeholder="Должность" />
                </div>
              </div>
              <button type="submit" disabled={departments.length === 0} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg disabled:bg-slate-300 transition-all">Принять</button>
            </form>
          </div>
        </div>
      )}

      {/* Профиль сотрудника (без изменений логики отображения) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b flex justify-between items-center bg-slate-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">{selectedEmployee.fullName[0]}</div>
                 <h3 className="font-bold text-slate-800">{selectedEmployee.fullName}</h3>
               </div>
               <button onClick={() => setSelectedEmployee(null)} className="text-slate-400"><i className="fa-solid fa-xmark"></i></button>
             </div>
             <div className="p-10 text-center text-slate-400 italic">
               Дополнительные данные профиля и привязка техники (функционал в разработке)
             </div>
             <div className="p-6 border-t flex justify-end">
               <button onClick={() => setSelectedEmployee(null)} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Закрыть</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
