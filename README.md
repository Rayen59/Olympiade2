# Mémorial Assil Hamdi pour les Mathématiques Avancées (MK Olympiades)

Portail académique commémoratif dédié à la mémoire d'Assil Hamdi pour la diffusion des mathématiques pures, l'entraînement aux olympiades internationales, les cours approfondis et les défis intellectuels.

## Architecture

Application monopage moderne développée avec **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4** et le moteur mathématique **KaTeX**.

### Fonctionnalités Clés

1. **Banque de Problèmes d'Olympiades (15 à 75 Points)**
   - Classement par thématiques : Théorie des Nombres, Géométrie, Combinatoire, Inégalités, Équations Fonctionnelles.
   - Rendu mathématique KaTeX pour tous les énoncés et formules.
   - Dépôt de copies polycopies manuscrites et/ou rédaction directe en code LaTeX ($...$).
   - Prise en charge des soumissions avec images seules, texte seul, ou les deux.
   - Visionneuse haute résolution avec zoom interactif (+ / - / molette / glisser-déplacer / rotation 90°), optimisée pour ordinateur de bureau (PC) et mobile.

2. **Olympiades Mathématiques Officielles MK**
   - Épreuves chronométrées avec décompte officiel (HH:MM:SS).
   - Verrouillage automatique des soumissions à la fin du temps imparti afin de garantir l'équité des épreuves.
   - Téléchargement du sujet officiel en format PDF.
   - Les candidats voient uniquement le titre, la description, le nombre de problèmes et la durée officielle durant l'épreuve.
   - Barèmes minimaux de médailles (Or, Argent, Bronze, Mention Honorable) fixés et révélés par le jury après correction.
   - Palmarès et classement final verrouillables pendant les délibérations.

3. **Cours Théoriques Isolés**
   - Corpus théorique structuré avec démonstrations intégrales :
     - Valuations p-adiques, Formule de Legendre, Lemme LTE, Arithmétique modulaire.
     - Cocyclicité, Droite de Simson, Axe radical, Théorème de Ptolémée.
     - Principe des tiroirs de Dirichlet, Invariants et monovariants, Double comptage.
     - Inégalités classiques (AM-GM, Cauchy-Schwarz, Forme de Titu, Jensen).
     - Équations fonctionnelles de Cauchy, substitutions et symétries.

4. **Forum Mathématique Communautaire**
   - Discussions classées par thèmes avec rendu des formules LaTeX ($...$, $$...$$).
   - Option **Visualiser le LaTeX** en direct avant envoi pour valider le code mathématique.
   - Possibilité de joindre des images ou schémas géométriques dans les sujets et les réponses.
   - Agrandissement des images du forum avec la visionneuse zoom plein écran.
   - Modération déontologique et académique intégrée.

5. **Classement Général & Profils**
   - Classement authentique et vérifié des olympiens basé sur les points réels attribués.
   - Profil personnel avec récapitulatif des copies déposées, appréciations du jury et distinctions obtenues.
   - Navigation fluide avec historique de retour fiable ("Retour" vers la vue précédente, y compris depuis le profil).

6. **Espace Ludique & Défis**
   - *15-Puzzle* (grille glissante numérique).
   - Sprint de calcul mental arithmétique chronométré en 30 secondes.

7. **Panneau d'Administration MK**
   - Gestion et création de sessions d'olympiades.
   - Correction détaillée par problème ($P_1, P_2, \dots$) avec saisie des notes et commentaires du jury.
   - Réglage post-correction des seuils de médailles et publication officielle du palmarès.
   - Validation des copies de problèmes et attribution des points.
   - Gestion disciplinaire et suspensions de comptes.

## Démarrage

```bash
npm install
npm run dev
```

L'application écoute sur `http://0.0.0.0:3000`.
