import React from 'react';
import { X, BookOpen, Clock, Users, Lightbulb, CheckCircle2, Sparkles, Printer } from 'lucide-react';
import { TEACHER_PEDAGOGICAL_GUIDE } from '../../math/minecraftCurriculum';
import { Language } from '../../types/game';
import { sound } from '../../audio/soundManager';

interface TeacherGuideModalProps {
  lang: Language;
  onClose: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ lang, onClose }) => {
  const guide = TEACHER_PEDAGOGICAL_GUIDE[lang];

  const handlePrint = () => {
    sound.playCoin();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-3 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-['Nunito',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-emerald-900/80 via-teal-900/70 to-slate-900 border-b border-emerald-500/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-inner">
              🎓
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Fredoka']">
                {guide.title}
              </h2>
              <p className="text-xs text-emerald-300 font-bold">
                {lang === 'de' ? 'Didaktisches Konzept & Unterrichtsplanung' : 'Giáo án & Phương pháp sư phạm Toán Lớp 3'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow"
              title="In giáo án / Print"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'de' ? 'Drucken' : 'In / Lưu'}</span>
            </button>

            <button
              onClick={() => {
                sound.playJump();
                onClose();
              }}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm">
          {/* Pedagogical Philosophy Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-800/80 border border-emerald-500/30 flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-emerald-100 font-medium leading-relaxed">
              {guide.intro}
            </p>
          </div>

          {/* 5 Core Curriculum Modules */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-amber-400 font-['Fredoka'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{lang === 'de' ? '5 Unterrichts-Bausteine' : '5 Chuyên Đề Bài Học Chuẩn Lớp 3'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guide.modules.map((m) => (
                <div
                  key={m.num}
                  className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-emerald-400/50 transition-colors shadow-lg"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-black font-black flex items-center justify-center text-xs">
                      #{m.num}
                    </span>
                    <h4 className="font-extrabold text-white text-sm">
                      {m.name}
                    </h4>
                  </div>

                  <p className="text-xs text-emerald-300 font-bold mb-2">
                    {m.method}
                  </p>

                  <ul className="space-y-1.5">
                    {m.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Teachers & Parents Pro-Tips */}
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-amber-500/30">
            <h4 className="font-black text-amber-300 text-base font-['Fredoka'] mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>{lang === 'de' ? 'Tipps für Lehrkräfte & Eltern' : 'Mẹo Triển Khai Cho Giáo Viên & Phụ Huynh'}</span>
            </h4>

            <div className="space-y-2">
              {guide.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>15m lý thuyết ➔ 20m thực hành ➔ 5m tổng kết</span>
          </div>

          <button
            onClick={() => {
              sound.playJump();
              onClose();
            }}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg transition"
          >
            {lang === 'de' ? 'Verstanden & Loslegen' : 'Đã hiểu & Bắt đầu học'}
          </button>
        </div>
      </div>
    </div>
  );
};
