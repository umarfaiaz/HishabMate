
import React, { useState } from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, AppHeader, FormattedNumberInput, CustomDatePicker, CustomSelect, Modal } from './UI';
import { HealthData, Medicine, DoctorAppointment, FitnessGoal, FitnessRoutine, CalendarEvent } from '../types';
import { generateId, formatDate } from '../utils';

export const HealthView: React.FC<{
    healthData: HealthData;
    setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
    calendarEvents: CalendarEvent[];
    setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    onBack: () => void;
    isLight: boolean;
}> = ({ healthData, setHealthData, calendarEvents, setCalendarEvents, onBack, isLight }) => {
    const [subTool, setSubTool] = useState<'MENU' | 'MEDS' | 'DOC' | 'FITNESS' | 'BMI'>('MENU');

    if (subTool === 'MENU') {
        const tools = [
            { id: 'MEDS', icon: 'Pill', label: 'Medicine Reminder', color: 'bg-rose-500' },
            { id: 'DOC', icon: 'Stethoscope', label: 'Doctor Appointments', color: 'bg-blue-500' },
            { id: 'FITNESS', icon: 'Dumbbell', label: 'Fitness Goals & Routine', color: 'bg-emerald-500' },
            { id: 'BMI', icon: 'Heart', label: 'BMI Calculator', color: 'bg-purple-500' },
        ];

        return (
            <div className="animate-enter pb-24 h-full flex flex-col">
                <AppHeader title="Health Hub" onBack={onBack} isLight={isLight} />
                
                {/* Water Tracker Mini-Widget */}
                <div className={`p-6 rounded-[32px] mb-6 relative overflow-hidden flex items-center justify-between ${isLight ? 'bg-cyan-50 border border-cyan-100' : 'bg-cyan-900/20 border border-cyan-500/20'}`}>
                    <div className="z-10">
                        <h3 className={`text-lg font-bold mb-1 ${isLight ? 'text-cyan-900' : 'text-cyan-100'}`}>Daily Water Intake</h3>
                        <div className="flex items-end gap-2">
                             <span className="text-4xl font-black text-cyan-500">{healthData.waterIntake?.count || 0}</span>
                             <span className="text-sm font-bold opacity-60 mb-1.5">glasses</span>
                        </div>
                    </div>
                    <div className="flex gap-2 z-10">
                        <button onClick={() => setHealthData(prev => ({...prev, waterIntake: { ...prev.waterIntake, count: Math.max(0, (prev.waterIntake?.count || 0) - 1) }}))} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${isLight ? 'bg-white text-cyan-600 shadow-sm' : 'bg-cyan-500/20 text-cyan-300'}`}>-</button>
                        <button onClick={() => setHealthData(prev => ({...prev, waterIntake: { ...prev.waterIntake, count: (prev.waterIntake?.count || 0) + 1 }}))} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${isLight ? 'bg-cyan-500 text-white shadow-md' : 'bg-cyan-500 text-white'}`}>+</button>
                    </div>
                    <Icons.Droplet className="absolute -right-6 -bottom-6 w-32 h-32 text-cyan-500/10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {tools.map(t => (
                        <button key={t.id} onClick={() => setSubTool(t.id as any)} className={`p-6 rounded-[28px] flex flex-col items-center gap-3 active:scale-95 transition-transform ${isLight ? 'bg-white shadow-lg shadow-gray-200/50' : 'bg-white/5 border border-white/5'}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${t.color}`}>
                                {React.createElement(Icons[t.icon as keyof typeof Icons] as any, { className: "w-7 h-7" })}
                            </div>
                            <span className={`font-bold text-sm text-center ${isLight ? 'text-gray-800' : 'text-white/80'}`}>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const renderBack = () => (
        <button onClick={() => setSubTool('MENU')} className={`mb-4 flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity`}>
            <Icons.ArrowLeft className="w-4 h-4" /> Back to Health
        </button>
    );

    return (
        <div className="animate-enter pb-24 h-full flex flex-col">
            <AppHeader title={subTool === 'MEDS' ? 'Medicines' : subTool === 'DOC' ? 'Appointments' : subTool === 'FITNESS' ? 'Fitness' : 'BMI Calculator'} onBack={() => setSubTool('MENU')} isLight={isLight} />
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {subTool === 'BMI' && <BMICalculator isLight={isLight} />}
                {subTool === 'MEDS' && <MedicineView healthData={healthData} setHealthData={setHealthData} isLight={isLight} />}
                {subTool === 'DOC' && <AppointmentView healthData={healthData} setHealthData={setHealthData} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} isLight={isLight} />}
                {subTool === 'FITNESS' && <FitnessView healthData={healthData} setHealthData={setHealthData} isLight={isLight} />}
            </div>
        </div>
    );
};

