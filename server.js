import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadStore, saveStore, resetToVirgin } from './data/store.js';
import { moderateForumContent } from './services/moderation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Support JSON bodies up to 30MB for image / PDF submissions
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to check and auto-expire bans
function checkBanStatus(user) {
  if (!user || !user.banned) return false;
  if (user.banUntil && user.banUntil !== 'permanent') {
    const expiry = new Date(user.banUntil).getTime();
    if (Date.now() >= expiry) {
      user.banned = false;
      user.banUntil = null;
      user.banReason = null;
      saveStore();
      return false;
    }
  }
  return true;
}

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tous les champs (nom, email, mot de passe) sont obligatoires." });
  }

  const store = loadStore();
  const normalizedEmail = email.trim().toLowerCase();

  // Rule: An email can only be used once
  const existing = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ 
      error: "Cette adresse e-mail est déjà utilisée. Un e-mail ne peut servir qu'à un seul compte." 
    });
  }

  const isAdmin = (normalizedEmail === "admin12@gmail.com" && password === "admin12");
  const avatarColors = ["#0056b3", "#0f4c81", "#2563eb", "#0284c7", "#0369a1", "#1d4ed8"];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    username: username.trim(),
    email: normalizedEmail,
    password: password,
    role: isAdmin ? "admin" : "user",
    points: 0,
    solvedProblems: [],
    solvedCount: 0,
    banned: false,
    banUntil: null,
    banReason: null,
    createdAt: new Date().toISOString(),
    avatarColor: randomColor,
    bio: "Participant aux Olympiades Mathématiques MK."
  };

  store.users.push(newUser);
  saveStore();

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Veuillez renseigner l'email et le mot de passe." });
  }

  const store = loadStore();
  const normalizedEmail = email.trim().toLowerCase();

  // Special secret admin check
  if (normalizedEmail === "admin12@gmail.com" && password === "admin12") {
    let adminUser = store.users.find(u => u.email.toLowerCase() === "admin12@gmail.com");
    if (!adminUser) {
      adminUser = {
        id: "usr-admin-1",
        username: "Admin MK",
        email: "admin12@gmail.com",
        password: "admin12",
        role: "admin",
        points: 0,
        solvedProblems: [],
        solvedCount: 0,
        banned: false,
        banUntil: null,
        banReason: null,
        createdAt: new Date().toISOString(),
        avatarColor: "#0056b3",
        bio: "Administrateur officiel MK Olympiades."
      };
      store.users.unshift(adminUser);
      saveStore();
    } else {
      adminUser.role = "admin";
      saveStore();
    }
    const { password: _, ...safeUser } = adminUser;
    return res.json({ user: safeUser });
  }

  const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Identifiants incorrects. Vérifiez votre adresse email et votre mot de passe." });
  }

  checkBanStatus(user);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Non connecté" });
  }
  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }
  checkBanStatus(user);
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

app.delete('/api/auth/delete-account', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  const store = loadStore();
  const idx = store.users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({ error: "Compte non trouvé" });
  }

  if (store.users[idx].email.toLowerCase() === "admin12@gmail.com") {
    return res.status(403).json({ error: "Le compte administrateur principal ne peut pas être supprimé." });
  }

  store.users.splice(idx, 1);
  store.submissions = (store.submissions || []).filter(s => s.userId !== userId);
  store.olympiadSubmissions = (store.olympiadSubmissions || []).filter(s => s.userId !== userId);
  saveStore();
  res.json({ success: true, message: "Compte supprimé définitivement." });
});

// ---------------- USERS & PROFILES ----------------
app.get('/api/users', (req, res) => {
  const store = loadStore();
  const safeUsers = store.users.map(({ password: _, ...u }) => u);
  safeUsers.sort((a, b) => b.points - a.points || b.solvedCount - a.solvedCount);
  res.json({ users: safeUsers });
});

