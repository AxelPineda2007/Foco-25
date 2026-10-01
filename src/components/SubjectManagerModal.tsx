import React, { useState } from 'react';
import { Subject } from '../types';
import { X, Plus, Trash2, Palette } from 'lucide-react';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#2563eb', // Blue
  '#db2777', // Pink
  '#16a34a', // Green
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onDeleteSubject,
}) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubjectName.trim(),
      color: selectedColor,
    };

    onAddSubject(newSub);
    setNewSubjectName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Gestionar Materias</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Subjects List */}
        <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
          {subjects.map(sub => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="font-semibold text-white">{sub.name}</span>
              </div>
              {subjects.length > 1 && (
                <button
                  onClick={() => onDeleteSubject(sub.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Eliminar materia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Subject Form */}
        <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-4 text-xs">
          <label className="block font-medium text-slate-300 mb-1.5">
            Agregar nueva materia:
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Nombre de la materia..."
              value={newSubjectName}
              onChange={e => setNewSubjectName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newSubjectName.trim()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          </div>

          <div className="mb-4">
            <span className="block text-[11px] text-slate-400 mb-1.5">Color distintivo:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
