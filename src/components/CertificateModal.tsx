import React, { useState } from 'react';
import { Award, Printer, ArrowLeft, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, PlayerProfile } from '../types/game';
import { t } from '../math/translations';
import { sound } from '../audio/soundManager';

interface CertificateModalProps {
  lang: Language;
  player: PlayerProfile;
  onRenamePlayer: (name: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  lang,
  player,
  onRenamePlayer,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name || 'Felix');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const today = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const masteredGames = [
    { icon: '🚀', title: lang === 'de' ? 'Zahlen bis 1000' : 'Số đến 1000', detail: lang === 'de' ? 'H-Z-E Meister' : 'Trăm - Chục - Đơn vị' },
    { icon: '⚡', title: lang === 'de' ? '1x1 & Division' : 'Bảng 1x1 & Chia', detail: lang === 'de' ? 'Multiplikation' : 'Nhân chia chuẩn' },
    { icon: '💶', title: 'Euro & Cent', detail: lang === 'de' ? 'Wechselgeld' : 'Đếm tiền thừa' },
    { icon: '🏰', title: lang === 'de' ? 'Schriftliches Rechnen' : 'Đặt tính rồi tính', detail: lang === 'de' ? 'Mit Übertrag' : 'Cộng trừ có nhớ' },
    { icon: '⚡🐭', title: 'PokéMath Arena', detail: lang === 'de' ? 'Mathe mit Pokémon' : 'Toán cùng Pokémon' },
    { icon: '🧩', title: lang === 'de' ? 'Logik-Abenteuer' : 'Phiêu lưu tư duy', detail: lang === 'de' ? 'Muster & Rätsel' : 'Quy luật & câu đố' },
    { icon: '🧱', title: 'Minecraft 3D', detail: lang === 'de' ? 'Fläche & Quests' : 'Hình học & Quests' },
    { icon: '🧱🛠️', title: 'MathBrick Builder', detail: lang === 'de' ? 'Mathe & 3D-Bauen' : 'Toán & xây dựng 3D' },
    { icon: '🤖🌳', title: 'RoboForge', detail: lang === 'de' ? 'Mathe & Code' : 'Toán & lập trình' },
    { icon: '🤖🧩', title: 'Wegfinder 3D', detail: lang === 'de' ? 'Planen & Labyrinth' : 'Lập kế hoạch & mê cung' },
  ];

  const handlePrint = () => {
    sound.playCoin();
    window.print();
  };

