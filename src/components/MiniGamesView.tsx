import React, { useState, useEffect } from 'react';
import { Gamepad2, RotateCcw, Trophy, CheckCircle2, Zap } from 'lucide-react';

export const MiniGamesView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'puzzle' | 'speed'>('puzzle');

  // ================= 1. 15-PUZZLE NUMBER GRID (play1.html) =================
  const [grid, setGrid] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);

  const initPuzzle = () => {
    // Generate numbers 1 to 15, and 0 for empty space
    const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
    numbers.push(0);

    // Shuffle with a solvable configuration
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    setGrid(numbers);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initPuzzle();
  }, []);

  const handleTileClick = (index: number) => {
    if (isWon) return;
    const emptyIndex = grid.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newGrid = [...grid];
      [newGrid[index], newGrid[emptyIndex]] = [newGrid[emptyIndex], newGrid[index]];
      setGrid(newGrid);
      setMoves((m) => m + 1);

      // Check win condition (1..15, 0)
      const won = newGrid.slice(0, 15).every((val, i) => val === i + 1) && newGrid[15] === 0;
      if (won) setIsWon(true);
    }
  };

  // ================= 2. MATH SPEED CHALLENGE (game2.html) =================
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedTimer, setSpeedTimer] = useState<number>(30);
  const [speedGameActive, setSpeedGameActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: number; choices: number[] }>({
    q: '7 × 8',
    a: 56,
    choices: [48, 54, 56, 64]
  });
  const [speedFeedback, setSpeedFeedback] = useState<string | null>(null);

  const generateSpeedQuestion = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 20) + 2;
    let n2 = Math.floor(Math.random() * 20) + 2;
    let ans = 0;

    if (op === '+') {
      ans = n1 + n2;
    } else if (op === '-') {
      if (n1 < n2) [n1, n2] = [n2, n1];
      ans = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 12) + 2;
      n2 = Math.floor(Math.random() * 12) + 2;
      ans = n1 * n2;
    }

    const wrong1 = ans + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = ans + (Math.random() > 0.5 ? 5 : -5);
    const wrong3 = ans + (Math.random() > 0.5 ? 10 : -10);
    const set = Array.from(new Set([ans, wrong1, wrong2, wrong3]));
    while (set.length < 4) set.push(ans + set.length * 3);
    set.sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      q: `${n1} ${op} ${n2}`,
      a: ans,
      choices: set
    });
  };

  const startSpeedGame = () => {
    setSpeedScore(0);
    setSpeedTimer(30);
    setSpeedGameActive(true);
    setSpeedFeedback(null);
    generateSpeedQuestion();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (speedGameActive && speedTimer > 0) {
      interval = setInterval(() => {
        setSpeedTimer((t) => t - 1);
      }, 1000);
    } else if (speedTimer === 0 && speedGameActive) {
      setSpeedGameActive(false);
    }
    return () => clearInterval(interval);
  }, [speedGameActive, speedTimer]);

  const handleAnswerSpeed = (choice: number) => {
    if (!speedGameActive) return;
    if (choice === currentQuestion.a) {
      setSpeedScore((s) => s + 10);
      setSpeedFeedback('Bravo ! +10 pts');
      generateSpeedQuestion();
    } else {
      setSpeedFeedback('Erreur !');
      setSpeedScore((s) => Math.max(0, s - 5));
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0a3d75] flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            Espace Ludique & Défis Mathématiques
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Entraînement de l'esprit logique et du calcul mental rapide entre deux sessions d'olympiades.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveGame('puzzle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeGame === 'puzzle'
                ? 'bg-[#0056b3] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🧩 15-Puzzle Glissant
          </button>
          <button
            onClick={() => setActiveGame('speed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeGame === 'speed'
                ? 'bg-[#0056b3] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⚡ Défi Vitesse Arithmétique
          </button>
        </div>
      </div>

      {/* GAME 1: 15-PUZZLE */}
      {activeGame === 'puzzle' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-sm mb-4">
            <span className="text-xs font-bold text-slate-600">
              Déplacements : <strong className="text-blue-700 font-mono text-sm">{moves}</strong>
            </span>
            <button
              onClick={initPuzzle}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recommencer
            </button>
          </div>

          {isWon && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-bounce">
              <Trophy className="w-5 h-5 text-amber-500" />
              Félicitations ! Vous avez résolu la grille en {moves} coups !
            </div>
          )}

          {/* 4x4 Grid */}
          <div className="grid grid-cols-4 gap-2 bg-slate-800 p-3 rounded-2xl shadow-xl w-full max-w-xs aspect-square">
            {grid.map((num, idx) => {
              const isEmpty = num === 0;
              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={isEmpty || isWon}
                  className={`rounded-xl font-black text-lg sm:text-xl flex items-center justify-center transition active:scale-95 shadow-md ${
                    isEmpty
                      ? 'bg-transparent cursor-default'
                      : 'bg-gradient-to-br from-blue-500 to-[#0056b3] text-white hover:from-blue-400 hover:to-blue-600 cursor-pointer'
                  }`}
                >
                  {!isEmpty && num}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Cliquez sur une case adjacente à la case vide pour la faire glisser et ordonner les chiffres de 1 à 15.
          </p>
        </div>
      )}

      {/* GAME 2: SPEED MATH */}
      {activeGame === 'speed' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-sm mb-4">
            <span className="text-xs font-bold text-slate-600">
              Temps restant :{' '}
              <strong className="text-rose-600 font-mono text-base">{speedTimer}s</strong>
            </span>
            <span className="text-xs font-bold text-slate-600">
              Score : <strong className="text-emerald-700 font-mono text-base">{speedScore} pts</strong>
            </span>
          </div>

          {!speedGameActive && speedTimer === 30 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Sprint de Calcul Mental (30 secondes)</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Résolvez le maximum d'opérations arithmétiques avant la fin du temps imparti.
              </p>
              <button
                onClick={startSpeedGame}
                className="px-6 py-2 bg-[#0056b3] hover:bg-[#0a3d75] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Lancer le Sprint
              </button>
            </div>
          ) : !speedGameActive && speedTimer === 0 ? (
            <div className="text-center py-6 space-y-3">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="font-black text-base text-slate-900">Temps Écoulé !</h3>
              <p className="text-sm font-extrabold text-blue-700">Votre score final : {speedScore} points</p>
              <button
                onClick={startSpeedGame}
                className="px-5 py-2 bg-[#0056b3] hover:bg-[#0a3d75] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Rejouer
              </button>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-6 text-center shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Calculez :</span>
                <span className="text-3xl font-black font-mono tracking-wider">{currentQuestion.q}</span>
              </div>

              {speedFeedback && (
                <div
                  className={`text-center text-xs font-bold py-1 ${
                    speedFeedback.startsWith('Bravo') ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {speedFeedback}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSpeed(choice)}
                    className="p-3.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-900 border border-slate-200 rounded-xl text-base font-extrabold font-mono transition active:scale-95"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
