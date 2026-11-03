import React, { useState } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Save, Check } from 'lucide-react';
import { sound } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onSave?: () => Promise<void>;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  onSave,
  isMuted,
  onToggleMute,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (!onSave || isSaving) return;
    setIsSaving(true);
    sound.playCorrect();
    try {
      await onSave();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-400/20 rounded-2xl flex items-center justify-center text-3xl border border-amber-400/40">
          ⏸️
        </div>

        <h2 className="text-3xl font-extrabold text-amber-300 font-['Fredoka'] mb-2">
          {"Pause"}
        </h2>
        <p className="text-slate-300 text-sm mb-6">
          { 'Kurze Verschnaufpause für den Mathe-Helden!' }
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              sound.playJump();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg cursor-pointer transform active:scale-95 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{"Weiterspielen"}</span>
          </button>

          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3 px-4 rounded-2xl border flex items-center justify-center gap-2 text-base font-bold cursor-pointer transform active:scale-95 transition ${
                justSaved
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                  : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{"Erfolgreich gespeichert!"}</span>
                </>
              ) : (
                <>
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? "Wird gespeichert..." : "Spielstand speichern"}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              sound.playJump();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{"Nochmal versuchen"}</span>
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onToggleMute();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? "Ton an" : "Ton aus"}</span>
          </button>

          <button
            onClick={() => {
              sound.playJump();
              onQuit();
            }}
            className="w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold rounded-2xl border border-red-500/30 flex items-center justify-center gap-2 text-base cursor-pointer transform active:scale-95 transition"
          >
            <Home className="w-4 h-4" />
            <span>{"Zum Hauptmenü"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