app.get('/api/users/:id', (req, res) => {
  const store = loadStore();
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Profil introuvable" });
  }
  checkBanStatus(user);

  const userSubmissions = (store.submissions || [])
    .filter(s => s.userId === user.id)
    .map(s => ({
      id: s.id,
      problemId: s.problemId,
      problemTitle: s.problemTitle,
      category: s.category,
      points: s.points,
      status: s.status,
      reviewReason: s.reviewReason,
      submittedAt: s.submittedAt
    }));

  const userOlympiadResults = (store.olympiadSubmissions || [])
    .filter(os => os.userId === user.id)
    .map(os => {
      const oly = (store.olympiads || []).find(o => o.id === os.olympiadId);
      return {
        olympiadId: os.olympiadId,
        olympiadTitle: oly ? oly.title : "Olympiade MK",
        status: os.status,
        overallScore: os.overallScore,
        totalPoints: oly ? oly.totalPoints : 28,
        medal: oly && (oly.resultsPublished || user.role === 'admin') ? os.medal : (os.status === 'graded' ? "Note attribuée (Résultats officiels en attente de délibération)" : "Copie envoyée - En cours d'examen"),
        problemScores: os.problemScores || {},
        feedback: os.feedback || ""
      };
    });

  const { password: _, ...safeUser } = user;
  res.json({
    user: safeUser,
    submissions: userSubmissions,
    olympiadResults: userOlympiadResults
  });
});

// ---------------- PROBLEMS ----------------
app.get('/api/problems', (req, res) => {
  const store = loadStore();
  const { theme, points } = req.query;
  let filtered = store.problems || [];

  if (theme && theme !== 'all') {
    filtered = filtered.filter(p => p.theme === theme);
  }
  if (points && points !== 'all') {
    filtered = filtered.filter(p => p.points === parseInt(points, 10));
  }

  res.json({ problems: filtered });
});

app.get('/api/problems/:id', (req, res) => {
  const store = loadStore();
  const problem = (store.problems || []).find(p => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ error: "Problème non trouvé" });
  }
  res.json({ problem });
});

// Candidate retrieves their own submission for a specific problem
app.get('/api/problems/:id/my-submission', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.json({ submission: null });

  const store = loadStore();
  const sub = (store.submissions || []).find(s => s.problemId === req.params.id && s.userId === userId);
  if (!sub) return res.json({ submission: null });

  const prob = (store.problems || []).find(p => p.id === req.params.id);
  const images = sub.images && sub.images.length > 0 ? sub.images : (sub.imageUrl ? [sub.imageUrl] : []);

  res.json({
    submission: {
      ...sub,
      images,
      imageUrl: images[0] || "",
      problemStatement: prob ? prob.statement : ""
    }
  });
});

// Candidate submits multiple polycopies / images and solution text
app.post('/api/problems/:id/submit', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { imageUrl, images: rawImages, solutionText } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "Connexion requise pour soumettre un problème." });
  }

  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  if (checkBanStatus(user)) {
    return res.status(403).json({ 
      error: `Votre compte est actuellement suspendu. Motif : ${user.banReason || 'Activité inappropriée'}. Vous ne pouvez pas soumettre de problème.` 
    });
  }

  let images = [];
  if (Array.isArray(rawImages) && rawImages.length > 0) {
    images = rawImages.filter(img => typeof img === 'string' && img.trim().length > 0);
  } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    images = [imageUrl.trim()];
  }

  if (images.length === 0) {
    return res.status(400).json({ 
      error: "Veuillez joindre au moins une photo ou polycopie claire de votre solution rédigée." 
    });
  }

  const problem = (store.problems || []).find(p => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ error: "Problème non trouvé." });
  }

  // Check if candidate already has an existing submission for this problem
  const existingSub = (store.submissions || []).find(s => s.problemId === problem.id && s.userId === user.id);
  if (existingSub) {
    // Condition: Si l'admin a déjà examiné la soumission (non pending), l'ajout d'images n'est permis que si la soumission est vrai (approved)
    const isAdminReviewed = existingSub.status !== 'pending' || Boolean(existingSub.reviewedAt);
    if (isAdminReviewed && existingSub.status !== 'approved') {
      return res.status(403).json({
        error: "L'administrateur a déjà examiné cette copie (non validée). L'ajout ou le remplacement de pages n'est autorisé que si la soumission est validée (vraie)."
      });
    }

    existingSub.images = images;
    existingSub.imageUrl = images[0] || "";
    existingSub.solutionText = solutionText !== undefined ? solutionText : existingSub.solutionText;
    existingSub.updatedAt = new Date().toISOString();

    saveStore();
    return res.json({
      success: true,
      message: "Votre soumission et vos polycopies ont été mises à jour avec succès !",
      submission: existingSub
    });
  }

  const submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    problemId: problem.id,
    problemTitle: problem.title,
    category: problem.theme,
    points: problem.points,
    userId: user.id,
    username: user.username,
    userEmail: user.email,
    images: images,
    imageUrl: images[0] || "",
    solutionText: solutionText || "",
    status: "pending",
    reviewReason: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null
  };

  store.submissions.unshift(submission);
  saveStore();

  res.status(201).json({ 
    success: true, 
    message: "Votre solution a été soumise avec succès ! L'administrateur examinera vos polycopies.",
    submission 
  });
});

