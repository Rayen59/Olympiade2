import React from 'react';
import { X, Award, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface MemorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemorialModal: React.FC<MemorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-[#0056b3] text-white text-xs font-black px-2 py-0.5 rounded">MK</div>
            <h2 className="text-sm font-bold text-slate-900">
              Mémorial Assil Hamdi pour les Mathématiques Avancées
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#0056b3] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Dédicace & Hommage Perpétuel</span>
            </div>
            <p>
              Ce portail académique commémoratif est dédié avec profond respect à la mémoire d'<strong>Assil Hamdi</strong>,
              pour perpétuer la passion de la rigueur mathématique pure, l'élévation intellectuelle et la fraternité olympienne.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              Mission Académique MK Olympiades
            </h3>
            <p>
              La plateforme a pour vocation d'offrir aux étudiants, olympiens et passionnés des ressources de haut niveau :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Banque d'exercices d'olympiades de 15 à 75 points avec correction rigoureuse.</li>
              <li>Sessions d'examens officielles chronométrées avec sujets PDF originaux.</li>
              <li>Cours fondamentaux en théorie des nombres, géométrie pure, combinatoire, inégalités et équations fonctionnelles.</li>
              <li>Forum communautaire avec rendu mathématique KaTeX en direct ($...$) et modération éthique.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Confidentialité & Déontologie
            </h3>
            <p className="text-slate-500">
              Les travaux et polycopies déposés sont strictement réservés à l'évaluation académique par le jury. Aucun compte virtuel ou artificiel n'est injecté pour préserver l'authenticité absolue des classements.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
            <span>Version React SPA 2.0 • MK Foundation</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#0056b3] text-white font-bold rounded-md hover:bg-[#0a3d75] transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
