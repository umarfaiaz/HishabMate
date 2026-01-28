
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, CustomSelect, Modal, CustomDatePicker } from './UI';
import { CalendarEvent, Loan, Debt, EventType, RecurrenceType } from '../types';
import { generateId, formatDate, getFinancialEvents } from '../utils';

// --- Constants ---
const EVENT_COLORS: Record<EventType, string> = {
    FINANCE: '#10b981', // Emerald
    WORK: '#3b82f6', // Blue
    PERSONAL: '#8b5cf6', // Purple
    HEALTH: '#f97316', // Orange
    EDUCATION: '#eab308', // Yellow
    HOLIDAY: '#ef4444', // Red
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Helper Functions ---
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

const getEventIcon = (title: string, type: EventType) => {
    const t = title.toLowerCase();
    if (t.includes('birthday') || t.includes('anniversary')) return 'Cake';
    if (t.includes('class') || t.includes('study') || t.includes('exam')) return 'GraduationCap';
    if (t.includes('work') || t.includes('meeting') || t.includes('wfh')) return 'Briefcase';
    if (t.includes('holiday') || t.includes('trip') || t.includes('vacation')) return 'Sun';
    if (t.includes('gym') || t.includes('workout')) return 'Dumbbell';
    
    switch(type) {
        case 'FINANCE': return 'Banknote';
        case 'WORK': return 'Briefcase';
        case 'HEALTH': return 'Heart';
        case 'EDUCATION': return 'Book';
        case 'HOLIDAY': return 'Plane';
        default: return 'Calendar';
    }
};

export const CalendarView: React.FC<{
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    loans: Loan[];
    debts: Debt[];
    onBack: () => void;
    isLight: boolean;
}> = ({ events, setEvents, loans, debts, onBack, isLight }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'MONTH' | 'AGENDA'>('MONTH');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
    const eventListRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);

    // --- Financial Integration Logic ---
    const allEvents = useMemo(() => {
        const systemEvents = getFinancialEvents(loans, debts, viewDate);
        const uniqueEvents = new Map<string, CalendarEvent>();

        events.forEach(e => uniqueEvents.set(e.id, e));
        systemEvents.forEach(sysEv => { if (!uniqueEvents.has(sysEv.id)) uniqueEvents.set(sysEv.id, sysEv); });

        return Array.from(uniqueEvents.values()).sort((a,b) => a.startDate.localeCompare(b.startDate));
    }, [events, loans, debts, viewDate]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        if (scrollTop > 20 && !isCompact) setIsCompact(true);
        else if (scrollTop < 5 && isCompact) setIsCompact(false);
    };

    useEffect(() => {
        if (selectedDate && eventListRef.current) {
             const dateStr = formatDate(selectedDate);
             const el = document.getElementById(`event-group-${dateStr}`);
             if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedDate]);

    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

    const handleSaveEvent = () => {
        if (!editingEvent?.title || !editingEvent?.startDate) return;
        const icon = editingEvent.icon || getEventIcon(editingEvent.title, editingEvent.type || 'PERSONAL');
        const newEvent: CalendarEvent = {
            id: editingEvent.id || generateId(),
            title: editingEvent.title,
            description: editingEvent.description || '',
            startDate: editingEvent.startDate,
            endDate: editingEvent.endDate || '',
            startTime: editingEvent.startTime || '',
            isAllDay: editingEvent.isAllDay || false,
            type: editingEvent.type || 'PERSONAL',
            recurrence: editingEvent.recurrence || 'NONE',
            recurrenceDays: editingEvent.recurrenceDays || [],
            color: editingEvent.color || EVENT_COLORS[editingEvent.type || 'PERSONAL'],
            icon: icon,
            isSystem: false
        };

        if (editingEvent.id) setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
        else setEvents(prev => [...prev, newEvent]);
        
        setShowModal(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        setShowModal(false);
        setPreviewEvent(null);
    };

    const handleDayClick = (day: number) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(date);
    };
    
    const renderIcon = (iconName: string, className: string) => {
       const IconComp = Icons[iconName as keyof typeof Icons] as any;
       return IconComp ? <IconComp className={className} /> : null;
    };

    const getEventsForDay = (dateStr: string) => {
        return allEvents.filter(e => {
            const current = new Date(dateStr);
            const start = new Date(e.startDate);
            const end = e.endDate ? new Date(e.endDate) : null;
            if (current < start) return false;
            if (end && current > end) return false;
            if (e.recurrence === 'NONE') return e.startDate === dateStr;
            if (e.recurrence === 'MONTHLY') return parseInt(e.startDate.split('-')[2]) === parseInt(dateStr.split('-')[2]);
            if (e.recurrence === 'WEEKLY') {
                const dayIndex = current.getDay();
                return e.recurrenceDays && e.recurrenceDays.length > 0 ? e.recurrenceDays.includes(dayIndex) : start.getDay() === dayIndex;
            }
            if (e.recurrence === 'DAILY') return true;
            return e.startDate === dateStr;
        });
    };

    const calendarGrid = useMemo(() => {
        const totalSlots = 42; 
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const grid = [];
        for (let i = 0; i < totalSlots; i++) {
            if (i < firstDay || i >= firstDay + daysInMonth) grid.push(null);
            else grid.push(i - firstDay + 1);
        }
        return grid;
    }, [viewDate]);

    const groupedEvents = useMemo(() => {
        const groups: { date: string, events: CalendarEvent[] }[] = [];
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = formatDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
            const events = getEventsForDay(dateStr);
            if (events.length > 0) groups.push({ date: dateStr, events });
        }
        return groups;
    }, [allEvents, viewDate]);

    return (
        <div className="animate-enter h-full flex flex-col relative pb-0">
            {/* Header - Consolidated Controls */}
            <div className={`flex items-center justify-between sticky top-0 z-30 py-4 px-4 transition-colors duration-500 ${isLight ? 'bg-gray-50/95' : 'bg-black/95'} backdrop-blur-xl border-b ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                        <Icons.ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={prevMonth} className={`p-1 rounded-full opacity-60 hover:opacity-100`}>
                            <Icons.ArrowLeft className="w-4 h-4"/>
                        </button>
                        <h2 className="text-lg font-bold leading-none w-32 text-center">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className={`p-1 rounded-full opacity-60 hover:opacity-100`}>
                            <Icons.ChevronRight className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setViewMode('MONTH')} className={`p-2 rounded-lg transition-all ${viewMode === 'MONTH' ? (isLight ? 'bg-white shadow text-black' : 'bg-white/20 text-white') : 'opacity-50'}`}><Icons.Calendar className="w-5 h-5"/></button>
                    <button onClick={() => setViewMode('AGENDA')} className={`p-2 rounded-lg transition-all ${viewMode === 'AGENDA' ? (isLight ? 'bg-white shadow text-black' : 'bg-white/20 text-white') : 'opacity-50'}`}><Icons.List className="w-5 h-5"/></button>
                </div>
            </div>

            {/* View Mode: MONTH */}
            {viewMode === 'MONTH' && (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Calendar Grid Area */}
                    <div className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden z-20 ${isLight ? 'bg-gray-50' : 'bg-black'}`}>
                        
                        <div className={`grid grid-cols-7 text-center py-2 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                            {DAYS.map(d => <span key={d} className={`text-[10px] font-bold uppercase`}>{d.charAt(0)}</span>)}
                        </div>

                        <div className="grid grid-cols-7 px-2 transition-all duration-500" style={{ gap: isCompact ? '2px' : '4px' }}>
                            {calendarGrid.map((day, i) => {
                                const dateStr = day ? formatDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) : '';
                                const dayEvents = day ? getEventsForDay(dateStr) : [];
                                const isToday = day ? isSameDay(new Date(), new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) : false;
                                const isSelected = day && selectedDate ? isSameDay(selectedDate, new Date(viewDate.getFullYear(), viewDate.getMonth(), day)) : false;

                                return (
                                    <div key={i} className="min-h-0 overflow-hidden flex flex-col justify-center">
                                        <div 
                                            onClick={() => day && handleDayClick(day)}
                                            className={`
                                                relative rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center
                                                ${isCompact ? 'h-8 w-full' : 'h-12 w-full'} 
                                                ${day === null ? 'opacity-0 pointer-events-none' : ''}
                                                ${isToday 
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                                    : (isLight ? 'bg-white border border-gray-100 text-gray-700' : 'bg-white/5 border border-white/5 text-white')
                                                }
                                                ${isSelected && !isToday ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}
                                            `}
                                        >
                                            <span className={`font-bold ${isCompact ? 'text-[10px]' : 'text-sm'}`}>{day}</span>
                                            
                                            <div className={`flex gap-0.5 mt-1 h-1 transition-all duration-500 ${isCompact ? 'opacity-0 h-0 scale-0' : 'opacity-100 scale-100'}`}>
                                                {dayEvents.slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className="w-1 h-1 rounded-full" style={{ backgroundColor: isToday ? 'white' : e.color }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Drag Handle to Collapse */}
                        <div onClick={() => setIsCompact(!isCompact)} className="flex justify-center py-2 cursor-pointer opacity-30 hover:opacity-100 active:scale-110 transition-all">
                            <div className={`w-12 h-1 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/30'}`}></div>
                        </div>
                    </div>

                    {/* Scrollable Events List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4" ref={eventListRef} onScroll={handleScroll}>
                         <div className="min-h-[105%] space-y-4 pb-32">
                            {groupedEvents.length > 0 ? (
                                groupedEvents.map(group => {
                                    const isSelectedGroup = selectedDate && group.date === formatDate(selectedDate);
                                    return (
                                        <div key={group.date} id={`event-group-${group.date}`} className={`transition-all duration-500 ${isSelectedGroup ? 'bg-blue-500/5 -mx-2 px-2 py-3 rounded-2xl border-l-2 border-blue-500' : ''}`}>
                                            <h4 className={`font-bold text-xs mb-2 uppercase tracking-wider ml-1 ${isSelectedGroup ? 'text-blue-500' : 'opacity-60'}`}>
                                                {new Date(group.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                            </h4>
                                            <div className="space-y-2">
                                                {group.events.map(e => (
                                                    <GlassCard isLight={isLight} key={e.id} onClick={() => setPreviewEvent(e)} className="!p-3 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isLight ? 'bg-gray-50' : 'bg-white/10'}`} style={{ color: e.color }}>
                                                            {renderIcon(e.icon || getEventIcon(e.title, e.type), "w-5 h-5")}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <h4 className="font-bold text-sm truncate">{e.title}</h4>
                                                                {e.startTime && <span className="text-[10px] font-mono opacity-60 bg-black/5 px-2 py-0.5 rounded-md">{e.startTime}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/5 uppercase font-bold tracking-wider opacity-60">{e.type}</span>
                                                                {e.isSystem && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 uppercase font-bold tracking-wider">AUTO</span>}
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <div className={`p-4 rounded-full mb-4 ${isLight ? 'bg-gray-200' : 'bg-white/5'}`}>
                                        <Icons.Calendar className="w-8 h-8"/>
                                    </div>
                                    <p className="font-medium">No events in {viewDate.toLocaleString('default', { month: 'long' })}</p>
                                    <button onClick={() => { setEditingEvent({ startDate: formatDate(new Date()), isAllDay: true }); setShowModal(true); }} className="text-blue-500 font-bold mt-2 text-sm">Add Event</button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            )}

            {viewMode === 'AGENDA' && (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-4 pt-4 pb-32">
                     {groupedEvents.map((group) => (
                        <div key={group.date} className="flex gap-4">
                            <div className={`w-14 text-center shrink-0 ${isSameDay(new Date(), new Date(group.date)) ? 'text-blue-500' : 'opacity-60'}`}>
                                <span className="block text-xs uppercase font-bold">{DAYS[new Date(group.date).getDay()]}</span>
                                <span className="block text-2xl font-bold">{new Date(group.date).getDate()}</span>
                            </div>
                            <div className="flex-1 space-y-2 pb-4 border-b border-gray-500/10 border-dashed">
                                {group.events.map(e => (
                                     <div key={e.id} onClick={() => setPreviewEvent(e)} className={`cursor-pointer p-3 rounded-xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'} border-l-4`} style={{ borderLeftColor: e.color }}>
                                         <div className="flex justify-between items-start">
                                             <h4 className="font-bold text-sm flex items-center gap-2">
                                                 {renderIcon(e.icon || getEventIcon(e.title, e.type), "w-4 h-4 opacity-70")}
                                                 {e.title}
                                             </h4>
                                             {e.startTime && <span className="text-xs font-mono opacity-50 bg-black/5 px-1 rounded">{e.startTime}</span>}
                                         </div>
                                         {e.description && <p className="text-xs opacity-50 mt-1 line-clamp-1">{e.description}</p>}
                                     </div>
                                ))}
                            </div>
                        </div>
                     ))}
                </div>
            )}

            {/* Floating Action Button */}
            <button 
                onClick={() => { setEditingEvent({ startDate: formatDate(selectedDate || new Date()), isAllDay: true, recurrence: 'NONE', recurrenceDays: [] }); setShowModal(true); }} 
                className="fixed bottom-10 right-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center z-50 active:scale-90 transition-transform"
            >
                <Icons.Plus className="w-8 h-8"/>
            </button>

            {/* Event Modals (Preview & Edit) - Kept largely same structure but cleaned up styles */}
            <Modal isOpen={!!previewEvent} onClose={() => setPreviewEvent(null)} title="Event Details" isLight={isLight}>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg`} style={{ backgroundColor: previewEvent?.color, color: 'white' }}>
                            {renderIcon(previewEvent?.icon || 'Calendar', "w-8 h-8")}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">{previewEvent?.title}</h2>
                            <span className="text-xs font-bold px-2 py-1 bg-black/5 rounded-md uppercase tracking-wider opacity-60">{previewEvent?.type}</span>
                        </div>
                    </div>
                    
                    <div className={`p-5 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'} space-y-3`}>
                        <div className="flex justify-between items-center">
                            <span className="opacity-50 text-sm font-medium">Date</span>
                            <span className="font-bold">{previewEvent?.startDate}</span>
                        </div>
                        {previewEvent?.startTime && (
                            <div className="flex justify-between items-center">
                                <span className="opacity-50 text-sm font-medium">Time</span>
                                <span className="font-bold">{previewEvent.startTime}</span>
                            </div>
                        )}
                        {previewEvent?.recurrence !== 'NONE' && (
                            <div className="flex justify-between items-center">
                                <span className="opacity-50 text-sm font-medium">Repeats</span>
                                <span className="font-bold">{previewEvent?.recurrence}</span>
                            </div>
                        )}
                    </div>

                    {previewEvent?.description && (
                        <div className="p-4 rounded-2xl border border-dashed border-gray-500/30">
                            <p className="text-sm opacity-80 whitespace-pre-wrap leading-relaxed">{previewEvent.description}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        {previewEvent?.isSystem ? (
                            <p className="text-xs text-center w-full opacity-40 italic">This is an auto-generated system event.</p>
                        ) : (
                            <>
                                <GlassButton variant="danger" onClick={() => handleDeleteEvent(previewEvent!.id)}>Delete</GlassButton>
                                <GlassButton variant="accent" className="flex-1" onClick={() => { setEditingEvent(previewEvent); setPreviewEvent(null); setShowModal(true); }}>Edit Event</GlassButton>
                            </>
                        )}
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingEvent(null); }} title={editingEvent?.id ? 'Edit Event' : 'New Event'} isLight={isLight}>
                <div className="space-y-5">
                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Title</label>
                        <input className="glass-input w-full p-4 rounded-xl text-lg font-bold" placeholder="Event Title" value={editingEvent?.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <CustomDatePicker label="Date" value={editingEvent?.startDate || ''} onChange={val => setEditingEvent({...editingEvent, startDate: val})} isLight={isLight} className="z-20" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Time</label>
                            <input type="time" className="glass-input w-full p-3.5 rounded-xl font-bold" value={editingEvent?.startTime || ''} onChange={e => setEditingEvent({...editingEvent, startTime: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-2 block">Category</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(EVENT_COLORS).map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setEditingEvent({...editingEvent, type: type as EventType, color: EVENT_COLORS[type as EventType]})}
                                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border-2 ${editingEvent?.type === type ? 'border-white shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: EVENT_COLORS[type as EventType], color: '#fff' }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                         <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-2 block">Recurrence</label>
                         <CustomSelect 
                            options={['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(r => ({ label: r, value: r }))}
                            value={editingEvent?.recurrence || 'NONE'}
                            onChange={val => setEditingEvent({...editingEvent, recurrence: val as RecurrenceType})}
                            isLight={isLight}
                         />
                         
                         {editingEvent?.recurrence === 'WEEKLY' && (
                             <div className="mt-4 flex justify-between">
                                 {DAYS.map((d, idx) => (
                                     <button key={d} onClick={() => {
                                         const current = editingEvent.recurrenceDays || [];
                                         setEditingEvent({ ...editingEvent, recurrenceDays: current.includes(idx) ? current.filter(x => x !== idx) : [...current, idx] });
                                     }} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${editingEvent.recurrenceDays?.includes(idx) ? 'bg-blue-600 text-white shadow-lg' : (isLight ? 'bg-white border border-gray-200 text-gray-400' : 'bg-white/10 text-white/40')}`}>
                                         {d.charAt(0)}
                                     </button>
                                 ))}
                             </div>
                         )}
                    </div>

                    <div>
                         <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Description</label>
                         <textarea className="glass-input w-full p-4 rounded-xl min-h-[100px]" placeholder="Add details, location, notes..." value={editingEvent?.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} />
                    </div>

                    <GlassButton variant="accent" className="w-full !py-4 text-lg" onClick={handleSaveEvent}>Save Event</GlassButton>
                </div>
            </Modal>
        </div>
    );
};