// Candidate modifies their existing submission (add / remove polycopies, update text)
app.put('/api/submissions/:id', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: "Non connecté" });

  const store = loadStore();
  const sub = (store.submissions || []).find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: "Soumission introuvable" });

  const user = store.users.find(u => u.id === userId);
  const isOwner = sub.userId === userId;
  const isAdmin = user && user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Action non autorisée" });
  }

  const { images, solutionText, newImages } = req.body;

  // Enforce rule: if admin has reviewed the submission, user can only add images if the submission is 'approved' (vrai)
  const isAdminReviewed = sub.status !== 'pending' || Boolean(sub.reviewedAt);
  const currentCount = (sub.images || (sub.imageUrl ? [sub.imageUrl] : [])).length;
  const nextImages = Array.isArray(images) ? images : (sub.images || []);
  const addedImagesCount = (Array.isArray(newImages) ? newImages.length : 0) + (nextImages.length > currentCount ? nextImages.length - currentCount : 0);

  if (!isAdmin && isAdminReviewed && addedImagesCount > 0 && sub.status !== 'approved') {
    return res.status(403).json({
      error: "L'administrateur a déjà examiné cette copie. Vous ne pouvez ajouter des polycopies/images que si votre soumission est validée (vraie)."
    });
  }

  if (Array.isArray(images)) {
    if (images.length === 0) {
      return res.status(400).json({ error: "Une soumission doit comporter au moins une polycopie / page manuscrite." });
    }
    sub.images = images;
    sub.imageUrl = images[0] || "";
  }

  if (solutionText !== undefined) {
    sub.solutionText = solutionText;
  }

  sub.updatedAt = new Date().toISOString();
  saveStore();

  res.json({
    success: true,
    message: "Soumission mise à jour avec succès !",
    submission: sub
  });
});

// Candidate or Admin deletes a submission
app.delete('/api/submissions/:id', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: "Non connecté" });

  const store = loadStore();
  const subIndex = (store.submissions || []).findIndex(s => s.id === req.params.id);
  if (subIndex === -1) return res.status(404).json({ error: "Soumission introuvable" });

  const sub = store.submissions[subIndex];
  const user = store.users.find(u => u.id === userId);
  const isOwner = sub.userId === userId;
  const isAdmin = user && user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Action non autorisée" });
  }

  // If the submission was approved, revert the user's score and solved status
  if (sub.status === 'approved') {
    const candidateUser = store.users.find(u => u.id === sub.userId);
    if (candidateUser) {
      candidateUser.points = Math.max(0, candidateUser.points - (sub.points || 0));
      candidateUser.solvedProblems = (candidateUser.solvedProblems || []).filter(pid => pid !== sub.problemId);
      candidateUser.solvedCount = candidateUser.solvedProblems.length;
    }
  }

  store.submissions.splice(subIndex, 1);
  saveStore();

  res.json({
    success: true,
    message: "Soumission et polycopies supprimées définitivement."
  });
});