// --- Sub-Components ---

const MedicineView: React.FC<{
    healthData: HealthData;
    setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
    isLight: boolean;
}> = ({ healthData, setHealthData, isLight }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<Medicine>>({});

    const handleSave = () => {
        if (!form.name || !form.time) return;
        const newMed = { ...form, id: generateId() } as Medicine;
        setHealthData(prev => ({ ...prev, medicines: [...prev.medicines, newMed] }));
        setIsAdding(false);
        setForm({});
    };

    const handleDelete = (id: string) => {
        setHealthData(prev => ({ ...prev, medicines: prev.medicines.filter(m => m.id !== id) }));
    };

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    return (
        <div className="space-y-4">
            <GlassButton onClick={() => setIsAdding(true)} className="w-full bg-rose-500 hover:bg-rose-600 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Add Medicine</GlassButton>
            
            {healthData.medicines.map(med => (
                <div key={med.id} className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-rose-100 text-rose-500' : 'bg-rose-500/20 text-rose-400'}`}>
                            <Icons.Pill className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold">{med.name}</h4>
                            <p className="text-xs opacity-60">{med.dosage} • {med.time} • {med.frequency}</p>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(med.id)} className="text-red-400 p-2"><Icons.Trash className="w-4 h-4"/></button>
                </div>
            ))}

            <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Add Medicine" isLight={isLight}>
                <div className="space-y-3">
                    <input placeholder="Medicine Name" className={`${inputClass} w-full p-3 rounded-xl font-bold`} value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                    <input placeholder="Dosage (e.g. 1 tablet)" className={`${inputClass} w-full p-3 rounded-xl`} value={form.dosage || ''} onChange={e => setForm({...form, dosage: e.target.value})} />
                    <div className="flex gap-3">
                        <input type="time" className={`${inputClass} flex-1 p-3 rounded-xl`} value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                        <div className="flex-1">
                            <CustomSelect 
                                value={form.frequency || 'DAILY'} 
                                onChange={v => setForm({...form, frequency: v as any})} 
                                options={[{label:'Daily', value:'DAILY'}, {label:'Twice Daily', value:'TWICE_DAILY'}, {label:'Weekly', value:'WEEKLY'}, {label:'As Needed', value:'AS_NEEDED'}]}
                                isLight={isLight}
                            />
                        </div>
                    </div>
                    <GlassButton variant="accent" onClick={handleSave} className="w-full !py-3 mt-2">Save Medicine</GlassButton>
                </div>
            </Modal>
        </div>
    );
};

