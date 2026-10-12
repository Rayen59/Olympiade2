export const OLYMPIAD_THEMES = [
  "Théorie des Nombres",
  "Géométrie",
  "Combinatoire",
  "Inégalités",
  "Équations Fonctionnelles"
];

export const INITIAL_PROBLEMS = [
  // ==========================================
  // 1. THÉORIE DES NOMBRES (Screenshots 5 & 6)
  // ==========================================
  {
    id: "nt-1",
    theme: "Théorie des Nombres",
    points: 15,
    difficulty: "15 pts",
    title: "Fraction irréductible (21n+4)/(14n+3)",
    statement: "Show that the fraction $\\frac{21n+4}{14n+3}$ is irreducible for all $n \\in \\mathbb{N}$.",
    hint: "Considérer le PGCD $d = \\gcd(21n+4, 14n+3)$ et éliminer $n$ : calculer $3(14n+3) - 2(21n+4)$."
  },
  {
    id: "nt-2",
    theme: "Théorie des Nombres",
    points: 15,
    difficulty: "15 pts",
    title: "Critère de divisibilité par 17",
    statement: "Prove the divisibility criterion by 17: The number $\\overline{a_n a_{n-1} \\dots a_1 a_0}$ is divisible by 17 if and only if the number $\\overline{a_n a_{n-1} \\dots a_1} - 5a_0$ is divisible by 17. (Example: $82858 \\to 8285 - 40 = 8245 \\to 824 - 25 = 799 \\to 79 - 45 = 34$, divisible by 17).",
    hint: "Écrire $N = 10M + a_0$. Remarquer que $10M + a_0 - 17a_0 = 10(M - 5a_0) + 34a_0$."
  },
  {
    id: "nt-3",
    theme: "Théorie des Nombres",
    points: 30,
    difficulty: "30 pts",
    title: "Nombres premiers p et p^2+8",
    statement: "Prove that if $p$ and $p^2+8$ are primes, then $p^3+8p+2$ is also prime.",
    hint: "Examiner $p \\pmod 3$. Si $p \\neq 3$, que vaut $p^2+8 \\pmod 3$ ?"
  },
  {
    id: "nt-4",
    theme: "Théorie des Nombres",
    points: 30,
    difficulty: "30 pts",
    title: "Multiples de 15 avec 15 diviseurs",
    statement: "How many natural numbers that are multiples of 15 have exactly 15 positive divisors?",
    hint: "La formule du nombre de diviseurs $d(n) = 15 = 3 \\times 5$ ou $15$. Décomposer $n = 3^a 5^b p^c$."
  },
  {
    id: "nt-5",
    theme: "Théorie des Nombres",
    points: 30,
    difficulty: "30 pts",
    title: "Équation diophantienne x^4 - y^2 = 17",
    statement: "Find all pairs of integers $(x, y)$ satisfying the equation $x^4 - y^2 = 17$.",
    hint: "Factoriser sous la forme $(x^2 - y)(x^2 + y) = 17$."
  },
  {
    id: "nt-6",
    theme: "Théorie des Nombres",
    points: 45,
    difficulty: "45 pts",
    title: "Reste de la division d'un premier par 30",
    statement: "Show that if a prime number $p$ is divided by 30, then the remainder is either 1 or a prime number. Is the same true when the divisor is 60 or 90?",
    hint: "Si le reste $r$ n'est ni 1 ni premier, il a un diviseur premier $q < 30$. Si $q \\mid 30$, alors $q \\mid p$."
  },
  {
    id: "nt-7",
    theme: "Théorie des Nombres",
    points: 45,
    difficulty: "45 pts",
    title: "Divisibilité par 24 de mn+1 et m+n",
    statement: "Let $m$ and $n$ be non-zero natural numbers such that $mn+1$ is divisible by 24. Show that $m+n$ is also divisible by 24.",
    hint: "Étudier les congruences modulo 3 et modulo 8. Remarquer que $m$ et $n$ doivent être premiers avec 2 et 3."
  },
  {
    id: "nt-8",
    theme: "Théorie des Nombres",
    points: 45,
    difficulty: "45 pts",
    title: "Infinité de copremiers a+s et b+s",
    statement: "Let $a$ and $b$ be distinct natural numbers. Show that there are infinitely many natural numbers $s$ such that $a+s$ and $b+s$ are coprime.",
    hint: "Remarquer que $\\gcd(a+s, b+s) = \\gcd(a+s, b-a)$. Choisir $a+s$ premier avec $b-a$."
  },
  {
    id: "nt-9",
    theme: "Théorie des Nombres",
    points: 45,
    difficulty: "45 pts",
    title: "Nombre composé avec 1994 '1' et un '7'",
    statement: "Give an example of a composite number whose decimal representation contains exactly 1994 digits '1' and one '7' (and no other digits).",
    hint: "Utiliser la divisibilité par 3 ou par 11 en plaçant judicieusement le 7."
  },
  {
    id: "nt-10",
    theme: "Théorie des Nombres",
    points: 60,
    difficulty: "60 pts",
    title: "Équation rationnelle x^2 + y^2 = 3",
    statement: "Show that there exist no $x, y \\in \\mathbb{Q}$ such that $x^2 + y^2 = 3$.",
    hint: "Poser $x = a/c, y = b/c$. Obtenir $a^2 + b^2 = 3c^2$ et utiliser la descente infinie modulo 3."
  },
  {
    id: "nt-11",
    theme: "Théorie des Nombres",
    points: 60,
    difficulty: "60 pts",
    title: "Nombres de Mersenne et Fermat",
    statement: "Let $n \\in \\mathbb{N}_0$. Show that if $2^n - 1$ is prime, then $n$ is prime. Show that if $2^n + 1$ is prime, then $n$ is a power of 2.",
    hint: "Factoriser $a^{km} - 1$ et utiliser la formule pour $a^m + 1$ lorsque $m$ est impair."
  },
  {
    id: "nt-12",
    theme: "Théorie des Nombres",
    points: 60,
    difficulty: "60 pts",
    title: "Reste de (7n)! / (7^n * n!) modulo 7",
    statement: "For every positive integer $n$, find the remainder when $\\frac{(7n)!}{7^n \\cdot n!}$ is divided by 7.",
    hint: "Regrouper les termes non multiples de 7 dans chaque bloc de 7 et appliquer le théorème de Wilson."
  },
  {
    id: "nt-13",
    theme: "Théorie des Nombres",
    points: 60,
    difficulty: "60 pts",
    title: "Divisibilité de 50^n + a * 23^n par 1971",
    statement: "Find the smallest positive integer $a$ such that 1971 divides $50^n + a \\cdot 23^n$ for every odd $n$.",
    hint: "Décomposer $1971 = 27 \\times 73$. Observer $50 \\equiv -23 \\pmod{73}$."
  },
  {
    id: "nt-14",
    theme: "Théorie des Nombres",
    points: 60,
    difficulty: "60 pts",
    title: "PGCD de p^8 - 1 pour p premier > 5",
    statement: "Determine the greatest common divisor of all numbers of the form $p^8 - 1$, where $p$ is a prime greater than 5.",
    hint: "Tester pour $p=7$ et $p=11$, et vérifier les facteurs 2, 3, 5, 17."
  },
  {
    id: "nt-15",
    theme: "Théorie des Nombres",
    points: 75,
    difficulty: "75 pts",
    title: "Nombre de paires avec gcd=5! et lcm=50!",
    statement: "Find the number of pairs of positive integers $x, y$ with $x \\le y$ such that $\\gcd(x, y) = 5!$ and $\\mathrm{lcm}(x, y) = 50!$.",
    hint: "Écrire les décompositions en facteurs premiers de $5!$ et $50!$ et compter les choix pour chaque exposant."
  },
  {
    id: "nt-16",
    theme: "Théorie des Nombres",
    points: 75,
    difficulty: "75 pts",
    title: "Démonstration du Théorème de Wilson",
    statement: "Prove Wilson's theorem: A number $p \\ge 2$ is prime if and only if $(p-1)! \\equiv -1 \\pmod p$.",
    hint: "Associer chaque élément de $(\\mathbb{Z}/p\\mathbb{Z})^*$ avec son inverse multiplicatif."
  },
  {
    id: "nt-17",
    theme: "Théorie des Nombres",
    points: 75,
    difficulty: "75 pts",
    title: "Carré parfait 2^(n-1) * n + 1",
    statement: "Determine all positive integers $n$ such that $2^{n-1} \\cdot n + 1$ is a perfect square.",
    hint: "Tester les petites valeurs $n=1, n=5$. Poser $2^{n-1}n = m^2 - 1 = (m-1)(m+1)$."
  },
  {
    id: "nt-18",
    theme: "Théorie des Nombres",
    points: 75,
    difficulty: "75 pts",
    title: "Diviseurs de 2^(p1*p2*...*pn) + 1",
    statement: "Let $p_1, p_2, \\dots, p_n$ be distinct prime numbers greater than 3. Show that $2^{p_1 p_2 \\dots p_n} + 1$ has at least $4^n$ divisors.",
    hint: "Utiliser la théorie des facteurs primitifs ou les polynômes cyclotomiques $\\Phi_d(2)$ pour chaque sous-ensemble d'indices."
  },

  // ==========================================
  // 2. GÉOMÉTRIE (Screenshots 7 & 8)
  // ==========================================
  {
    id: "geo-1",
    theme: "Géométrie",
    points: 30,
    difficulty: "30 pts",
    title: "Tangente, hauteurs et orthogonalité (OH) et (PR)",
    statement: "Let $\\triangle ABC$ be a triangle such that $AB \\neq AC$ and $\\angle BAC \\neq 90^\\circ$. Let $M$ and $N$ be the midpoints of segments $[AB]$ and $[AC]$, respectively. Let $E$ and $F$ be the feet of the altitudes from vertices $B$ and $C$, respectively. Let $O$ be the center of the circumcircle of triangle $ABC$ and let $H$ be the orthocenter of triangle $ABC$. The tangent to the circumcircle of triangle $ABC$ at $A$ intersects line $(MN)$ at point $P$. Let $Q$ be the second point of intersection of the circumcircles of triangles $ABC$ and $AEF$. Lines $(EF)$ and $(AQ)$ intersect at point $R$. Show that lines $(OH)$ and $(PR)$ are perpendicular.",
    hint: "Montrer que $P$ et $R$ ont même puissance par rapport aux cercles appropriés (axe radical)."
  },
  {
    id: "geo-2",
    theme: "Géométrie",
    points: 45,
    difficulty: "45 pts",
    title: "Intersection de (BQ) et du milieu de [EF]",
    statement: "Let $\\triangle ABC$ be a triangle, and let $E$ and $F$ be the feet of the altitudes from vertices $B$ and $C$, respectively. Let $P$ be the intersection point of the altitude from vertex $A$ with the circumcircle of triangle $ABC$. Line $(PE)$ intersects the circumcircle of triangle $ABC$ at point $Q$. Show that line $(BQ)$ intersects segment $[EF]$ at its midpoint.",
    hint: "Utiliser le quadrilatère inscriptible $BCEF$ et l'inversion ou le théorème de Pascal sur le cercle circonscrit."
  },
  {
    id: "geo-3",
    theme: "Géométrie",
    points: 45,
    difficulty: "45 pts",
    title: "Projection de l'incentre et cercle Gamma",
    statement: "Let $\\triangle ABC$ be a triangle, $I$ the center of its inscribed circle, and $\\Gamma$ its circumcircle. Let $M$ be the midpoint of segment $[BC]$. Let $D$ be the orthogonal projection of point $I$ onto segment $[BC]$. The perpendicular to line $(AI)$ passing through point $I$ intersects segment $[AB]$ at point $E$ and segment $[AC]$ at point $F$. Let $X$ be the second point of intersection of the circumcircles of triangles $ABC$ and $AEF$. Show that lines $(XD)$ and $(AM)$ intersect on the circle $\Gamma$.",
    hint: "Considérer le cercle podaire et les propriétés de la symédiane / point de contact avec le cercle incrit."
  },
  {
    id: "geo-4",
    theme: "Géométrie",
    points: 60,
    difficulty: "60 pts",
    title: "Symétrique de l'incentre I et cercle BDE",
    statement: "Let $\\triangle ABC$ be an isosceles triangle with vertex at $A$. Let $I$ be the center of its inscribed circle. Line $(BI)$ intersects line $(AC)$ at point $D$, and the line perpendicular to line $(AC)$ passing through $D$ intersects line $(AI)$ at point $E$. Show that the symmetrical point of $I$ with respect to line $(AC)$ belongs to the circumcircle of triangle $BDE$.",
    hint: "Chasse aux angles orientés en exploitant la bissectrice $(BI)$ et la hauteur $(AI)$."
  },
  {
    id: "geo-5",
    theme: "Géométrie",
    points: 60,
    difficulty: "60 pts",
    title: "Cercle tangent en A et bissectrices concourantes",
    statement: "Let $\\triangle ABC$ be a triangle with $\\angle CAB > \\angle ABC$. Let $I$ be the center of its inscribed circle. Let $D$ be a point on segment $[BC]$ such that $\\angle CAD = \\angle CBA$. Let $\\omega$ be the circle tangent to segment $[AC]$ at point $A$ and passing through point $I$. Let $X$ be the second point of intersection of circle $\omega$ with the circumcircle of triangle $ABC$. Show that the angle bisectors of $\\angle DAB$ and $\\angle CXB$ intersect on segment $[BC]$.",
    hint: "Utiliser le théorème de la bissectrice : le point d'intersection avec $[BC]$ divise le segment dans le rapport des côtés."
  },
  {
    id: "geo-6",
    theme: "Géométrie",
    points: 75,
    difficulty: "75 pts",
    title: "Symétrique de M et Cercle d'Euler",
    statement: "Let $\\triangle ABC$ be an acute-angled triangle, and let $O$ be the center of its circumcircle. Let $D, E$, and $F$ be the midpoints of sides $[BC]$, $[CA]$, and $[AB]$, respectively. Let $M$ be a point distinct from point $D$ on segment $[BC]$. Let $N$ be the intersection point of lines $(EF)$ and $(AM)$. The line $(ON)$ intersects the circumcircle of triangle $ODM$ at point $P$. Show that the symmetrical point of $M$ with respect to line $(DP)$ belongs to the Euler's circle of triangle $ABC$.",
    hint: "Rappeler que le cercle d'Euler passe par les milieux $D, E, F$. Utiliser l'inversion de centre $D$."
  },
  {
    id: "geo-7",
    theme: "Géométrie",
    points: 75,
    difficulty: "75 pts",
    title: "Cercle tangent intérieurement et cercle BSC",
    statement: "Let $\\triangle ABC$ be a triangle and $\\Omega$ its circumcircle. Consider a circle $\omega$ internally tangent to circle $\Omega$ at point $A$. Let $P$ and $Q$ be the intersection points (distinct from point $A$) of circle $\omega$ with sides $[AB]$ and $[AC]$, respectively. Let $O$ be the intersection point of lines $(BQ)$ and $(CP)$. Let $A_0$ be the symmetrical point of $A$ with respect to line $(BC)$, and let $S$ be the intersection point of line $(OA_0)$ with circle $\omega$ such that point $S$ lies on the arc $PQ$ not containing point $A$. Show that the circumcircle of triangle $BSC$ is tangent to circle $\omega$.",
    hint: "Appliquer une homothétie de centre $A$ envoyant $\\omega$ sur $\\Omega$."
  },
  {
    id: "geo-8",
    theme: "Géométrie",
    points: 75,
    difficulty: "75 pts",
    title: "Points cocycliques X, G, D et B",
    statement: "Let $\\triangle ABC$ be an acute-angled triangle such that $AB < AC$. Let $D, E$, and $F$ be the respective points of contact of the inscribed circle of triangle $ABC$ with sides $[BC], [CA]$, and $[AB]$. The line perpendicular to segment $[EF]$ passing through point $D$ intersects segment $[AB]$ at point $G$. The circumcircle of triangle $AEF$ intersects the circumcircle of triangle $ABC$ at point $X$. Show that points $X, G, D$, and $B$ are concyclic.",
    hint: "Montrer que $\\angle BGD = \\angle BXD$ en utilisant le point de Miquel et la puissance de $A$."
  },
  {
    id: "geo-9",
    theme: "Géométrie",
    points: 75,
    difficulty: "75 pts",
    title: "Droites parallèles (O1 O2) et (I1 I2)",
    statement: "Let $\\triangle ABC$ be an acute-angled triangle. Let $D, E$, and $F$ be the feet of the altitudes from vertices $A, B$, and $C$, respectively. Let $I_1$ and $I_2$ be the centers of the circles inscribed in triangles $AEF$ and $BDF$, respectively. Let $O_1$ and $O_2$ be the centers of the circumcircles of triangles $ACI_1$ and $BCI_2$, respectively. Show that lines $(O_1 O_2)$ and $(I_1 I_2)$ are parallel.",
    hint: "Les triangles $AEF$ et $BDF$ sont semblables à $ABC$. Utiliser les coordonnées barycentriques ou les similitudes directes."
  },

  // ==========================================
  // 3. COMBINATOIRE (Screenshots 1 & 2)
  // ==========================================
  {
    id: "comb-1",
    theme: "Combinatoire",
    points: 30,
    difficulty: "30 pts",
    title: "Les 7 nains et les 3 litres de lait",
    statement: "Seven dwarfs are sitting around a round table. Each has a glass in front of him. Some glasses contain milk, totaling 3 liters altogether. One of the dwarfs evenly shares his milk with the other six without keeping any for himself. Moving clockwise around the table, each subsequent dwarf does the same. After the seventh dwarf has shared his milk, the contents of the glasses are the same as initially. Determine how much milk each dwarf originally had.",
    hint: "Écrire un système linéaire $x_i$ pour chaque nain après son tour de partage, ou remonter les opérations en sens inverse."
  },
  {
    id: "comb-2",
    theme: "Combinatoire",
    points: 45,
    difficulty: "45 pts",
    title: "Sous-ensemble A avec |x - y| >= xy/25",
    statement: "Let $A$ be a subset of $\\mathbb{N}^*$ such that for all $x, y \\in A$ with $x \\neq y$, we have $|x - y| \\ge \\frac{xy}{25}$. Show that $|A| \\le 9$. Provide an example of such a set.",
    hint: "Réécrire la condition sous la forme $|\\frac{1}{y} - \\frac{1}{x}| \\ge \\frac{1}{25}$. Les inverses sont espacés d'au moins $1/25$ dans $]0, 1]$."
  },
  {
    id: "comb-3",
    theme: "Combinatoire",
    points: 60,
    difficulty: "60 pts",
    title: "Compétition à n problèmes et 4 élèves",
    statement: "In a math competition, there are $n \\ge 4$ problems. Each problem has been solved by exactly four students. For two problems, exactly one student has solved both. Assume there are at least $4n$ students participating in the competition. Determine the minimum value of $n$ such that there is always a student who has solved all the problems.",
    hint: "Modéliser par une matrice d'incidence élèves-problèmes et utiliser l'inégalité de Fisher / algèbre linéaire."
  },
  {
    id: "comb-4",
    theme: "Combinatoire",
    points: 60,
    difficulty: "60 pts",
    title: "Borne sur |X| avec intersections bornées",
    statement: "Let $X$ be a finite set, and $A_1, A_2, \\dots, A_m$ be subsets of $X$ with $|A_i| = r$ for $1 \\le i \\le m$. Suppose that for all $i \\neq j$, $|A_i \\cap A_j| \\le k$. Show that $|X| \\ge \\frac{m r^2}{r + (m-1)k}$.",
    hint: "Appliquer l'inégalité de Cauchy-Schwarz à la somme $\\sum_{x \\in X} d(x)^2$ où $d(x)$ est le nombre d'ensembles $A_i$ contenant $x$."
  },
  {
    id: "comb-5",
    theme: "Combinatoire",
    points: 60,
    difficulty: "60 pts",
    title: "Tournoi de football et équipe 3ème avant la fin",
    statement: "$n$ football teams participate in a tournament where each team plays against every other team exactly once. The winner of each match gets three points, the loser gets 0 points, and both teams get one point each in case of a draw. After the tournament, the team third from the last has a score strictly less than any team above it and strictly more than the two teams below it. It also has strictly more wins than the teams above it and strictly fewer wins than the two teams below it. Determine the minimum value of $n$.",
    hint: "Analyser les contraintes sur les victoires, nuls et défaites des équipes $n-2, n-1, n$ et la somme totale des points."
  },
  {
    id: "comb-6",
    theme: "Combinatoire",
    points: 45,
    difficulty: "45 pts",
    title: "Score de Lisa s = 30 + 4c - m",
    statement: "A math competition consists of 30 multiple-choice questions. The score $s$ of a participant is calculated by the formula: $s = 30 + 4c - m$ where $c$ is the number of correct answers and $m$ is the number of incorrect answers. Participants are not penalized for unanswered questions. Lisa informed Christian that her score, which was over 80, allowed him to determine the number of questions she answered correctly. If Lisa's score had been lower but still over 80, Christian would not have been able to determine it. What was Lisa's score?",
    hint: "Déterminer les valeurs possibles de $s$ qui ont une décomposition unique en $(c, m)$ avec $c + m \\le 30$."
  },
  {
    id: "comb-7",
    theme: "Combinatoire",
    points: 75,
    difficulty: "75 pts",
    title: "Conférence internationale de 50 anglophones, francophones et hispanophones",
    statement: "At an international conference, there are exactly 50 participants who speak English, exactly 50 who speak French, and exactly 50 who speak Spanish. Some participants can speak more than one of these languages. Show that there exists a partition of the participants into 5 groups such that each group contains exactly 10 English speakers, 10 French speakers, and 10 Spanish speakers.",
    hint: "Utiliser le théorème de Hall ou le théorème de circulation de Hoffman avec bornes inférieures et supérieures."
  },
  {
    id: "comb-8",
    theme: "Combinatoire",
    points: 75,
    difficulty: "75 pts",
    title: "Représentants distincts pour une famille finie",
    statement: "Let $A_1, A_2, \\dots, A_n$ be finite sets. Show that if $\\sum_{1 \\le i < j \\le n} \\frac{|A_i \\cap A_j|}{|A_i| \\cdot |A_j|} < 1$, then there exist $a_i \\in A_i$ for $i=1, 2, \\dots, n$ such that $a_i \\neq a_j$ if $i \\neq j$.",
    hint: "Méthode probabiliste : choisir chaque $a_i \\in A_i$ uniformément et indépendamment au hasard."
  },
  {
    id: "comb-9",
    theme: "Combinatoire",
    points: 75,
    difficulty: "75 pts",
    title: "20 filles et 20 garçons sur cercles concentriques",
    statement: "There are 20 girls and 20 boys sitting face to face around two concentric circles. Exactly 20 people are sitting on each circle, but the number of boys and girls on each circle is unknown. If a boy $g$ and a girl $f$ are sitting face to face, then $(f, g)$ forms a partner pair. Show that it is possible to rotate the inner circle in such a way that the number of partner pairs is at least 10.",
    hint: "Calculer la moyenne du nombre de paires sur les 20 rotations possibles du cercle intérieur."
  },
  {
    id: "comb-10",
    theme: "Combinatoire",
    points: 75,
    difficulty: "75 pts",
    title: "Les six boîtes et l'exposant 2010^2010^2010",
    statement: "Initially, each of the six boxes $B_1, B_2, B_3, B_4, B_5, B_6$ contains one token. Two types of operations are possible: Type 1: Choose a non-empty box $B_j$ with $1 \\le j \\le 5$; remove one token from box $B_j$ and add two tokens to box $B_{j+1}$. Type 2: Choose a non-empty box $B_k$ with $1 \\le k \\le 4$; remove one token from box $B_k$ and swap the contents (potentially empty) of boxes $B_{k+1}$ and $B_{k+2}$. Is it possible, after a finite number of such operations, for boxes $B_1, B_2, B_3, B_4, B_5$ to be empty and box $B_6$ to contain exactly $2010^{2010^{2010}}$ tokens?",
    hint: "Analyser la croissance exponentielle en cascade (tours d'exponentielles) réalisable par les échanges de boîtes."
  },

  // ==========================================
  // 4. INÉGALITÉS (Screenshots 3 & 4)
  // ==========================================
  {
    id: "ineq-1",
    theme: "Inégalités",
    points: 15,
    difficulty: "15 pts",
    title: "Inégalité a^2/b + b^2/c + c^2/a >= 3",
    statement: "Let $a, b, c$ be positive real numbers such that $a + b + c = 3$. Prove that: $$\\frac{a^2}{b} + \\frac{b^2}{c} + \\frac{c^2}{a} \\ge 3$$",
    hint: "Appliquer la forme de Titu (Cauchy-Schwarz) : $\\sum \\frac{a^2}{b} \\ge \\frac{(a+b+c)^2}{a+b+c} = 3$."
  },
  {
    id: "ineq-2",
    theme: "Inégalités",
    points: 30,
    difficulty: "30 pts",
    title: "Inégalité de Schur pour r=1",
    statement: "Let $a, b, c$ be non-negative real numbers. Prove that: $$a^3 + b^3 + c^3 + 3abc \\ge a^2b + b^2c + c^2a + ab^2 + bc^2 + ca^2$$",
    hint: "Il s'agit de l'inégalité de Schur pour le degré 1 : $\\sum a(a-b)(a-c) \\ge 0$."
  },
  {
    id: "ineq-3",
    theme: "Inégalités",
    points: 15,
    difficulty: "15 pts",
    title: "Inégalité a^2/b + b^2/c + c^2/a >= a+b+c",
    statement: "Let $a, b, c$ be positive real numbers. Prove that: $$\\frac{a^2}{b} + \\frac{b^2}{c} + \\frac{c^2}{a} \\ge a + b + c$$",
    hint: "Remarquer que $\\frac{a^2}{b} + b \\ge 2a$ d'après AM-GM, puis sommer circulairement."
  },
  {
    id: "ineq-4",
    theme: "Inégalités",
    points: 45,
    difficulty: "45 pts",
    title: "Inégalité avec xyz=1 et 1/(x^3(y+z))",
    statement: "Let $x, y, z$ be positive real numbers such that $xyz = 1$. Prove that: $$\\frac{1}{x^3(y+z)} + \\frac{1}{y^3(z+x)} + \\frac{1}{z^3(x+y)} \\ge \\frac{3}{2}$$",
    hint: "Poser $a = 1/x, b = 1/y, c = 1/z$ pour se ramener à l'inégalité de Nesbitt sous forme de Cauchy-Schwarz."
  },
  {
    id: "ineq-5",
    theme: "Inégalités",
    points: 30,
    difficulty: "30 pts",
    title: "Somme cyclique (a-b)(a-c) >= 0",
    statement: "Let $a, b, c$ be non-negative real numbers. Prove that: $$(a-b)(a-c) + (b-a)(b-c) + (c-a)(c-b) \\ge 0$$",
    hint: "Développer : l'expression vaut $\\frac{1}{2}[(a-b)^2 + (b-c)^2 + (c-a)^2] \\ge 0$."
  },
  {
    id: "ineq-6",
    theme: "Inégalités",
    points: 45,
    difficulty: "45 pts",
    title: "Somme de cubes (a/(a+b))^3 >= 1/4",
    statement: "Let $a, b, c, d$ be positive real numbers. Prove that: $$\\left(\\frac{a}{a+b}\\right)^3 + \\left(\\frac{b}{b+c}\\right)^3 + \\left(\\frac{c}{c+d}\\right)^3 + \\left(\\frac{d}{d+a}\\right)^3 \\ge \\frac{1}{4}$$",
    hint: "Utiliser l'inégalité de Hölder ou la convexité de la fonction $f(x) = x^3$."
  },
  {
    id: "ineq-7",
    theme: "Inégalités",
    points: 60,
    difficulty: "60 pts",
    title: "Somme a / sqrt(a^2 + 8bc) >= 1",
    statement: "Let $a, b, c$ be positive real numbers such that $a + b + c = 1$. Prove that: $$\\frac{a}{\\sqrt{a^2+8bc}} + \\frac{b}{\\sqrt{b^2+8ca}} + \\frac{c}{\\sqrt{c^2+8ab}} \\ge 1$$",
    hint: "Appliquer l'inégalité de Hölder sur $\\left(\\sum \\frac{a}{\\sqrt{a^2+8bc}}\\right)^2 \\sum a(a^2+8bc) \\ge (a+b+c)^3$."
  },
  {
    id: "ineq-8",
    theme: "Inégalités",
    points: 45,
    difficulty: "45 pts",
    title: "Racines de 4a^2 + b^2 >= 2(a+b+c)",
    statement: "Let $a, b, c \\ge 0$. Prove that: $$\\sqrt{4a^2+b^2} + \\sqrt{4b^2+c^2} + \\sqrt{4c^2+a^2} \\ge 2(a+b+c)$$",
    hint: "Inégalité de Minkowski (Cauchy-Schwarz vectoriel) sur les vecteurs $(2a, b), (2b, c), (2c, a)$."
  },
  {
    id: "ineq-9",
    theme: "Inégalités",
    points: 60,
    difficulty: "60 pts",
    title: "Somme a^2 / (b^2 + c^2) >= 3/2",
    statement: "Let $a, b, c$ be positive real numbers. Prove that: $$\\frac{a^2}{b^2+c^2} + \\frac{b^2}{c^2+a^2} + \\frac{c^2}{a^2+b^2} \\ge \\frac{3}{2}$$",
    hint: "Inégalité de Nesbitt généralisée aux carrés ou Cauchy-Schwarz sous forme de Sedrakyan."
  },
  {
    id: "ineq-10",
    theme: "Inégalités",
    points: 60,
    difficulty: "60 pts",
    title: "Somme cyclique x^2 / (x^2 + xy + y^2) >= 1",
    statement: "Let $x, y, z$ be positive real numbers. Prove that: $$\\frac{x^2}{x^2+xy+y^2} + \\frac{y^2}{y^2+yz+z^2} + \\frac{z^2}{z^2+zx+x^2} \\ge 1$$",
    hint: "Considérer aussi la somme symétrique avec $y^2$ au numérateur et décomposer la différence."
  },
  {
    id: "ineq-11",
    theme: "Inégalités",
    points: 75,
    difficulty: "75 pts",
    title: "Somme 1/(a^2+a+1) >= 1 avec abc=1",
    statement: "Let $a, b, c$ be positive real numbers such that $abc = 1$. Prove that: $$\\frac{1}{a^2+a+1} + \\frac{1}{b^2+b+1} + \\frac{1}{c^2+c+1} \\ge 1$$",
    hint: "Poser $a = yz/x^2, b = zx/y^2, c = xy/z^2$ ou utiliser la substitution $a = x/y, b = y/z, c = z/x$."
  },
  {
    id: "ineq-12",
    theme: "Inégalités",
    points: 75,
    difficulty: "75 pts",
    title: "Somme sqrt(2a/(a^2+b^2)) <= Somme a/sqrt(ab+bc)",
    statement: "Let $a, b, c$ be positive real numbers. Prove that: $$\\sum_{cyc} \\sqrt{\\frac{2a}{a^2+b^2}} \\le \\sum_{cyc} \\frac{a}{\\sqrt{ab+bc}}$$",
    hint: "Majorer chaque terme $\\frac{\\sqrt{2}}{\\sqrt{a^2+b^2}} \\le \\frac{a+b}{\\sqrt{2}(ab)^{...}}$ en appliquant Cauchy-Schwarz."
  },

  // ==========================================
  // 5. ÉQUATIONS FONCTIONNELLES
  // ==========================================
  {
    id: "fe-1",
    theme: "Équations Fonctionnelles",
    points: 15,
    difficulty: "15 pts",
    title: "f(x+y) = f(x) + f(y) + xy",
    statement: "Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all $x, y \\in \\mathbb{R}$: $$f(x+y) = f(x) + f(y) + xy$$",
    hint: "Poser $g(x) = f(x) - \\frac{x^2}{2}$. Que vérifie $g(x+y)$ ?"
  },
  {
    id: "fe-2",
    theme: "Équations Fonctionnelles",
    points: 30,
    difficulty: "30 pts",
    title: "f(x+y) = f(x)f(y)",
    statement: "Find all continuous functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all $x, y \\in \\mathbb{R}$: $$f(x+y) = f(x)f(y)$$ Prove that either $f(x) = 0$ everywhere or $f(x) = a^x$ for some $a > 0$.",
    hint: "Étudier le signe de $f(x) = f(x/2)^2 \\ge 0$ et poser $a = f(1)$."
  },
  {
    id: "fe-3",
    theme: "Équations Fonctionnelles",
    points: 45,
    difficulty: "45 pts",
    title: "f(f(x) + y) = f(x + f(y))",
    statement: "Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all $x, y \\in \\mathbb{R}$: $$f(f(x) + y) = f(x + f(y))$$ Determine the conditions on continuity and injectivity.",
    hint: "Poser $y = 0$ pour obtenir $f(f(x)) = f(x + f(0))$. Déduire que $f(x) = x + c$."
  },
  {
    id: "fe-4",
    theme: "Équations Fonctionnelles",
    points: 60,
    difficulty: "60 pts",
    title: "f(x^2 + f(y)) = y + f(x)^2",
    statement: "Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all $x, y \\in \\mathbb{R}$: $$f(x^2 + f(y)) = y + f(x)^2$$",
    hint: "Fixer $x = 0$ pour prouver la surjectivité et l'injectivité de $f$. Montrer ensuite que $f(x) = x$."
  },
  {
    id: "fe-5",
    theme: "Équations Fonctionnelles",
    points: 75,
    difficulty: "75 pts",
    title: "f(f(x) + y) = f(f(x) - y) + 4f(x)y",
    statement: "Find all functions $f: \\mathbb{R} \\to \\mathbb{R}$ such that for all $x, y \\in \\mathbb{R}$: $$f(f(x) + y) = f(f(x) - y) + 4f(x)y$$",
    hint: "Poser $y = f(x)$ et analyser la parité pour montrer que $f(x) = 0$ ou $f(x) = x^2$."
  }
];