// ---------------- COURSES (ISOLATED THEORY) ----------------
app.get('/api/courses', (req, res) => {
  const store = loadStore();
  res.json({ courses: store.courses || [] });
});

app.get('/api/courses/:id', (req, res) => {
  const store = loadStore();
  const course = (store.courses || []).find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ error: "Cours introuvable" });
  }
  res.json({ course });
});

// ---------------- FORUM & AI MODERATION ----------------
app.get('/api/forum', (req, res) => {
  const store = loadStore();
  const { category } = req.query;
  let topics = store.forumTopics || [];
  if (category && category !== 'all') {
    topics = topics.filter(t => t.category === category);
  }
  topics = topics.map(t => ({
    id: t.id,
    title: t.title,
    category: t.category,
    authorId: t.authorId,
    authorName: t.authorName,
    content: t.content.length > 220 ? t.content.slice(0, 220) + '...' : t.content,
    hasImage: Boolean(t.imageUrl),
    views: t.views,
    repliesCount: t.replies ? t.replies.length : 0,
    createdAt: t.createdAt
  }));
  res.json({ topics });
});

app.get('/api/forum/:id', (req, res) => {
  const store = loadStore();
  const topic = (store.forumTopics || []).find(t => t.id === req.params.id);
  if (!topic) {
    return res.status(404).json({ error: "Sujet introuvable" });
  }
  topic.views = (topic.views || 0) + 1;
  saveStore();
  res.json({ topic });
});

