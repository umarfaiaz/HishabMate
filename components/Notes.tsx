
import React, { useState } from 'react';
import { Icons } from '../Icons';
import { Note, ListItem } from '../types';

export const NotesView: React.FC<{
  notes: Note[];
  openModal: (key: any, item?: any) => void;
  onBack: () => void;
  isLight: boolean;
}> = ({ notes, openModal, onBack, isLight }) => {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(search.toLowerCase()) || 
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-enter pb-24 h-full flex flex-col relative">
            {/* Custom Search Header */}
            <div className={`flex items-center gap-3 py-4 sticky top-0 z-10 ${isLight ? 'bg-gray-50' : 'bg-black'}`}>
                <button onClick={onBack} className={`p-3 rounded-full transition-colors ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/10'}`}>
                    <Icons.ArrowLeft className={`w-6 h-6 ${isLight ? 'text-gray-700' : 'text-white'}`} />
                </button>
                <div className={`flex-1 relative rounded-full overflow-hidden ${isLight ? 'bg-white shadow-sm border border-gray-200' : 'bg-[#1c1c1e]'}`}>
                    <Icons.Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isLight ? 'text-gray-400' : 'text-white/40'}`}/>
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search notes" 
                        className={`w-full py-3 pl-11 pr-4 outline-none bg-transparent font-medium ${isLight ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-white/40'}`}
                    />
                </div>
                <button onClick={() => setViewMode(v => v === 'GRID' ? 'LIST' : 'GRID')} className={`p-3 rounded-full transition-colors ${isLight ? 'hover:bg-gray-200 text-gray-700' : 'hover:bg-white/10 text-white'}`}>
                    {viewMode === 'GRID' ? <Icons.LayoutList className="w-6 h-6"/> : <Icons.LayoutGrid className="w-6 h-6"/>}
                </button>
            </div>

            {/* Floating Action Button for Adding Note */}
            <button 
                onClick={() => openModal('note')} 
                className="fixed bottom-8 right-6 w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center z-50 active:scale-95 transition-transform"
            >
                <Icons.Plus className="w-8 h-8"/>
            </button>

            {/* Notes Layout */}
            {filteredNotes.length === 0 ? (
                 <div className="flex flex-col items-center justify-center flex-1 opacity-40 mt-20">
                    <div className="p-6 bg-yellow-500/10 rounded-full mb-4">
                        <Icons.StickyNote className="w-16 h-16 text-yellow-500"/>
                    </div>
                    <p className="text-xl font-medium">Notes you add appear here</p>
                 </div>
            ) : (
                <div className={viewMode === 'GRID' ? 'columns-2 gap-3 space-y-3' : 'space-y-3 max-w-2xl mx-auto'}>
                    {filteredNotes.map(note => {
                        const hasColor = note.color && note.color !== '#1c1c1e' && note.color !== '#ffffff';
                        const textColor = hasColor ? 'text-gray-900' : (isLight ? 'text-gray-900' : 'text-white');
                        const borderColor = hasColor ? 'border-transparent' : (isLight ? 'border-gray-200' : 'border-white/10');
                        
                        return (
                            <div 
                                key={note.id} 
                                onClick={() => openModal('note', note)} 
                                className={`break-inside-avoid rounded-2xl p-5 cursor-pointer hover:opacity-90 transition-all border shadow-sm ${borderColor}`}
                                style={{ backgroundColor: note.color || (isLight ? '#ffffff' : '#1c1c1e') }}
                            >
                                {note.title && <h3 className={`font-bold text-lg mb-3 leading-tight ${textColor}`}>{note.title}</h3>}
                                {note.type === 'LIST' ? (
                                    <div className="space-y-2">
                                        {(JSON.parse(note.content) as ListItem[]).slice(0, 8).map((i, idx) => (
                                            <div key={idx} className={`flex items-start gap-2 text-sm ${textColor} ${i.checked ? 'opacity-40' : 'opacity-90'}`}>
                                                <div className={`w-4 h-4 mt-0.5 rounded-[4px] border ${hasColor ? 'border-black/30' : 'border-current'} flex items-center justify-center shrink-0`}>
                                                    {i.checked && <div className={`w-2.5 h-2.5 rounded-[2px] ${hasColor ? 'bg-black/60' : 'bg-current'}`}/>}
                                                </div>
                                                <span className={`${i.checked ? 'line-through' : ''} leading-tight`}>{i.text}</span>
                                            </div>
                                        ))}
                                        {(JSON.parse(note.content) as ListItem[]).length > 8 && <p className={`text-xs mt-1 opacity-50 ${textColor}`}>...</p>}
                                    </div>
                                ) : (
                                    <p className={`text-base whitespace-pre-wrap line-clamp-[10] ${textColor} opacity-90 leading-relaxed`}>{note.content}</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};
