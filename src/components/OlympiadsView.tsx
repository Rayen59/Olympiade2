import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Olympiad, OlympiadSubmission, User } from '../types';
import { store } from '../services/store';
import { ImageModal } from './ImageModal';
import { MathView } from './MathView';
import {
  Award,
  Clock,
  FileDown,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Maximize2,
  Trash2,
  Play,
  Eye,
  EyeOff,
  Trophy,
  FileText
} from 'lucide-react';

interface OlympiadsViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const OlympiadsView: React.FC<OlympiadsViewProps> = ({ currentUser, onOpenAuth, onOpenAdmin }) => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>(() => store.getOlympiads());
  const [selectedOlyId, setSelectedOlyId] = useState<string>(() => {
    const list = store.getOlympiads();
    return list[0]?.id || '';
  });
  const [mySubmission, setMySubmission] = useState<OlympiadSubmission | null>(null);

  // Exam Countdown Timer State
  const [examStartTime, setExamStartTime] = useState<number | null>(() => {
    const active = store.getOlympiads()[0];
    if (active && currentUser) {
      return store.getExamStartTime(active.id, currentUser.id);
    }
    return null;
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [examStartedNotification, setExamStartedNotification] = useState(false);

  // Candidate Submission Form State
  const [images, setImages] = useState<string[]>([]);
  const [solutionNotes, setSolutionNotes] = useState('');
  const [showLatexPreview, setShowLatexPreview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Zoom Lightbox
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  // Memoized Active Olympiad
  const activeOly = useMemo(() => {
    return (selectedOlyId ? olympiads.find((o) => o.id === selectedOlyId) : olympiads[0]) || olympiads[0];
  }, [olympiads, selectedOlyId]);

  // Refresh data on store updates
  const reloadData = useCallback(() => {
    const list = store.getOlympiads();
    setOlympiads(list);
    const activeId = selectedOlyId || list[0]?.id || '';
    if (activeId && currentUser) {
      const sub = store.getMyOlympiadSubmission(activeId, currentUser.id);
      setMySubmission(sub);
      const st = store.getExamStartTime(activeId, currentUser.id);
      setExamStartTime(st);
    }
  }, [currentUser, selectedOlyId]);

  useEffect(() => {
    reloadData();
    return store.subscribe(reloadData);
  }, [reloadData]);

  // Synchronize submission state when active Olympiad or user changes
  useEffect(() => {
    if (activeOly && currentUser) {
      const sub = store.getMyOlympiadSubmission(activeOly.id, currentUser.id);
      setMySubmission(sub);
      if (sub) {
        setImages(sub.images || []);
        setSolutionNotes(sub.solutionNotes || '');
      } else {
        setImages([]);
        setSolutionNotes('');
      }
      const st = store.getExamStartTime(activeOly.id, currentUser.id);
      setExamStartTime(st);
    } else {
      setMySubmission(null);
      setImages([]);
      setSolutionNotes('');
      setExamStartTime(null);
    }
  }, [activeOly?.id, currentUser?.id]);

  // Countdown Interval Effect using primitive dependencies
  useEffect(() => {
    if (!activeOly || !examStartTime) {
      setSecondsRemaining(null);
      return;
    }

    const totalSeconds = (activeOly.totalDurationMinutes || 240) * 60;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - examStartTime) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [examStartTime, activeOly?.id, activeOly?.totalDurationMinutes]);

  const isExamTimeExpired = secondsRemaining !== null && secondsRemaining <= 0;

  // Requirement: "Le chronomètre commence automatique après le téléchargement de olympiade"
  const handleDownloadAndStartExam = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeOly) return;

    // Start timer automatically if not started
    if (!examStartTime) {
      const st = store.startExam(activeOly.id, currentUser.id);
      setExamStartTime(st);
      setExamStartedNotification(true);
    }

    // Trigger PDF download
    const link = document.createElement('a');
    link.href = activeOly.pdfUrl;
    link.download = activeOly.pdfTitle || 'Sujet_Officiel_Olympiade_MK.pdf';
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartExam = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!activeOly) return;
    const st = store.startExam(activeOly.id, currentUser.id);
    setExamStartTime(st);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenZoom = (index: number) => {
    setZoomImageIndex(index);
    setZoomModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!activeOly) return;

    // Requirement: locked when timer reaches 0
    if (isExamTimeExpired) {
      setSubmitError('Le temps officiel est terminé. Vous ne pouvez plus envoyer de copie pour cette épreuve.');
      return;
    }

    const res = store.submitOlympiadCopies(activeOly.id, currentUser, {
      images,
      solutionNotes
    });

    if (res.error) {
      setSubmitError(res.error);
    } else {
      setSubmitSuccess('Vos copies ont été transmises au jury officiel avec succès !');
      setMySubmission(res.submission || null);
    }
  };

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const leaderboardData = activeOly ? store.getOlympiadLeaderboard(activeOly.id) : { locked: true, rankings: [] };

  return (
    <div className="space-y-5">
      {/* Sessions Selector Tabs */}
      {olympiads.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {olympiads.map((oly) => (
            <button
              key={oly.id}
              onClick={() => {
                setSelectedOlyId(oly.id);
                setSubmitError(null);
                setSubmitSuccess(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition whitespace-nowrap ${
                activeOly?.id === oly.id
                  ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {oly.title}
            </button>
          ))}
        </div>
      )}

      {activeOly && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Olympiad Header Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-[#0056b3] text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                Session Officielle MK
              </span>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1 rounded backdrop-blur transition"
                >
                  ⚙️ Gérer cette olympiade & Délibérations
                </button>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black mb-2">{activeOly.title}</h1>

            {/* Requirement: User ONLY sees title, description, problem count and hours */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl mb-4">
              {activeOly.description}
            </p>

            {/* Crucial Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-300 font-bold uppercase">Durée officielle</span>
                <span className="text-sm font-extrabold">
                  {activeOly.durationHours}h{activeOly.durationMinutes > 0 ? `${activeOly.durationMinutes}min` : ''}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-300 font-bold uppercase">Nombre de problèmes</span>
                <span className="text-sm font-extrabold">{activeOly.problemCount} Problèmes</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-300 font-bold uppercase">Points par problème</span>
                <span className="text-sm font-extrabold">{activeOly.pointsPerProblem} pts</span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-300 font-bold uppercase">Sujet officiel PDF</span>
                <button
                  onClick={handleDownloadAndStartExam}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 underline mt-0.5 cursor-pointer text-left"
                  title="Télécharger le sujet (active automatiquement le chronomètre)"
                >
                  <FileDown className="w-3.5 h-3.5 shrink-0" />
                  <span>Télécharger PDF</span>
                </button>
                {!examStartTime && (
                  <span className="block text-[9px] text-amber-300/90 font-medium mt-0.5">
                    ⏱️ Démarre auto le chrono
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Notification Banner when started upon download */}
            {examStartedNotification && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Sujet officiel téléchargé !</span> Le chronomètre de{' '}
                    <strong>{activeOly.durationHours}h</strong> a commencé automatiquement. Vous pouvez composer et déposer votre copie avant la fin du temps imparti.
                  </div>
                </div>
                <button
                  onClick={() => setExamStartedNotification(false)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-1 rounded hover:bg-emerald-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ================= COUNTDOWN TIMER SECTION ================= */}
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Chronomètre d'Épreuve Officielle
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {examStartTime
                    ? isExamTimeExpired
                      ? 'L’épreuve est terminée. Le chronomètre est expiré.'
                      : 'Le chronomètre décompte le temps restant pour rédiger et téléverser vos copies.'
                    : 'Le chronomètre commence automatiquement dès le téléchargement du sujet officiel de l’olympiade.'}
                </p>
              </div>

              <div>
                {examStartTime ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div
                      className={`font-mono text-xl sm:text-2xl font-black px-4 py-1.5 rounded-lg border shadow-inner ${
                        isExamTimeExpired
                          ? 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse'
                          : secondsRemaining && secondsRemaining < 900
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-slate-900 text-white border-slate-800'
                      }`}
                    >
                      {secondsRemaining !== null ? formatTimer(secondsRemaining) : '--:--:--'}
                    </div>

                    {isExamTimeExpired ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Temps Écoulé
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> En cours
                      </span>
                    )}

                    <button
                      onClick={handleDownloadAndStartExam}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0056b3] hover:text-[#0a3d75] underline cursor-pointer ml-1"
                      title="Re-télécharger le fichier du sujet"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Re-télécharger PDF
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <button
                      onClick={handleDownloadAndStartExam}
                      className="inline-flex items-center gap-2 bg-[#0056b3] hover:bg-[#0a3d75] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-xs hover:shadow-md transition cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      Télécharger le Sujet & Démarrer le Chronomètre
                    </button>
                    <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                      (Démarrage automatique)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ================= PERSONAL SUBMISSION & STATUS ================= */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0a3d75] flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Dépôt de Copies et Évaluation Personnelle
                </h3>
                {mySubmission && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded ${
                      mySubmission.status === 'graded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {mySubmission.status === 'graded' ? '✓ Copie Notée par le Jury' : '⏳ Copie Reçue (En correction)'}
                  </span>
                )}
              </div>

              {/* Candidate Graded Results Card */}
              {mySubmission && mySubmission.status === 'graded' && (
                <div className="mb-5 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800">Note Officielle :</span>
                      <p className="text-lg font-black text-emerald-950">
                        {mySubmission.overallScore} / {activeOly.totalPoints} points
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-800">Distinction :</span>
                      <p className="text-base font-extrabold text-emerald-950">
                        {/* Requirement: Medals revealed only after correction/results published */}
                        {activeOly.resultsPublished || currentUser?.role === 'admin'
                          ? mySubmission.medal
                          : 'Note validée (Médailles officielles en attente de délibération)'}
                      </p>
                    </div>
                  </div>

                  {/* Problem Scores Breakdown */}
                  <div>
                    <span className="font-bold text-emerald-900 block mb-1.5">Détail des notes par problème :</span>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: activeOly.problemCount }).map((_, i) => {
                        const key = `P${i + 1}`;
                        const score = mySubmission.problemScores?.[key] ?? 0;
                        return (
                          <div
                            key={key}
                            className="bg-white border border-emerald-200 rounded-md px-3 py-1 text-center shadow-2xs"
                          >
                            <span className="block text-[10px] text-slate-500 font-bold">Problème {i + 1}</span>
                            <span className="font-extrabold text-emerald-800">
                              {score} / {activeOly.pointsPerProblem} pts
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {mySubmission.feedback && (
                    <div className="pt-2 border-t border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-0.5">Appréciation du jury :</span>
                      <p className="text-slate-700 italic">{mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Requirement: User can submit images ONLY, or LaTeX text ONLY, or BOTH */}
              {isExamTimeExpired ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-bold block text-sm">Temps officiel écoulé !</span>
                    <p className="mt-0.5">
                      L'épreuve est terminée et le chronomètre est à zéro. Le formulaire de soumission est verrouillé
                      afin de garantir l'équité sportive et académique.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitSuccess}</span>
                    </div>
                  )}

                  {/* Polycopies Upload (Optional if text provided) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        Photos / Scans des Copies Manuscrites
                      </label>
                      <span className="text-[11px] text-slate-400">
                        (Images seules OU texte LaTeX seul acceptés)
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                      <input
                        type="file"
                        id="oly-images-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="oly-images-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md shadow-xs text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-400 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Ajouter des photos de vos feuilles d'examen
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Cliquez sur une photo pour l'ouvrir dans la visionneuse avec zoom haute résolution.
                      </p>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative border border-slate-200 rounded-md overflow-hidden bg-slate-100 aspect-4/3 flex items-center justify-center"
                          >
                            <img
                              src={img}
                              alt={`Page ${idx + 1}`}
                              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                              onClick={() => handleOpenZoom(idx)}
                            />
                            <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              p.{idx + 1}
                            </span>
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition">
                              <button
                                type="button"
                                onClick={() => handleOpenZoom(idx)}
                                className="p-1.5 bg-white text-slate-900 rounded-full shadow hover:bg-slate-100 transition"
                                title="Agrandir et zoomer (PC & mobile)"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1.5 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition"
                                title="Supprimer cette page"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LaTeX or text solution notes (Optional if images provided) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Rédaction LaTeX de vos solutions
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLatexPreview(!showLatexPreview)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition"
                      >
                        {showLatexPreview ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Masquer la prévisualisation
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Visualiser le LaTeX ($...$)
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      rows={showLatexPreview ? 4 : 5}
                      value={solutionNotes}
                      onChange={(e) => setSolutionNotes(e.target.value)}
                      placeholder="Vous pouvez rédiger vos réponses ou démonstrations en LaTeX ici (ex: P1: soit $x, y \in \mathbb{N}$...)"
                      className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                    />

                    {showLatexPreview && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Aperçu LaTeX en direct :
                        </span>
                        {solutionNotes.trim() ? (
                          <MathView content={solutionNotes} className="text-xs bg-white p-2.5 rounded border border-slate-200" />
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Tapez du texte ou du LaTeX pour voir le rendu mathématique ici.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {images.length > 0 && solutionNotes.trim()
                        ? `${images.length} image(s) + rédaction LaTeX.`
                        : images.length > 0
                        ? `${images.length} page(s) de copies manuscrites.`
                        : solutionNotes.trim()
                        ? 'Rédaction LaTeX prête.'
                        : 'Téléversez des photos OU rédigez en LaTeX.'}
                    </span>

                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-[#0056b3] hover:bg-[#0a3d75] rounded-lg shadow-xs transition cursor-pointer"
                    >
                      {mySubmission ? 'Mettre à jour mes Copies' : 'Transmettre mes Copies au Jury'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ================= FINAL RANKING & MEDALS LEADERBOARD ================= */}
            {/* Requirement: Medal cutoffs only visible after correction/results publication */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Palmarès & Classement Officiel de l'Olympiade
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Résultats de la session avec médailles d'Or, Argent, Bronze et Mentions Honorables.
                  </p>
                </div>
              </div>

              {leaderboardData.locked && currentUser?.role !== 'admin' ? (
                <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                  <Lock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-amber-900 mb-1">
                    Délibérations du Jury en Cours
                  </h4>
                  <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                    Les corrections et délibérations officielles sont en cours. Les barèmes minimaux de médailles et le
                    classement final seront rendus publics dès la clôture des notations par l'administrateur.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Medal Cutoffs Banner (shown once results are published) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <span className="block text-[10px] uppercase font-bold text-amber-800">🥇 Or (Gold)</span>
                      <span className="font-extrabold text-amber-950">≥ {activeOly.goldCutoff} pts</span>
                    </div>
                    <div className="bg-slate-100 border border-slate-300 rounded-lg p-2.5">
                      <span className="block text-[10px] uppercase font-bold text-slate-700">🥈 Argent (Silver)</span>
                      <span className="font-extrabold text-slate-900">≥ {activeOly.silverCutoff} pts</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                      <span className="block text-[10px] uppercase font-bold text-orange-800">🥉 Bronze</span>
                      <span className="font-extrabold text-orange-950">≥ {activeOly.bronzeCutoff} pts</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <span className="block text-[10px] uppercase font-bold text-blue-800">🎖️ Mention</span>
                      <span className="font-extrabold text-blue-950">≥ {activeOly.honorableMentionCutoff} pts</span>
                    </div>
                  </div>

                  {leaderboardData.rankings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      Aucune copie corrigée pour le moment.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-14">Rang</th>
                            <th className="p-2.5">Candidat</th>
                            <th className="p-2.5">Distinction</th>
                            <th className="p-2.5 text-right">Note Totale</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leaderboardData.rankings.map((cand, idx) => (
                            <tr key={cand.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-2.5 font-bold font-mono text-slate-700">
                                {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                              </td>
                              <td className="p-2.5 font-semibold text-slate-900">{cand.username}</td>
                              <td className="p-2.5 font-bold">{cand.medal}</td>
                              <td className="p-2.5 text-right font-black text-blue-700">
                                {cand.overallScore} / {activeOly.totalPoints} pts
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom for Olympiad copies */}
      <ImageModal
        images={images}
        initialIndex={zoomImageIndex}
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        title={`Copie d'examen - ${activeOly?.title || 'Olympiade MK'}`}
      />
    </div>
  );
};
