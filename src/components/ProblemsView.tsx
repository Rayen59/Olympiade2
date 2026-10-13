import React, { useState, useMemo } from 'react';
import { Problem, User } from '../types';
import { OLYMPIAD_THEMES } from '../data/problemsData';
import { store } from '../services/store';
import { MathView } from './MathView';
import { ProblemSubmissionModal } from './ProblemSubmissionModal';
import { CheckCircle2, Clock, XCircle, Send } from 'lucide-react';

interface ProblemsViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ currentUser, onOpenAuth }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedPoints, setSelectedPoints] = useState<number | 'all'>('all');
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setTick] = useState(0);

  const problems = useMemo(() => {
    return store.getProblems(selectedTheme, selectedPoints);
  }, [selectedTheme, selectedPoints]);

  const userSubmissions = useMemo(() => {
    if (!currentUser) return {};
    const subs = store.getUserSubmissions(currentUser.id);
    const map: Record<string, typeof subs[0]> = {};
    subs.forEach((s) => {
      map[s.problemId] = s;
    });
    return map;
  }, [currentUser]);

  const handleOpenProblem = (p: Problem) => {
    setActiveProblem(p);
    setIsModalOpen(true);
  };

  const getPointsBadgeColor = (points: number) => {
    switch (points) {
      case 15:
        return 'bg-emerald-600';
      case 30:
        return 'bg-sky-600';
      case 45:
        return 'bg-blue-600';
      case 60:
        return 'bg-indigo-600';
      case 75:
        return 'bg-rose-600';
      default:
        return 'bg-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-[#0a3d75]">
          📘 Banque Officielle de Problèmes Olympiques
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Problèmes classés de 15 à 75 points par thématique : Théorie des Nombres, Géométrie, Combinatoire, Inégalités et Équations Fonctionnelles.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
        {/* Theme Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Thème :</span>
          <button
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedTheme === 'all'
                ? 'bg-[#0056b3] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          {OLYMPIAD_THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedTheme === theme
                  ? 'bg-[#0056b3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Points Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Points :</span>
          <button
            onClick={() => setSelectedPoints('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedPoints === 'all'
                ? 'bg-[#0056b3] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          {[15, 30, 45, 60, 75].map((pts) => (
            <button
              key={pts}
              onClick={() => setSelectedPoints(pts)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedPoints === pts
                  ? 'bg-[#0056b3] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {pts} pts
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-mono">
            {problems.length} problème(s) affiché(s)
          </span>
        </div>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problems.map((problem) => {
          const sub = userSubmissions[problem.id];
          return (
            <div
              key={problem.id}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4.5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#0056b3] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {problem.theme}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold text-white px-2 py-0.5 rounded shadow-2xs ${getPointsBadgeColor(
                      problem.points
                    )}`}
                  >
                    {problem.points} points
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-2">{problem.title}</h3>

                {/* Math Statement */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700 border-l-3 border-[#0056b3] mb-4">
                  <MathView content={problem.statement} />
                </div>
              </div>

              {/* Action and status */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {sub ? (
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {sub.status === 'approved' ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Validé (+{sub.points} pts)
                        </span>
                      ) : sub.status === 'rejected' ? (
                        <span className="text-rose-700 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Refusé
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> En attente de correction
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Non soumis</span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenProblem(problem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0056b3] hover:bg-[#0a3d75] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sub ? 'Gérer ma Copie' : 'Soumettre'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ProblemSubmissionModal
        problem={activeProblem}
        currentUser={currentUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={() => setTick((t) => t + 1)}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