  const handleSaveName = async () => {
    const clean = tempName.trim();
    if (!clean) return;
    if (clean === player.name) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    const res = await onRenamePlayer(clean);
    setSaving(false);
    if (res.success) {
      sound.playCorrect();
      setIsEditing(false);
    } else {
      sound.playWrong();
      setErrorMsg(res.error || t(lang, 'nameAlreadyTaken'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col items-center justify-start overflow-y-auto overscroll-contain bg-slate-950/90 p-2 pb-4 sm:p-8">
      {/* Top Action Bar (hidden when printing) */}
      <div className="sticky top-0 z-10 mb-3 flex w-full max-w-4xl shrink-0 items-center justify-between bg-slate-950/95 py-2 print:hidden sm:mb-6">
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
      <div className="relative mb-2 w-full max-w-3xl shrink-0 overflow-visible rounded-3xl border-8 border-double border-amber-800 bg-amber-50 p-4 text-slate-900 shadow-2xl sm:mb-0 sm:p-12 print:m-0 print:w-full print:max-w-none print:rounded-none print:p-8 print:shadow-none">
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-700 text-3xl font-serif select-none pointer-events-none">❖</div>

        {/* Header Ribbon / Crest */}
        <div className="mb-4 text-center sm:mb-6">
          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg ring-4 ring-amber-300 sm:mb-3 sm:h-20 sm:w-20">
            <Award className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          <h1 className="font-serif text-xl font-black uppercase tracking-wide text-amber-950 sm:text-4xl sm:tracking-wider">
            {t(lang, 'certificateHeading')}
          </h1>
          <p className="text-amber-800 font-semibold text-sm sm:text-base mt-1 italic">
            {t(lang, 'certificateSub')}
          </p>
        </div>

        {/* Recipient Name Section */}
        <div className="my-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-100/60 p-3 text-center sm:my-8 sm:p-6">
          <div className="text-sm text-amber-900 font-medium mb-1">
            {lang === 'de' ? 'Diese Ehrenurkunde wird mit Stolz verliehen an:' : 'Chứng nhận vinh danh trao cho:'}
          </div>

          {isEditing ? (
            <div className="flex flex-col items-center justify-center gap-2 mt-2">
              <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => {
                    setTempName(e.target.value);
                    setErrorMsg(null);
                  }}
                  maxLength={20}
                  className="w-full min-w-0 rounded-xl border-2 border-amber-400 bg-white px-2 py-1.5 text-center font-serif text-xl font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 sm:w-auto sm:px-4 sm:text-3xl"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !tempName.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer transition text-sm"
                >
                  {saving ? (lang === 'de' ? 'Speichern...' : 'Đang lưu...') : (lang === 'de' ? 'Speichern' : 'Lưu')}
                </button>
              </div>
              {errorMsg && (
                <div className="text-xs font-bold text-rose-700 bg-rose-100 border border-rose-300 px-3 py-1 rounded-lg">
                  {errorMsg}
                </div>
              )}
            </div>
          ) : (
            <div className="group mt-1 flex min-w-0 flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="max-w-full break-words border-b-2 border-amber-600 px-2 pb-1 font-serif text-2xl font-black tracking-wide text-amber-950 sm:px-4 sm:text-5xl">
                {player.name || (lang === 'de' ? 'Leo der Fuchs' : 'Cáo Leo')}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold px-2 py-1 rounded-lg print:hidden cursor-pointer"
                title={lang === 'de' ? 'Name ändern' : 'Đổi tên'}
              >
                ✏️ {lang === 'de' ? 'Ändern' : 'Đổi tên'}
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
        <div className="my-4 grid grid-cols-2 gap-2 sm:my-6 sm:grid-cols-5 sm:gap-2.5">
          {masteredGames.map((game) => (
            <div key={game.title} className="flex min-w-0 flex-col items-center rounded-xl border border-amber-200 bg-white/90 p-2 text-center shadow-sm sm:p-2.5">
              <span className="mb-1 text-xl sm:text-2xl">{game.icon}</span>
              <span className="break-words text-xs font-bold text-amber-950">{game.title}</span>
              <span className="mt-0.5 text-[10px] text-amber-700">{game.detail}</span>
              <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
            </div>
          ))}
        </div>

        {/* Stats & Seal Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-amber-300 pt-4 sm:flex-row sm:gap-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-xl text-amber-900 border-2 border-amber-400">
              ⭐
            </div>
            <div>
              <div className="text-xs text-amber-800 font-bold uppercase">
                {lang === 'de' ? 'Sterne gesammelt' : 'Sao đã tích luỹ'}
              </div>
              <div className="text-lg font-black text-amber-950 font-['Fredoka']">
                {player.stars} {lang === 'de' ? 'Sternstunden' : 'Sao vàng'}
              </div>
            </div>
          </div>

          {/* Date & Signature */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-center sm:gap-8">
            <div>
              <div className="text-xs text-amber-800 font-semibold mb-1">
                {lang === 'de' ? 'Datum:' : 'Ngày cấp:'}
              </div>
              <div className="text-sm font-bold text-amber-950 border-b border-amber-400 pb-0.5 px-3">
                {today}
              </div>
            </div>

            <div>
              <div className="text-xs text-amber-800 font-semibold mb-1">
                {lang === 'de' ? 'Unterschrift Lehrkraft / Eltern:' : 'Chữ ký Giáo viên / Phụ huynh:'}
              </div>
              <div className="w-36 h-7 border-b border-amber-800 italic text-amber-800 text-sm font-serif flex items-end justify-center">
                {lang === 'de' ? 'MatheHeld 3. Klasse' : 'Vua Toán Lớp 3'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
