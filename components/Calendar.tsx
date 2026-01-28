
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Icons } from '../Icons';
import { GlassCard, GlassButton, AppHeader, CustomSelect, Modal, CustomDatePicker } from './UI';
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

const isSameMonth = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth();

// Smart Icon mapping based on keywords
const getEventIcon = (title: string, type: EventType) => {
    const t = title.toLowerCase();
    if (t.includes('birthday') || t.includes('anniversary')) return 'Cake';
    if (t.includes('class') || t.includes('study') || t.includes('exam')) return 'GraduationCap';
    if (t.includes('work') || t.includes('meeting') || t.includes('wfh')) return 'Briefcase';
    if (t.includes('holiday') || t.includes('trip') || t.includes('vacation')) return 'Sun';
    if (t.includes('gym') || t.includes('workout')) return 'Dumbbell';
    
    // Default based on Type
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
    
    // Preview Modal State
    const [previewEvent, setPreviewEvent] = useState<CalendarEvent | null>(null);

    // --- Financial Integration Logic with Strict Dedupe ---
    const allEvents = useMemo(() => {
        const systemEvents = getFinancialEvents(loans, debts, viewDate);
        const uniqueEvents = new Map<string, CalendarEvent>();

        events.forEach(e => uniqueEvents.set(e.id, e));

        systemEvents.forEach(sysEv => {
             if (!uniqueEvents.has(sysEv.id)) {
                 uniqueEvents.set(sysEv.id, sysEv);
             }
        });

        return Array.from(uniqueEvents.values()).sort((a,b) => a.startDate.localeCompare(b.startDate));
    }, [events, loans, debts, viewDate]);

    // Handle Scroll for compact mode
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        if (scrollTop > 20 && !isCompact) {
            setIsCompact(true);
        } else if (scrollTop < 5 && isCompact) {
            setIsCompact(false);
        }
    };

    // Scroll to event when selected date changes
    useEffect(() => {
        if (selectedDate && eventListRef.current) {
             const dateStr = formatDate(selectedDate);
             const el = document.getElementById(`event-group-${dateStr}`);
             if (el) {
                 el.scrollIntoView({ behavior: 'smooth', block: 'start' });
             }
        }
    }, [selectedDate]);

    // --- Navigation ---
    const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    const jumpToToday = () => {
        const now = new Date();
        setViewDate(now);
        setSelectedDate(now);
        setIsCompact(false); // Reset view
        if(eventListRef.current) eventListRef.current.scrollTop = 0;
    };

    // --- CRUD ---
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

        if (editingEvent.id) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? newEvent : e));
        } else {
            setEvents(prev => [...prev, newEvent]);
        }
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
    
    const handleEventClick = (e: CalendarEvent) => {
        setPreviewEvent(e);
    };

    const openEditFromPreview = () => {
        if (previewEvent && !previewEvent.isSystem) {
            setEditingEvent(previewEvent);
            setPreviewEvent(null);
            setShowModal(true);
        }
    };

    // --- Render Helpers ---
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
            
            if (e.recurrence === 'MONTHLY') {
                const eventDay = parseInt(e.startDate.split('-')[2]);
                const checkDay = parseInt(dateStr.split('-')[2]);
                return eventDay === checkDay;
            }
            
            if (e.recurrence === 'WEEKLY') {
                const dayIndex = current.getDay();
                if (e.recurrenceDays && e.recurrenceDays.length > 0) {
                    return e.recurrenceDays.includes(dayIndex);
                }
                return start.getDay() === dayIndex;
            }

            if (e.recurrence === 'DAILY') return true;

            return e.startDate === dateStr;
        });
    };

    const toggleRecurrenceDay = (dayIndex: number) => {
        const current = editingEvent?.recurrenceDays || [];
        if (current.includes(dayIndex)) {
            setEditingEvent({ ...editingEvent, recurrenceDays: current.filter(d => d !== dayIndex) });
        } else {
            setEditingEvent({ ...editingEvent, recurrenceDays: [...current, dayIndex] });
        }
    };

    // Generate Calendar Grid
    const calendarGrid = useMemo(() => {
        const totalSlots = 42; 
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        
        const grid = [];
        for (let i = 0; i < totalSlots; i++) {
            if (i < firstDay || i >= firstDay + daysInMonth) {
                grid.push(null);
            } else {
                grid.push(i - firstDay + 1);
            }
        }
        return grid;
    }, [viewDate]);

    // Group events for list
    const groupedEvents = useMemo(() => {
        const groups: { date: string, events: CalendarEvent[] }[] = [];
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = formatDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
            const events = getEventsForDay(dateStr);
            if (events.length > 0) {
                groups.push({ date: dateStr, events });
            }
        }
        return groups;
    }, [allEvents, viewDate]);

    return (
        <div className="animate-enter h-full flex flex-col relative pb-0">
            {/* Header - Fixed & Sticky */}
            <div className={`flex items-center justify-between sticky top-0 z-30 py-4 px-4 transition-colors duration-500 ${isLight ? 'bg-gray-50/95' : 'bg-black/95'} backdrop-blur-xl border-b ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className={`p-2 rounded-full ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                        <Icons.ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div onClick={() => setIsCompact(!isCompact)} className="cursor-pointer">
                        <h2 className="text-xl font-bold leading-none flex items-center gap-2">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            <Icons.ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCompact ? 'rotate-90' : 'rotate-0'} opacity-50`} />
                        </h2>
                    </div>
                </div>
                <div className="flex gap-2 bg-black/5 p-1 rounded-xl">
                    <button onClick={() => setViewMode('MONTH')} className={`p-2 rounded-lg transition-all ${viewMode === 'MONTH' ? (isLight ? 'bg-white shadow' : 'bg-white/20') : 'opacity-50'}`}><Icons.Calendar className="w-5 h-5"/></button>
                    <button onClick={() => setViewMode('AGENDA')} className={`p-2 rounded-lg transition-all ${viewMode === 'AGENDA' ? (isLight ? 'bg-white shadow' : 'bg-white/20') : 'opacity-50'}`}><Icons.List className="w-5 h-5"/></button>
                </div>
            </div>

            {/* View Mode: MONTH */}
            {viewMode === 'MONTH' && (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Collapsible Calendar Grid Area */}
                    <div className={`shrink-0 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden z-20 ${isLight ? 'bg-white' : 'bg-black'}`}>
                        
                        {/* Weekday Headers - Always Visible */}
                        <div className={`grid grid-cols-7 text-center py-2 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                            {DAYS.map(d => <span key={d} className={`text-[10px] font-bold uppercase`}>{d.charAt(0)}</span>)}
                        </div>

                        {/* The Grid - Dynamic Height for Compact Mode */}
                        <div className="grid grid-cols-7 px-2 transition-all duration-500" 
                             style={{ 
                                 gap: isCompact ? '2px' : '4px'
                             }}>
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
                                                relative rounded-lg transition-all duration-500 cursor-pointer flex flex-col items-center justify-center
                                                ${isCompact ? 'h-8 w-full' : 'h-14 w-full border'} 
                                                ${day === null ? 'opacity-0 pointer-events-none' : ''}
                                                ${isToday 
                                                    ? 'bg-blue-600 text-white shadow-md' 
                                                    : (isLight ? 'bg-white/50 border-gray-100 hover:border-blue-300' : 'bg-white/5 border-white/5 hover:border-white/20')
                                                }
                                                ${isSelected && !isToday ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}
                                            `}
                                        >
                                            <span className={`font-bold transition-all duration-500 ${isCompact ? 'text-[10px]' : 'text-sm'}`}>{day}</span>
                                            
                                            {/* Event Dots - Hide in Compact Mode to declutter */}
                                            <div className={`flex gap-0.5 mt-1 h-1 transition-all duration-500 ${isCompact ? 'opacity-0 h-0 scale-0' : 'opacity-100 scale-100'}`}>
                                                {dayEvents.slice(0, 3).map((e, idx) => (
                                                    <div key={idx} className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: isToday ? 'white' : e.color }}></div>
                                                ))}
                                                {dayEvents.length > 3 && <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-gray-400'}`}></div>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Standard Navigation Controls - Below Grid */}
                        <div className={`flex justify-between items-center px-4 py-3 border-b ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                             <button onClick={prevMonth} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-white/60'}`}>
                                <Icons.ArrowLeft className="w-3 h-3"/> Prev
                             </button>
                             <button onClick={() => setIsCompact(!isCompact)} className={`text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity`}>
                                {isCompact ? 'Expand' : 'Collapse'}
                             </button>
                             <button onClick={nextMonth} className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${isLight ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/10 text-white/60'}`}>
                                Next <Icons.ChevronRight className="w-3 h-3"/>
                             </button>
                        </div>
                    </div>

                    {/* Scrollable Events List */}
                    <div 
                        className="flex-1 overflow-y-auto no-scrollbar p-4"
                        ref={eventListRef}
                        onScroll={handleScroll}
                    >
                         {/* Min-height container ensures scrollability even if empty */}
                         <div className="min-h-[105%] space-y-4 pb-24">
                            {groupedEvents.length > 0 ? (
                                groupedEvents.map(group => {
                                    const isSelectedGroup = selectedDate && group.date === formatDate(selectedDate);
                                    return (
                                        <div key={group.date} id={`event-group-${group.date}`} className={`transition-all duration-500 ${isSelectedGroup ? 'bg-blue-500/5 -mx-2 px-2 py-3 rounded-xl border-l-2 border-blue-500' : ''}`}>
                                            <h4 className={`font-bold text-xs mb-2 uppercase tracking-wider ${isSelectedGroup ? 'text-blue-500' : 'opacity-60'}`}>
                                                {new Date(group.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </h4>
                                            <div className="space-y-2">
                                                {group.events.map(e => (
                                                    <GlassCard isLight={isLight} key={e.id} onClick={() => handleEventClick(e)} className="!p-3 flex items-center gap-3 cursor-pointer hover:scale-[1.01] transition-transform">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isLight ? 'bg-gray-100' : 'bg-white/10'}`} style={{ color: e.color }}>
                                                            {renderIcon(e.icon || getEventIcon(e.title, e.type), "w-5 h-5")}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-0.5">
                                                                <h4 className="font-bold text-sm truncate">{e.title}</h4>
                                                                {e.startTime && <span className="text-[10px] font-mono opacity-60 bg-black/5 px-1.5 py-0.5 rounded">{e.startTime}</span>}
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
                                <div className="text-center opacity-40 py-20">
                                    <Icons.Calendar className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    <p>No events in {viewDate.toLocaleString('default', { month: 'long' })}</p>
                                    <button onClick={() => { setEditingEvent({ startDate: formatDate(new Date()), isAllDay: true }); setShowModal(true); }} className="text-blue-500 font-bold mt-2 text-sm">Create Event</button>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            )}

            {/* View Mode: AGENDA */}
            {viewMode === 'AGENDA' && (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 px-4">
                     {groupedEvents.map((group) => {
                            const date = new Date(group.date);
                            const day = date.getDate();
                            const isToday = isSameDay(new Date(), date);

                            return (
                                <div key={group.date} className="flex gap-4">
                                    <div className={`w-14 text-center shrink-0 ${isToday ? 'text-blue-500' : 'opacity-60'}`}>
                                        <span className="block text-xs uppercase font-bold">{DAYS[date.getDay()]}</span>
                                        <span className="block text-2xl font-bold">{day}</span>
                                    </div>
                                    <div className="flex-1 space-y-2 pb-4 border-b border-gray-500/10 border-dashed">
                                        {group.events.map(e => (
                                             <div key={e.id} onClick={() => handleEventClick(e)} className={`cursor-pointer p-3 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'} border-l-4`} style={{ borderLeftColor: e.color }}>
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
                            )
                     })}
                </div>
            )}

            {/* Floating Action Button */}
            <button 
                onClick={() => { setEditingEvent({ startDate: formatDate(selectedDate || new Date()), isAllDay: true, recurrence: 'NONE', recurrenceDays: [] }); setShowModal(true); }} 
                className="fixed bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center z-50 active:scale-95 transition-transform"
            >
                <Icons.Plus className="w-8 h-8"/>
            </button>

            {/* Event Preview Modal */}
            <Modal isOpen={!!previewEvent} onClose={() => setPreviewEvent(null)} title="Event Details" isLight={isLight}>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg`} style={{ backgroundColor: previewEvent?.color, color: 'white' }}>
                            {renderIcon(previewEvent?.icon || 'Calendar', "w-8 h-8")}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{previewEvent?.title}</h2>
                            <p className="text-sm opacity-60 uppercase tracking-widest">{previewEvent?.type}</p>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl ${isLight ? 'bg-gray-100' : 'bg-white/5'} space-y-2`}>
                        <div className="flex justify-between">
                            <span className="opacity-50 text-sm">Date</span>
                            <span className="font-bold">{previewEvent?.startDate}</span>
                        </div>
                        {previewEvent?.startTime && (
                            <div className="flex justify-between">
                                <span className="opacity-50 text-sm">Time</span>
                                <span className="font-bold">{previewEvent.startTime}</span>
                            </div>
                        )}
                        {previewEvent?.recurrence !== 'NONE' && (
                            <div className="flex justify-between">
                                <span className="opacity-50 text-sm">Repeats</span>
                                <span className="font-bold">{previewEvent?.recurrence}</span>
                            </div>
                        )}
                    </div>

                    {previewEvent?.description && (
                        <div className="p-4 rounded-2xl border border-dashed border-gray-500/30">
                            <p className="text-sm opacity-80 whitespace-pre-wrap">{previewEvent.description}</p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        {previewEvent?.isSystem ? (
                            <p className="text-xs text-center w-full opacity-40">This is an auto-generated system event.</p>
                        ) : (
                            <>
                                <GlassButton variant="danger" onClick={() => handleDeleteEvent(previewEvent!.id)}>Delete</GlassButton>
                                <GlassButton variant="accent" className="flex-1" onClick={openEditFromPreview}>Edit Event</GlassButton>
                            </>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Add/Edit Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingEvent(null); }} title={editingEvent?.id ? 'Edit Event' : 'New Event'} isLight={isLight}>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Title</label>
                        <input className="glass-input w-full p-4 rounded-xl text-lg font-bold" placeholder="e.g. Birthday, Meeting" value={editingEvent?.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <CustomDatePicker 
                                label="Date"
                                value={editingEvent?.startDate || ''}
                                onChange={val => setEditingEvent({...editingEvent, startDate: val})}
                                isLight={isLight}
                                className="z-20"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Time (Optional)</label>
                            <input type="time" className="glass-input w-full p-3 rounded-xl" value={editingEvent?.startTime || ''} onChange={e => setEditingEvent({...editingEvent, startTime: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Type</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(EVENT_COLORS).map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setEditingEvent({...editingEvent, type: type as EventType, color: EVENT_COLORS[type as EventType]})}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${editingEvent?.type === type ? 'ring-2 ring-offset-1 ring-offset-black ring-white' : 'opacity-60 border-transparent'}`}
                                    style={{ backgroundColor: EVENT_COLORS[type as EventType], color: '#fff' }}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recurrence Section */}
                    <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                         <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-2 block">Repeats</label>
                         <CustomSelect 
                            options={['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map(r => ({ label: r, value: r }))}
                            value={editingEvent?.recurrence || 'NONE'}
                            onChange={val => setEditingEvent({...editingEvent, recurrence: val as RecurrenceType})}
                            isLight={isLight}
                            className="mb-3"
                         />
                         
                         {editingEvent?.recurrence === 'WEEKLY' && (
                             <div className="space-y-3 animate-enter">
                                 <p className="text-xs opacity-50">Select Days:</p>
                                 <div className="flex justify-between">
                                     {DAYS.map((d, idx) => (
                                         <button 
                                            key={d}
                                            onClick={() => toggleRecurrenceDay(idx)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${editingEvent.recurrenceDays?.includes(idx) ? 'bg-blue-500 text-white shadow-lg' : (isLight ? 'bg-white border border-gray-200 text-gray-400' : 'bg-white/10 text-white/40')}`}
                                         >
                                             {d.charAt(0)}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {editingEvent?.recurrence !== 'NONE' && (
                             <div className="mt-3 animate-enter">
                                <CustomDatePicker 
                                    label="End Date (Optional)"
                                    value={editingEvent?.endDate || ''}
                                    onChange={val => setEditingEvent({...editingEvent, endDate: val})}
                                    placeholder="Forever"
                                    isLight={isLight}
                                />
                             </div>
                         )}
                    </div>

                    <div>
                         <label className="text-xs opacity-50 uppercase font-bold ml-1 mb-1 block">Description</label>
                         <textarea className="glass-input w-full p-4 rounded-xl min-h-[80px]" placeholder="Details..." value={editingEvent?.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} />
                    </div>

                    <div className="flex gap-2 pt-4 mt-2 border-t border-gray-500/20">
                        {editingEvent?.id && (
                            <GlassButton variant="danger" onClick={() => handleDeleteEvent(editingEvent.id!)}>Delete</GlassButton>
                        )}
                        <GlassButton variant="accent" className="flex-1" onClick={handleSaveEvent}>Save Event</GlassButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
