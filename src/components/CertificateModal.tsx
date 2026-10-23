import React, { useState } from 'react';
import { Award, Printer, ArrowLeft, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, PlayerProfile } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface CertificateModalProps {
  lang: Language;
  player: PlayerProfile;
  onUpdateName: (name: string) => void;
  onBack: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  lang,
  player,
  onUpdateName,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name || 'Felix');
  const today = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handlePrint = () => {
    sound.playCoin();
    window.print();
  };

  const handleSaveName = () => {
    onUpdateName(tempName.trim() || 'Mathe-Held');
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
      {/* Top Action Bar (hidden when printing) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => {
            sound.playJump();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold cursor-pointer transition border border-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t(lang, 'backToMap')}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg cursor-pointer transition"
          >
            <Printer className="w-5 h-5" />
            <span>{t(lang, 'printCertificate')}</span>
          </button>
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div className="w-full max-w-3xl bg-amber-50 border-8 border-double border-amber-800 rounded-3xl p-8 sm:p-12 text-slate-900 shadow-2xl relative overflow-hidden print:m-0 print:p-8 print:w-full print:max-w-none print:shadow-none print:rounded-none">
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>

        {/* Header Ribbon / Crest */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-full shadow-lg text-white mb-3 ring-4 ring-amber-300">
            <Award className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-wider font-serif uppercase">
            {t(lang, 'certificateHeading')}
          </h1>
          <p className="text-amber-800 font-semibold text-sm sm:text-base mt-1 italic">
            {t(lang, 'certificateSub')}
          </p>
        </div>

        {/* Recipient Name Section */}
        <div className="text-center my-8 bg-amber-100/60 p-6 rounded-2xl border-2 border-dashed border-amber-300">
          <div className="text-sm text-amber-900 font-medium mb-1">
            {lang === 'de' ? 'Diese Ehrenurkunde wird mit Stolz verliehen an:' : 'Chứng nhận vinh danh trao cho:'}
          </div>

          {isEditing ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={24}
                className="text-2xl sm:text-3xl font-black text-center text-amber-950 bg-white border-2 border-amber-400 rounded-xl px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition text-sm"
              >
                Speichern
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 mt-1 group">
              <span className="text-3xl sm:text-5xl font-black text-amber-950 font-serif tracking-wide border-b-2 border-amber-600 pb-1 px-4">
                {player.name || 'Felix der Fuchs'}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2 py-1 rounded-lg print:hidden cursor-pointer"
                title="Name ändern"
              >
                ✏️ Ändern
              </button>
            </div>
          )}

          <p className="text-xs sm:text-sm text-amber-800/90 mt-3 font-serif">
            {lang === 'de'
              ? 'für das erfolgreiche Beherrschen des Lehrplans der 3. Klasse Grundschule'
              : 'vì đã xuất sắc hoàn thành các bài học toán lớp 3 trường tiểu học'}
          </p>
        </div>

        {/* Mastered Skills Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-6">
          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-sm text-center flex flex-col items-center">
            <span className="text-2xl mb-1">🚀</span>
            <span className="font-bold text-xs text-amber-950">Zahlen bis 1000</span>
            <span className="text-[10px] text-amber-700">H-Z-E Meister</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
          </div>

          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-sm text-center flex flex-col items-center">
            <span className="text-2xl mb-1">⚡</span>
            <span className="font-bold text-xs text-amber-950">1x1 & Division</span>
            <span className="text-[10px] text-amber-700">Multiplikation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
          </div>

          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-sm text-center flex flex-col items-center">
            <span className="text-2xl mb-1">💶</span>
            <span className="font-bold text-xs text-amber-950">Euro & Cent</span>
            <span className="text-[10px] text-amber-700">Wechselgeld</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
          </div>

          <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-sm text-center flex flex-col items-center">
            <span className="text-2xl mb-1">🏰</span>
            <span className="font-bold text-xs text-amber-950">Schriftl. Rechnen</span>
            <span className="text-[10px] text-amber-700">Mit Übertrag</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/90 p-2.5 rounded-xl border border-amber-200 shadow-sm text-center flex flex-col items-center">
            <span className="text-2xl mb-1">🔴</span>
            <span className="font-bold text-xs text-amber-950">PokéMath</span>
            <span className="text-[10px] text-amber-700">
              {player.capturedPokemon?.length || 1}/12 Gefangen
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
          </div>
        </div>

        {/* Stats & Seal Footer */}
        <div className="pt-6 border-t-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-xl text-amber-900 border-2 border-amber-400">
              ⭐
            </div>
            <div>
              <div className="text-xs text-amber-800 font-bold uppercase">{t(lang, 'stars')} gesammelt</div>
              <div className="text-lg font-black text-amber-950 font-['Fredoka']">
                {player.stars} Sternstunden
              </div>
            </div>
          </div>

          {/* Date & Signature */}
          <div className="flex items-center gap-8 text-center">
            <div>
              <div className="text-xs text-amber-800 font-semibold mb-1">Datum:</div>
              <div className="text-sm font-bold text-amber-950 border-b border-amber-400 pb-0.5 px-3">
                {today}
              </div>
            </div>

            <div>
              <div className="text-xs text-amber-800 font-semibold mb-1">
                {lang === 'de' ? 'Unterschrift Lehrkraft / Eltern:' : 'Chữ ký Giáo viên / Phụ huynh:'}
              </div>
              <div className="w-36 h-7 border-b border-amber-800 italic text-amber-800 text-sm font-serif flex items-end justify-center">
                MatheHeld 3. Klasse
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
