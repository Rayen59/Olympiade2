import React, { useState, useMemo, useEffect } from 'react';
import { Problem, User, OlympiadTheme } from '../types';
import { OLYMPIAD_THEMES } from '../data/problemsData';
import { store } from '../services/store';
import { MathView } from './MathView';
import { ProblemSubmissionModal } from './ProblemSubmissionModal';
import { ProblemEditorModal } from './ProblemEditorModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Plus,
  Edit3,
  Trash2,
  ShieldAlert
} from 'lucide-react';

interface ProblemsViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ProblemsView: React.FC<ProblemsViewProps> = ({ currentUser, onOpenAuth }) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [selectedPoints, setSelectedPoints] = useState<number | 'all'>('all');
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Admin state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [problemToEdit, setProblemToEdit] = useState<Problem | null>(null);
  const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    return store.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const problems = useMemo(() => {
    return store.getProblems(selectedTheme, selectedPoints);
  }, [selectedTheme, selectedPoints, tick]);

  const userSubmissions = useMemo(() => {
    if (!currentUser) return {};
    const subs = store.getUserSubmissions(currentUser.id);
    const map: Record<string, typeof subs[0]> = {};
    subs.forEach((s) => {
      map[s.problemId] = s;
    });
    return map;
  }, [currentUser, tick]);

  const handleOpenProblem = (p: Problem) => {
    setActiveProblem(p);
    setIsModalOpen(true);
  };

  const handleCreateProblem = () => {
    setProblemToEdit(null);
    setIsEditorOpen(true);
  };

  const handleEditProblem = (p: Problem, e: React.MouseEvent) => {
    e.stopPropagation();
    setProblemToEdit(p);
    setIsEditorOpen(true);
  };

  const handleDeletePrompt = (p: Problem, e: React.MouseEvent) => {
    e.stopPropagation();
    setProblemToDelete(p);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (problemToDelete) {
      store.deleteProblem(problemToDelete.id);
      setProblemToDelete(null);
      setTick((t) => t + 1);
    }
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

  const extractProblemNum = (id: string): string => {
    const parts = id.split('-');
    if (parts.length >= 2 && !isNaN(Number(parts[1]))) {
      return parts[1];
    }
    return '';
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0a3d75] flex items-center gap-2">
            <span>📘 Banque Officielle de Problèmes Olympiques</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Problèmes classés par thématique : Théorie des Nombres, Géométrie, Combinatoire, Inégalités et Équations Fonctionnelles.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleCreateProblem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Problème
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-[#0a3d75]">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#0056b3]" />
            <span>Mode Administrateur actif : Vous pouvez poster, modifier et supprimer des problèmes avec aperçu LaTeX en direct.</span>
          </div>
          <span className="font-bold text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
            {problems.length} problèmes enregistrés
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
        {/* Theme Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Thème :</span>
          <button
            onClick={() => setSelectedTheme('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
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
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
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
            className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
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
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
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
      {problems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          <p className="text-sm font-semibold">Aucun problème ne correspond aux critères sélectionnés.</p>
          {isAdmin && (
            <button
              onClick={handleCreateProblem}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0056b3] text-white text-xs font-bold rounded-lg hover:bg-[#0a3d75] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Créer un premier problème dans cette catégorie
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((problem) => {
            const sub = userSubmissions[problem.id];
            const numLabel = problem.problemNumber || extractProblemNum(problem.id);

            return (
              <div
                key={problem.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4.5 shadow-xs hover:shadow-md transition flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {numLabel && (
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          N° {numLabel}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-[#0056b3] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {problem.theme}
                      </span>
                    </div>

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
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Status for regular user */}
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

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => handleEditProblem(problem, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition cursor-pointer"
                          title="Modifier ce problème"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={(e) => handleDeletePrompt(problem, e)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition cursor-pointer"
                          title="Supprimer ce problème"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Supprimer</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleOpenProblem(problem)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0056b3] hover:bg-[#0a3d75] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sub ? 'Gérer ma Copie' : 'Soumettre'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Submission Modal */}
      <ProblemSubmissionModal
        problem={activeProblem}
        currentUser={currentUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={() => setTick((t) => t + 1)}
        onOpenAuth={onOpenAuth}
      />

      {/* Admin Problem Editor Modal */}
      <ProblemEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setProblemToEdit(null);
        }}
        problemToEdit={problemToEdit}
        defaultTheme={selectedTheme !== 'all' ? (selectedTheme as OlympiadTheme) : undefined}
        onSaved={() => {
          setTick((t) => t + 1);
        }}
      />

      {/* Admin Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProblemToDelete(null);
        }}
        problem={problemToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
