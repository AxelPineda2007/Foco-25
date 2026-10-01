import React, { useState } from 'react';
import { Github, Check, Copy, ExternalLink, Terminal, GitBranch, GitCommit, Shield } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  const steps = [
    {
      title: 'Paso 1: Crear un nuevo repositorio en GitHub',
      desc: 'Entra a GitHub (github.com/new) y crea un nuevo repositorio público o privado llamado "foco-25". No selecciones agregar README ni .gitignore (ya están configurados).',
      url: 'https://github.com/new',
      command: '',
    },
    {
      title: 'Paso 2: Conectar el repositorio remoto',
      desc: 'Reemplaza "TU-USUARIO" con tu nombre de usuario de GitHub y ejecuta este comando en tu terminal:',
      command: 'git remote add origin https://github.com/TU-USUARIO/foco-25.git',
    },
    {
      title: 'Paso 3: Subir tu primer commit (Push)',
      desc: 'Sube la rama principal a GitHub:',
      command: 'git branch -M main\ngit push -u origin main',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Subir a Repositorio GitHub
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Primer Commit Listo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tu proyecto ya tiene el repositorio local inicializado con el commit inicial.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Local Git State Badge */}
        <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <GitCommit className="w-4 h-4 text-indigo-400" />
            <span>Primer Commit Registrado:</span>
          </div>
          <div className="font-mono text-[11px] text-emerald-400 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            commit: feat: inicializar FOCO 25 - habitos de estudio con IA y temporizador 25/5
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 my-4 text-xs">
          {steps.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white">{s.title}</span>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Abrir GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-2 leading-relaxed">{s.desc}</p>
              {s.command && (
                <div className="relative group">
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre">
                    {s.command}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(s.command, idx)}
                    className="absolute right-2 top-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copiar comando"
                  >
                    {copiedStep === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary note */}
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-slate-400 flex items-start gap-2">
          <Terminal className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            Una vez hecho el push a GitHub, tu código quedará respaldado en la nube con historial de cambios completo y listo para compartir.
          </span>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