app.post('/api/forum', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { title, category, content, imageUrl } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "Connexion obligatoire pour publier un sujet." });
  }
  if (!title || !category || !content) {
    return res.status(400).json({ error: "Titre, catégorie et contenu sont obligatoires." });
  }

  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  if (checkBanStatus(user)) {
    return res.status(403).json({ 
      error: `Votre compte est bloqué. Motif : ${user.banReason || 'activité inappropriée'}. Impossible de publier.` 
    });
  }

  const moderation = await moderateForumContent({ title, content, category });
  if (!moderation.approved) {
    return res.status(400).json({ 
      error: `Publication refusée par la modération IA : ${moderation.reason}` 
    });
  }

  const newTopic = {
    id: `topic-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: title.trim(),
    category,
    authorId: user.id,
    authorName: user.username,
    content: content.trim(),
    imageUrl: imageUrl || null,
    views: 1,
    createdAt: new Date().toISOString(),
    replies: []
  };

  store.forumTopics.unshift(newTopic);
  saveStore();

  res.status(201).json({ 
    success: true, 
    topic: newTopic,
    moderationNote: moderation.reason 
  });
});

app.post('/api/forum/:id/reply', async (req, res) => {
  const userId = req.headers['x-user-id'];
  const { content, imageUrl } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "Connexion requise pour répondre." });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Votre réponse ne peut pas être vide." });
  }

  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  if (checkBanStatus(user)) {
    return res.status(403).json({ 
      error: `Votre compte est bloqué (${user.banReason || 'non autorisé'}).` 
    });
  }

  const topic = (store.forumTopics || []).find(t => t.id === req.params.id);
  if (!topic) {
    return res.status(404).json({ error: "Sujet non trouvé." });
  }

  const moderation = await moderateForumContent({ title: topic.title, content, category: topic.category });
  if (!moderation.approved) {
    return res.status(400).json({ 
      error: `Réponse refusée par la modération IA : ${moderation.reason}` 
    });
  }

  const reply = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    authorId: user.id,
    authorName: user.username,
    content: content.trim(),
    imageUrl: imageUrl || null,
    createdAt: new Date().toISOString()
  };

  if (!topic.replies) topic.replies = [];
  topic.replies.push(reply);
  saveStore();

  res.status(201).json({ success: true, reply });
});

// ---------------- OLYMPIAD BLOC (EXAM, PDF, GRADING & ACCESS CONTROL) ----------------
function requireAdmin(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: "Accès administrateur requis." });
  }
  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Accès interdit : privilèges administrateur requis." });
  }
  req.adminUser = user;
  next();
}

// Get all olympiads
app.get('/api/olympiads', (req, res) => {
  const store = loadStore();
  const userId = req.headers['x-user-id'];
  const user = store.users.find(u => u.id === userId);
  const isAdmin = user && user.role === 'admin';

  const olys = (store.olympiads || []).map(o => {
    return {
      id: o.id,
      title: o.title,
      description: o.description,
      durationHours: o.durationHours,
      durationMinutes: o.durationMinutes,
      totalDurationMinutes: o.totalDurationMinutes,
      problemCount: o.problemCount,
      pointsPerProblem: o.pointsPerProblem,
      totalPoints: o.totalPoints,
      goldCutoff: o.goldCutoff,
      silverCutoff: o.silverCutoff,
      bronzeCutoff: o.bronzeCutoff,
      honorableMentionCutoff: o.honorableMentionCutoff,
      pdfUrl: o.pdfUrl,
      pdfTitle: o.pdfTitle,
      status: o.status,
      resultsPublished: o.resultsPublished,
      canViewResults: o.resultsPublished || isAdmin,
      createdAt: o.createdAt
    };
  });

  res.json({ olympiads: olys });
});

// Get single olympiad
app.get('/api/olympiads/:id', (req, res) => {
  const store = loadStore();
  const userId = req.headers['x-user-id'];
  const user = store.users.find(u => u.id === userId);
  const isAdmin = user && user.role === 'admin';

  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) {
    return res.status(404).json({ error: "Olympiade non trouvée" });
  }

  res.json({
    olympiad: {
      ...oly,
      canViewResults: oly.resultsPublished || isAdmin
    }
  });
});

// Admin creates or updates an Olympiad
app.post('/api/olympiads', requireAdmin, (req, res) => {
  const { 
    title, description, durationHours, durationMinutes, 
    problemCount, pointsPerProblem, goldCutoff, silverCutoff, bronzeCutoff,
    pdfDataUrl, pdfTitle 
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Le titre de l'olympiade est obligatoire." });
  }

  const store = loadStore();
  const h = parseInt(durationHours || 4, 10);
  const m = parseInt(durationMinutes || 0, 10);
  const pCount = parseInt(problemCount || 4, 10);
  const ptsPerProb = parseInt(pointsPerProblem || 7, 10);
  const totalPts = pCount * ptsPerProb;

  const newOly = {
    id: `oly-${Date.now()}`,
    title: title.trim(),
    description: description || `Épreuve officielle d'olympiades MK. Durée : ${h}h${m > 0 ? m : ''}. ${pCount} problèmes notés sur ${ptsPerProb} points.`,
    durationHours: h,
    durationMinutes: m,
    totalDurationMinutes: (h * 60) + m,
    problemCount: pCount,
    pointsPerProblem: ptsPerProb,
    totalPoints: totalPts,
    goldCutoff: parseInt(goldCutoff || Math.round(totalPts * 0.85), 10),
    silverCutoff: parseInt(silverCutoff || Math.round(totalPts * 0.65), 10),
    bronzeCutoff: parseInt(bronzeCutoff || Math.round(totalPts * 0.45), 10),
    honorableMentionCutoff: Math.max(1, ptsPerProb),
    pdfUrl: pdfDataUrl || "/assets/olympiade_mk_sujet_officiel.pdf",
    pdfTitle: pdfTitle || "Sujet_Olympiade_MK.pdf",
    status: "active",
    resultsPublished: false, // Locked by default
    createdAt: new Date().toISOString()
  };

  if (!store.olympiads) store.olympiads = [];
  store.olympiads.unshift(newOly);
  saveStore();

  res.status(201).json({ success: true, olympiad: newOly });
});