const AppointmentView: React.FC<{
    healthData: HealthData;
    setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
    calendarEvents: CalendarEvent[];
    setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    isLight: boolean;
}> = ({ healthData, setHealthData, calendarEvents, setCalendarEvents, isLight }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<Partial<DoctorAppointment>>({});

    const handleSave = () => {
        if (!form.doctorName || !form.date) return;
        const newAppt = { ...form, id: generateId() } as DoctorAppointment;
        
        // Save appointment
        setHealthData(prev => ({ ...prev, appointments: [...prev.appointments, newAppt] }));
        
        // Sync to Calendar
        const newEvent: CalendarEvent = {
            id: `appt_${newAppt.id}`,
            title: `Dr. ${newAppt.doctorName} (${newAppt.specialty})`,
            description: `Location: ${newAppt.location || 'N/A'}\nNotes: ${newAppt.notes || ''}`,
            startDate: newAppt.date,
            startTime: newAppt.time,
            isAllDay: false,
            type: 'HEALTH',
            recurrence: 'NONE',
            color: '#3b82f6',
            icon: 'Stethoscope',
            relatedId: newAppt.id
        };
        setCalendarEvents(prev => [...prev, newEvent]);

        setIsAdding(false);
        setForm({});
    };

    const handleDelete = (id: string) => {
        setHealthData(prev => ({ ...prev, appointments: prev.appointments.filter(a => a.id !== id) }));
        setCalendarEvents(prev => prev.filter(e => e.relatedId !== id));
    };

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    return (
        <div className="space-y-4">
             <GlassButton onClick={() => setIsAdding(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Add Appointment</GlassButton>
             
             {healthData.appointments.map(appt => (
                 <div key={appt.id} className={`p-4 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                     <div className="flex justify-between items-start">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                                <Icons.Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Dr. {appt.doctorName}</h4>
                                <p className="text-xs opacity-60 font-bold uppercase tracking-wider">{appt.specialty}</p>
                            </div>
                         </div>
                         <button onClick={() => handleDelete(appt.id)} className="text-red-400 p-2"><Icons.Trash className="w-4 h-4"/></button>
                     </div>
                     <div className={`mt-2 p-3 rounded-xl flex justify-between items-center ${isLight ? 'bg-gray-50' : 'bg-black/20'}`}>
                        <span className="font-bold text-sm">{appt.date}</span>
                        <span className="font-mono text-sm opacity-80">{appt.time}</span>
                     </div>
                 </div>
             ))}

             <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Appointment" isLight={isLight}>
                 <div className="space-y-3">
                    <input placeholder="Doctor Name" className={`${inputClass} w-full p-3 rounded-xl font-bold`} value={form.doctorName || ''} onChange={e => setForm({...form, doctorName: e.target.value})} />
                    <input placeholder="Specialty (e.g. Dentist)" className={`${inputClass} w-full p-3 rounded-xl`} value={form.specialty || ''} onChange={e => setForm({...form, specialty: e.target.value})} />
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <CustomDatePicker 
                                value={form.date || ''} 
                                onChange={v => setForm({...form, date: v})} 
                                isLight={isLight}
                            />
                        </div>
                        <input type="time" className={`${inputClass} flex-1 p-3 rounded-xl`} value={form.time || ''} onChange={e => setForm({...form, time: e.target.value})} />
                    </div>
                    <input placeholder="Location / Clinic" className={`${inputClass} w-full p-3 rounded-xl`} value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} />
                    <textarea placeholder="Notes" className={`${inputClass} w-full p-3 rounded-xl h-20 resize-none`} value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} />
                    <GlassButton variant="accent" onClick={handleSave} className="w-full !py-3 mt-2">Schedule</GlassButton>
                 </div>
             </Modal>
        </div>
    );
};

const FitnessView: React.FC<{
    healthData: HealthData;
    setHealthData: React.Dispatch<React.SetStateAction<HealthData>>;
    isLight: boolean;
}> = ({ healthData, setHealthData, isLight }) => {
    const [view, setView] = useState<'GOALS' | 'ROUTINE'>('GOALS');
    const [isAdding, setIsAdding] = useState(false);
    const [goalForm, setGoalForm] = useState<Partial<FitnessGoal>>({});
    const [routineForm, setRoutineForm] = useState<Partial<FitnessRoutine>>({});

    const handleSaveGoal = () => {
        if (!goalForm.title) return;
        setHealthData(prev => ({ ...prev, fitnessGoals: [...prev.fitnessGoals, { ...goalForm, id: generateId() } as FitnessGoal] }));
        setIsAdding(false); setGoalForm({});
    };

    const handleSaveRoutine = () => {
        if (!routineForm.title) return;
        setHealthData(prev => ({ ...prev, fitnessRoutines: [...prev.fitnessRoutines, { ...routineForm, id: generateId() } as FitnessRoutine] }));
        setIsAdding(false); setRoutineForm({});
    };

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';

    return (
        <div className="space-y-6">
            <div className={`flex p-1 rounded-xl ${isLight ? 'bg-gray-100' : 'bg-white/10'}`}>
                <button onClick={() => setView('GOALS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'GOALS' ? (isLight ? 'bg-white shadow text-emerald-600' : 'bg-emerald-600 text-white shadow-lg') : 'opacity-60'}`}>Goals</button>
                <button onClick={() => setView('ROUTINE')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${view === 'ROUTINE' ? (isLight ? 'bg-white shadow text-emerald-600' : 'bg-emerald-600 text-white shadow-lg') : 'opacity-60'}`}>Routine</button>
            </div>

            {view === 'GOALS' && (
                <div className="space-y-4">
                    <GlassButton onClick={() => setIsAdding(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Add Goal</GlassButton>
                    {healthData.fitnessGoals.map(g => (
                        <div key={g.id} className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold">{g.title}</h4>
                                <button onClick={() => setHealthData(prev => ({...prev, fitnessGoals: prev.fitnessGoals.filter(x => x.id !== g.id)}))} className="text-red-400"><Icons.Trash className="w-4 h-4"/></button>
                            </div>
                            <div className="flex items-center gap-2 text-sm opacity-80">
                                <span className="font-bold">{g.current}</span>
                                <Icons.ChevronRight className="w-3 h-3"/>
                                <span className="font-bold text-emerald-500">{g.target}</span>
                            </div>
                            {g.deadline && <p className="text-xs opacity-50 mt-2">Target: {g.deadline}</p>}
                        </div>
                    ))}
                    
                    <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Fitness Goal" isLight={isLight}>
                         <div className="space-y-3">
                             <input placeholder="Goal Title (e.g. Lose Weight)" className={`${inputClass} w-full p-3 rounded-xl font-bold`} value={goalForm.title || ''} onChange={e => setGoalForm({...goalForm, title: e.target.value})} />
                             <div className="flex gap-3">
                                 <input placeholder="Current (e.g. 80kg)" className={`${inputClass} flex-1 p-3 rounded-xl`} value={goalForm.current || ''} onChange={e => setGoalForm({...goalForm, current: e.target.value})} />
                                 <input placeholder="Target (e.g. 75kg)" className={`${inputClass} flex-1 p-3 rounded-xl`} value={goalForm.target || ''} onChange={e => setGoalForm({...goalForm, target: e.target.value})} />
                             </div>
                             <div className="relative z-20">
                                <CustomDatePicker value={goalForm.deadline || ''} onChange={v => setGoalForm({...goalForm, deadline: v})} label="Deadline (Optional)" isLight={isLight} />
                             </div>
                             <div className="pt-2">
                                <GlassButton variant="accent" onClick={handleSaveGoal} className="w-full !py-3">Save Goal</GlassButton>
                             </div>
                         </div>
                    </Modal>
                </div>
            )}

            {view === 'ROUTINE' && (
                <div className="space-y-4">
                    <GlassButton onClick={() => setIsAdding(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white !py-4"><Icons.Plus className="w-5 h-5"/> Add Routine</GlassButton>
                    {healthData.fitnessRoutines.sort((a,b) => a.day - b.day).map(r => (
                        <div key={r.id} className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/5 border-white/5'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded mb-1 inline-block ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][r.day]}
                                    </span>
                                    <h4 className="font-bold text-lg">{r.title}</h4>
                                </div>
                                <button onClick={() => setHealthData(prev => ({...prev, fitnessRoutines: prev.fitnessRoutines.filter(x => x.id !== r.id)}))} className="text-red-400"><Icons.Trash className="w-4 h-4"/></button>
                            </div>
                            <div className="whitespace-pre-wrap text-sm opacity-70 border-l-2 border-emerald-500 pl-3">{r.exercises}</div>
                        </div>
                    ))}

                    <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Routine" isLight={isLight}>
                        <div className="space-y-3">
                            <input placeholder="Routine Name (e.g. Leg Day)" className={`${inputClass} w-full p-3 rounded-xl font-bold`} value={routineForm.title || ''} onChange={e => setRoutineForm({...routineForm, title: e.target.value})} />
                            <CustomSelect 
                                value={String(routineForm.day ?? 0)} 
                                onChange={v => setRoutineForm({...routineForm, day: Number(v)})} 
                                options={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => ({ label: d, value: String(i) }))}
                                label="Day of Week"
                                isLight={isLight}
                            />
                            <textarea placeholder="Exercises (e.g.\n- Squats: 3x12\n- Lunges: 3x10)" className={`${inputClass} w-full p-3 rounded-xl h-24 resize-none`} value={routineForm.exercises || ''} onChange={e => setRoutineForm({...routineForm, exercises: e.target.value})} />
                            <GlassButton variant="accent" onClick={handleSaveRoutine} className="w-full !py-3 mt-2">Save Routine</GlassButton>
                        </div>
                    </Modal>
                </div>
            )}
        </div>
    );
};

const BMICalculator: React.FC<{ isLight: boolean }> = ({ isLight }) => {
    const [unitH, setUnitH] = useState<'CM' | 'FT_IN'>('FT_IN');
    const [unitW, setUnitW] = useState<'KG' | 'LBS'>('KG');
    const [heightCm, setHeightCm] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [weightVal, setWeightVal] = useState('');
    
    // Calculate logic identical to before...
    let hMeters = 0;
    if (unitH === 'CM') hMeters = parseFloat(heightCm) / 100;
    else hMeters = ((parseFloat(heightFt)||0) * 30.48 + (parseFloat(heightIn)||0) * 2.54) / 100;
    
    let wKg = unitW === 'KG' ? parseFloat(weightVal) : parseFloat(weightVal) / 2.20462;
    let bmi = 0;
    let status = '', color = '', advice = '';

    if (hMeters > 0 && wKg > 0) {
        bmi = wKg / (hMeters * hMeters);
        if (bmi < 18.5) { status = 'Underweight'; color = 'text-blue-400'; advice = "Gain weight."; } 
        else if (bmi < 24.9) { status = 'Normal'; color = 'text-emerald-400'; advice = "Healthy."; } 
        else if (bmi < 29.9) { status = 'Overweight'; color = 'text-orange-400'; advice = "Lose weight."; } 
        else { status = 'Obese'; color = 'text-red-500'; advice = "Lose weight."; }
    }

    const inputClass = isLight ? 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400' : 'glass-input text-white placeholder-white/30';
    const toggleClass = (active: boolean) => `flex-1 py-2 text-xs font-bold rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-white/5'}`;

    return (
        <div className="space-y-6">
            <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-gray-100' : 'bg-white/5'}`}>
                <div className="flex justify-between items-center mb-3">
                     <label className="text-xs opacity-50 uppercase font-bold">Height</label>
                     <div className={`bg-black/10 p-1 rounded-lg flex w-32 ${isLight ? 'bg-gray-100' : 'bg-black/40'}`}>
                        <button onClick={() => setUnitH('FT_IN')} className={toggleClass(unitH === 'FT_IN')}>FT / IN</button>
                        <button onClick={() => setUnitH('CM')} className={toggleClass(unitH === 'CM')}>CM</button>
                     </div>
                </div>
                {unitH === 'FT_IN' ? (
                    <div className="grid grid-cols-2 gap-3">
                        <FormattedNumberInput value={heightFt} onChange={setHeightFt} className={`${inputClass} w-full p-3 rounded-xl font-bold text-center text-lg`} placeholder="FT" isLight={isLight} />
                        <FormattedNumberInput value={heightIn} onChange={setHeightIn} className={`${inputClass} w-full p-3 rounded-xl font-bold text-center text-lg`} placeholder="IN" isLight={isLight} />
                    </div>
                ) : (
                    <FormattedNumberInput value={heightCm} onChange={setHeightCm} className={`${inputClass} w-full p-3 rounded-xl font-bold text-center text-lg`} placeholder="CM" isLight={isLight} />
                )}
            </div>

            <div className={`p-4 rounded-2xl ${isLight ? 'bg-white border border-gray-100' : 'bg-white/5'}`}>
                <div className="flex justify-between items-center mb-3">
                     <label className="text-xs opacity-50 uppercase font-bold">Weight</label>
                     <div className={`bg-black/10 p-1 rounded-lg flex w-32 ${isLight ? 'bg-gray-100' : 'bg-black/40'}`}>
                        <button onClick={() => setUnitW('KG')} className={toggleClass(unitW === 'KG')}>KG</button>
                        <button onClick={() => setUnitW('LBS')} className={toggleClass(unitW === 'LBS')}>LBS</button>
                     </div>
                </div>
                <div className="w-full">
                    <FormattedNumberInput value={weightVal} onChange={setWeightVal} className={`${inputClass} w-full p-3 rounded-xl font-bold text-center text-lg`} placeholder={unitW} isLight={isLight} />
                </div>
            </div>

            {bmi > 0 && (
                <div className={`p-6 rounded-3xl text-center space-y-4 shadow-xl ${isLight ? 'bg-white border border-gray-100' : 'bg-[#1c1c1e] border border-white/10'}`}>
                    <div>
                        <p className="text-xs opacity-60 uppercase mb-1">Your BMI</p>
                        <p className={`text-6xl font-black tracking-tighter ${color}`}>{bmi.toFixed(1)}</p>
                        <p className={`text-lg font-bold mt-1 ${color}`}>{status}</p>
                    </div>
                    <div className={`mt-4 p-4 rounded-xl text-left ${isLight ? 'bg-blue-50 border border-blue-100' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                        <div className="flex gap-3 items-start">
                            <Icons.Heart className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"/>
                            <div>
                                <p className="text-xs font-bold text-blue-500 uppercase mb-1">Health Note</p>
                                <p className={`text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-blue-100/80'}`}>{advice}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