// Admin toggles access to the Final Ranking & Awards
app.put('/api/olympiads/:id/toggle-results', requireAdmin, (req, res) => {
  const { resultsPublished } = req.body;
  const store = loadStore();
  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) {
    return res.status(404).json({ error: "Olympiade introuvable" });
  }

  oly.resultsPublished = Boolean(resultsPublished);
  saveStore();

  res.json({ 
    success: true, 
    resultsPublished: oly.resultsPublished,
    message: oly.resultsPublished 
      ? "L'accès au classement final et aux médailles est désormais OUVERT à tous les utilisateurs !"
      : "L'accès aux résultats est maintenant VERROUILLÉ (délibérations du jury en cours)."
  });
});

app.delete('/api/olympiads/:id', requireAdmin, (req, res) => {
  const store = loadStore();
  store.olympiads = (store.olympiads || []).filter(o => o.id !== req.params.id);
  store.olympiadSubmissions = (store.olympiadSubmissions || []).filter(s => s.olympiadId !== req.params.id);
  saveStore();
  res.json({ success: true, message: "Olympiade supprimée." });
});

app.post('/api/admin/reset-virgin', requireAdmin, (req, res) => {
  resetToVirgin();
  res.json({ success: true, message: "Projet réinitialisé à l'état vierge officiel (aucun compte virtuel)." });
});

// Candidate submits Olympiad solution copies (images)
app.post('/api/olympiads/:id/submit', (req, res) => {
  const userId = req.headers['x-user-id'];
  const { images, solutionNotes } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Connexion requise pour participer à l'olympiade." });
  }

  const store = loadStore();
  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  if (checkBanStatus(user)) {
    return res.status(403).json({ error: "Votre compte est suspendu. Participation refusée." });
  }

  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) {
    return res.status(404).json({ error: "Olympiade non trouvée" });
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "Veuillez joindre au moins une image claire de vos copies manuscrites rédigées." });
  }

  if (!store.olympiadSubmissions) store.olympiadSubmissions = [];

  // Check if existing submission
  let sub = store.olympiadSubmissions.find(os => os.olympiadId === oly.id && os.userId === user.id);
  if (sub) {
    sub.images = images;
    sub.solutionNotes = solutionNotes || sub.solutionNotes;
    sub.updatedAt = new Date().toISOString();
    sub.status = "submitted";
  } else {
    sub = {
      id: `olysub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      olympiadId: oly.id,
      userId: user.id,
      username: user.username,
      userEmail: user.email,
      images,
      solutionNotes: solutionNotes || "",
      status: "submitted", // 'submitted', 'graded'
      problemScores: {}, // { 1: 7, 2: 6, ... }
      overallScore: 0,
      medal: "Non évalué",
      feedback: "",
      submittedAt: new Date().toISOString(),
      gradedAt: null
    };
    store.olympiadSubmissions.unshift(sub);
  }

  saveStore();
  res.status(201).json({ 
    success: true, 
    message: "Copies reçues avec succès ! Vos images sont transmises au jury pour notation.",
    submission: sub
  });
});

// Candidate checks their personal evaluation
app.get('/api/olympiads/:id/my-submission', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: "Non connecté" });

  const store = loadStore();
  const sub = (store.olympiadSubmissions || []).find(s => s.olympiadId === req.params.id && s.userId === userId);
  const oly = (store.olympiads || []).find(o => o.id === req.params.id);

  if (!sub) {
    return res.json({ submission: null });
  }

  // Personal evaluation details
  const safeSub = {
    ...sub,
    resultsPublished: oly ? oly.resultsPublished : false
  };

  res.json({ submission: safeSub, olympiad: oly });
});

// Admin lists candidate submissions for an Olympiad
app.get('/api/olympiads/:id/submissions', requireAdmin, (req, res) => {
  const store = loadStore();
  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) return res.status(404).json({ error: "Olympiade non trouvée" });

  const subs = (store.olympiadSubmissions || []).filter(s => s.olympiadId === req.params.id);
  res.json({ submissions: subs, olympiad: oly });
});

// Admin grades an Olympiad candidate
app.post('/api/olympiads/:id/grade-submission/:subId', requireAdmin, (req, res) => {
  const { problemScores, feedback } = req.body;
  const store = loadStore();
  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) return res.status(404).json({ error: "Olympiade introuvable" });

  const sub = (store.olympiadSubmissions || []).find(s => s.id === req.params.subId && s.olympiadId === oly.id);
  if (!sub) return res.status(404).json({ error: "Soumission introuvable" });

  // Calculate total score from problemScores
  let total = 0;
  const parsedProblemScores = {};
  for (let i = 1; i <= oly.problemCount; i++) {
    const val = parseInt(problemScores?.[i] ?? problemScores?.[`P${i}`] ?? 0, 10);
    parsedProblemScores[`P${i}`] = Math.max(0, Math.min(val, oly.pointsPerProblem));
    total += parsedProblemScores[`P${i}`];
  }

  // Determine Medal
  let medal = "Certificat de Participation";
  if (total >= oly.goldCutoff) {
    medal = "🥇 Médaille d'Or (Gold Medal)";
  } else if (total >= oly.silverCutoff) {
    medal = "🥈 Médaille d'Argent (Silver Medal)";
  } else if (total >= oly.bronzeCutoff) {
    medal = "🥉 Médaille de Bronze (Bronze Medal)";
  } else if (total >= (oly.honorableMentionCutoff || 7)) {
    medal = "🎖️ Mention Honorable (Honorable Mention)";
  }

  sub.problemScores = parsedProblemScores;
  sub.overallScore = total;
  sub.medal = medal;
  sub.feedback = feedback || "Copie corrigée par le jury d'olympiades MK.";
  sub.status = "graded";
  sub.gradedAt = new Date().toISOString();

  // Optionally award overall exam points to user's main profile points
  const candidateUser = store.users.find(u => u.id === sub.userId);
  if (candidateUser) {
    // Add exam points
    candidateUser.points = Math.max(candidateUser.points, candidateUser.points + total);
  }

  saveStore();
  res.json({ success: true, submission: sub, candidate: candidateUser });
});

// Final Ranking Leaderboard of the Olympiad
app.get('/api/olympiads/:id/leaderboard', (req, res) => {
  const store = loadStore();
  const userId = req.headers['x-user-id'];
  const user = store.users.find(u => u.id === userId);
  const isAdmin = user && user.role === 'admin';

  const oly = (store.olympiads || []).find(o => o.id === req.params.id);
  if (!oly) return res.status(404).json({ error: "Olympiade non trouvée" });

  // Access control: Only admin can view if results are not published
  if (!oly.resultsPublished && !isAdmin) {
    return res.json({ 
      locked: true,
      resultsPublished: false,
      message: "Les délibérations officielles sont en cours. L'administrateur ouvrira l'accès aux résultats et médailles dès la clôture des notations."
    });
  }

  const subs = (store.olympiadSubmissions || [])
    .filter(s => s.olympiadId === oly.id && s.status === 'graded')
    .sort((a, b) => b.overallScore - a.overallScore);

  const ranked = subs.map((s, idx) => ({
    rank: idx + 1,
    username: s.username,
    userId: s.userId,
    problemScores: s.problemScores,
    overallScore: s.overallScore,
    totalPoints: oly.totalPoints,
    medal: s.medal
  }));

  res.json({
    locked: false,
    resultsPublished: oly.resultsPublished,
    olympiad: oly,
    rankings: ranked
  });
});

// ---------------- ADMIN SUBMISSIONS (PER CATEGORY & PER USER) ----------------
app.get('/api/admin/submissions', requireAdmin, (req, res) => {
  const store = loadStore();
  const { category, userId, status } = req.query;
  let subs = store.submissions || [];

  if (category && category !== 'all') {
    subs = subs.filter(s => s.category === category);
  }
  if (userId && userId !== 'all') {
    subs = subs.filter(s => s.userId === userId || s.username === userId);
  }
  if (status && status !== 'all') {
    subs = subs.filter(s => s.status === status);
  }

  const byCategory = {};
  const byUser = {};

  (store.submissions || []).forEach(s => {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
    byUser[s.username] = (byUser[s.username] || 0) + 1;
  });

  // Enrich each submission with full problem statement, title, points, and normalized images
  const enrichedSubs = subs.map(s => {
    const prob = (store.problems || []).find(p => p.id === s.problemId);
    const images = (s.images && Array.isArray(s.images) && s.images.length > 0) 
      ? s.images 
      : (s.imageUrl ? [s.imageUrl] : []);

    return {
      ...s,
      images,
      imageUrl: images[0] || "",
      problemTitle: prob ? prob.title : (s.problemTitle || "Problème"),
      problemStatement: prob ? prob.statement : "Énoncé non disponible.",
      problemTheme: prob ? prob.theme : (s.category || "Olympiade"),
      problemPoints: prob ? prob.points : (s.points || 0)
    };
  });

  res.json({
    submissions: enrichedSubs,
    stats: {
      total: (store.submissions || []).length,
      pending: (store.submissions || []).filter(s => s.status === 'pending').length,
      approved: (store.submissions || []).filter(s => s.status === 'approved').length,
      rejected: (store.submissions || []).filter(s => s.status === 'rejected').length,
      byCategory,
      byUser
    }
  });
});

app.post('/api/admin/submissions/:id/review', requireAdmin, (req, res) => {
  const { status, reviewReason } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Statut invalide ('approved' ou 'rejected')." });
  }

  const store = loadStore();
  const sub = (store.submissions || []).find(s => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ error: "Soumission introuvable." });
  }

  const previousStatus = sub.status;
  sub.status = status;
  sub.reviewReason = reviewReason || (status === 'approved' ? "Validé par l'administrateur." : "Soumission refusée (manque de clarté ou justification incomplète).");
  sub.reviewedAt = new Date().toISOString();

  const targetUser = store.users.find(u => u.id === sub.userId);
  if (targetUser) {
    if (status === 'approved' && previousStatus !== 'approved') {
      targetUser.points += (sub.points || 0);
      if (!targetUser.solvedProblems.includes(sub.problemId)) {
        targetUser.solvedProblems.push(sub.problemId);
        targetUser.solvedCount = targetUser.solvedProblems.length;
      }
    } else if (status === 'rejected' && previousStatus === 'approved') {
      targetUser.points = Math.max(0, targetUser.points - (sub.points || 0));
      targetUser.solvedProblems = targetUser.solvedProblems.filter(id => id !== sub.problemId);
      targetUser.solvedCount = targetUser.solvedProblems.length;
    }
  }

  saveStore();
  res.json({ success: true, submission: sub, user: targetUser });
});

app.post('/api/admin/users/:id/ban', requireAdmin, (req, res) => {
  const { duration, reason } = req.body;
  const store = loadStore();
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: "Impossible de bannir un administrateur." });
  }

  let banUntil = null;
  const now = Date.now();

  switch (duration) {
    case '1_day':
      banUntil = new Date(now + 24 * 3600 * 1000).toISOString();
      break;
    case '3_days':
      banUntil = new Date(now + 3 * 24 * 3600 * 1000).toISOString();
      break;
    case '7_days':
      banUntil = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
      break;
    case '1_month':
      banUntil = new Date(now + 30 * 24 * 3600 * 1000).toISOString();
      break;
    case 'permanent':
      banUntil = 'permanent';
      break;
    default:
      return res.status(400).json({ error: "Durée de ban invalide (1_day, 3_days, 7_days, 1_month, permanent)." });
  }

  user.banned = true;
  user.banUntil = banUntil;
  user.banReason = reason || "Plagiat ou activité inappropriée.";
  saveStore();

  res.json({ success: true, user });
});

app.post('/api/admin/users/:id/unban', requireAdmin, (req, res) => {
  const store = loadStore();
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }
  user.banned = false;
  user.banUntil = null;
  user.banReason = null;
  saveStore();
  res.json({ success: true, user });
});

// ---------------- STATIC ASSETS & SPA ROUTING ----------------
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Serveur MK Math Olympiad actif sur http://${HOST}:${PORT}`);
});
