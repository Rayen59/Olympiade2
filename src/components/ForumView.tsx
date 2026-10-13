import React, { useState, useEffect } from 'react';
import { ForumTopic, User } from '../types';
import { store } from '../services/store';
import { MathView } from './MathView';
import { ImageModal } from './ImageModal';
import {
  MessageSquare,
  Plus,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  Clock,
  User as UserIcon,
  ChevronLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

interface ForumViewProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ForumView: React.FC<ForumViewProps> = ({ currentUser, onOpenAuth }) => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  // New Topic Modal State
  const [isNewTopicOpen, setIsNewTopicOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Théorie des Nombres');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [showNewTopicLatexPreview, setShowNewTopicLatexPreview] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const [showReplyLatexPreview, setShowReplyLatexPreview] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  // Lightbox Zoom for forum images
  const [zoomImages, setZoomImages] = useState<string[]>([]);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomTitle, setZoomTitle] = useState('Image du forum');

  const reloadTopics = () => {
    const list = store.getForumTopics(selectedCategory);
    setTopics(list);
  };

  useEffect(() => {
    reloadTopics();
    return store.subscribe(reloadTopics);
  }, [selectedCategory]);

  const activeTopic = activeTopicId ? store.getForumTopicById(activeTopicId) : null;

  const handleOpenImageZoom = (imgUrl: string, title?: string) => {
    setZoomImages([imgUrl]);
    setZoomTitle(title || 'Document joint');
    setZoomModalOpen(true);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setTopicError(null);

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const res = store.createForumTopic(currentUser, {
      title: newTitle,
      category: newCategory,
      content: newContent,
      imageUrl: newImage
    });

    if (res.error) {
      setTopicError(res.error);
    } else {
      setIsNewTopicOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewImage(null);
      setShowNewTopicLatexPreview(false);
      if (res.topic) setActiveTopicId(res.topic.id);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError(null);
    setReplySuccess(null);

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!activeTopicId) return;

    const res = store.replyToForumTopic(activeTopicId, currentUser, {
      content: replyContent,
      imageUrl: replyImage
    });

    if (res.error) {
      setReplyError(res.error);
    } else {
      setReplyContent('');
      setReplyImage(null);
      setShowReplyLatexPreview(false);
      setReplySuccess('Votre réponse a été publiée avec succès !');
      setTimeout(() => setReplySuccess(null), 3000);
    }
  };

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) setter(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0a3d75] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Forum Mathématique Communautaire
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Écrivez en LaTeX avec \`$...\` et \`$$...\`, prévisualisez en temps réel avant d'envoyer, et joignez des schémas géométriques.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setIsNewTopicOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-[#0056b3] hover:bg-[#0a3d75] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouveau Sujet
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'Général', 'Théorie des Nombres', 'Géométrie', 'Combinatoire', 'Inégalités', 'Équations Fonctionnelles'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveTopicId(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0056b3] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          )
        )}
      </div>

      {/* DETAIL VIEW OF TOPIC */}
      {activeTopic ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTopicId(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft className="w-4 h-4" /> Revenir à la liste des discussions
            </button>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {activeTopic.category}
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-2">{activeTopic.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
              <span className="font-semibold text-slate-700">{activeTopic.authorName}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(activeTopic.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span>•</span>
              <span>{activeTopic.views} vues</span>
            </div>

            {/* Topic Body with LaTeX */}
            <div className="p-4 bg-slate-50 rounded-xl text-xs sm:text-sm leading-relaxed border border-slate-200">
              <MathView content={activeTopic.content} />

              {/* Attached Image with Zoom */}
              {activeTopic.imageUrl && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="block text-[11px] font-bold text-slate-600 mb-1.5">Image jointe :</span>
                  <div className="relative inline-block border border-slate-200 rounded-lg overflow-hidden bg-white group max-w-md">
                    <img
                      src={activeTopic.imageUrl}
                      alt="Illustration du sujet"
                      className="max-h-72 object-contain cursor-pointer"
                      onClick={() => handleOpenImageZoom(activeTopic.imageUrl!, activeTopic.title)}
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenImageZoom(activeTopic.imageUrl!, activeTopic.title)}
                      className="absolute bottom-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded shadow text-xs flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" /> Zoom
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Replies Thread */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Réponses ({activeTopic.replies ? activeTopic.replies.length : 0})
            </h3>

            {activeTopic.replies && activeTopic.replies.length > 0 ? (
              <div className="space-y-2.5">
                {activeTopic.replies.map((reply) => (
                  <div key={reply.id} className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="font-bold text-[#0056b3]">{reply.authorName}</span>
                      <span>
                        {new Date(reply.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="text-slate-800 leading-relaxed">
                      <MathView content={reply.content} />
                    </div>

                    {reply.imageUrl && (
                      <div className="pt-2">
                        <div className="relative inline-block border border-slate-200 rounded overflow-hidden bg-slate-50 group">
                          <img
                            src={reply.imageUrl}
                            alt="Réponse illustration"
                            className="max-h-48 object-contain cursor-pointer"
                            onClick={() => handleOpenImageZoom(reply.imageUrl!, `Réponse de ${reply.authorName}`)}
                          />
                          <button
                            type="button"
                            onClick={() => handleOpenImageZoom(reply.imageUrl!, `Réponse de ${reply.authorName}`)}
                            className="absolute bottom-1.5 right-1.5 p-1 bg-slate-900/80 text-white rounded text-[10px] flex items-center gap-1"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                Aucune réponse pour le moment. Soyez le premier à répondre !
              </p>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Votre Réponse</label>

                {/* Requirement: "ajouter l'option vesualise dans le forum le user peut voir sa visualisation de code latex avant de envoyer" */}
                <button
                  type="button"
                  onClick={() => setShowReplyLatexPreview(!showReplyLatexPreview)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition"
                >
                  {showReplyLatexPreview ? (
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

              {replyError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{replyError}</span>
                </div>
              )}

              {replySuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{replySuccess}</span>
                </div>
              )}

              <textarea
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Rédigez votre réponse ici. Vous pouvez utiliser des formules LaTeX ($...$, $$...$$)..."
                className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
              />

              {/* Requirement: Live LaTeX Visualisation Pane */}
              {showReplyLatexPreview && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Visualisation LaTeX avant envoi :
                  </span>
                  {replyContent.trim() ? (
                    <MathView content={replyContent} className="text-xs bg-white p-2.5 rounded border border-slate-200" />
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Tapez du texte avec du LaTeX ($...$) pour le voir mis en forme ci-dessus.
                    </p>
                  )}
                </div>
              )}

              {/* Requirement: "et aussi ajouter il peut envoyer des images dans les forums" */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="forum-reply-img"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, setReplyImage)}
                    className="hidden"
                  />
                  <label
                    htmlFor="forum-reply-img"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Joindre une image / schéma
                  </label>

                  {replyImage && (
                    <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-1 rounded text-xs">
                      <span className="text-blue-800 font-semibold truncate max-w-[120px]">Image prête</span>
                      <button
                        type="button"
                        onClick={() => setReplyImage(null)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Retirer l'image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0056b3] hover:bg-[#0a3d75] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer la Réponse
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* TOPICS LIST */
        <div className="space-y-2.5">
          {topics.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
              Aucun sujet dans cette catégorie. Cliquez sur "Nouveau Sujet" pour commencer la discussion.
            </div>
          ) : (
            topics.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTopicId(t.id)}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs hover:shadow-sm transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#0056b3] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {t.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 hover:text-blue-700 transition mb-1.5">
                    {t.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {t.content.replace(/\$\$[\s\S]*?\$\$/g, '[Formule LaTeX]').replace(/\$[^$\n]+?\$/g, '[LaTeX]')}
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>{t.authorName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {t.imageUrl && <span className="text-blue-600 font-semibold">📷 Image</span>}
                    <span>{t.views} vues</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      💬 {t.replies ? t.replies.length : 0} réponses
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* NEW TOPIC MODAL */}
      {isNewTopicOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto relative max-h-[92vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                Créer un Nouveau Sujet de Discussion
              </h2>
              <button
                onClick={() => setIsNewTopicOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="p-5 overflow-y-auto flex-1 space-y-3.5">
              {topicError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{topicError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la discussion</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Question sur la valuation p-adique de (2n)!..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Théorie des Nombres">Théorie des Nombres</option>
                  <option value="Géométrie">Géométrie</option>
                  <option value="Combinatoire">Combinatoire</option>
                  <option value="Inégalités">Inégalités</option>
                  <option value="Équations Fonctionnelles">Équations Fonctionnelles</option>
                  <option value="Général">Général & Méthodes</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Contenu & Démonstrations</label>
                  {/* Requirement: "ajouter l'option vesualise dans le forum le user peut voir sa visualisation de code latex avant de envoyer" */}
                  <button
                    type="button"
                    onClick={() => setShowNewTopicLatexPreview(!showNewTopicLatexPreview)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition"
                  >
                    {showNewTopicLatexPreview ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Masquer aperçu
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Visualiser le LaTeX ($...$)
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Exposez votre question ou démonstration. LaTeX supporté: $a^2+b^2=c^2$..."
                  className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />

                {/* Requirement: Live LaTeX Visualisation Pane */}
                {showNewTopicLatexPreview && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Visualisation LaTeX avant envoi :
                    </span>
                    {newContent.trim() ? (
                      <MathView content={newContent} className="text-xs bg-white p-2.5 rounded border border-slate-200" />
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Tapez du texte ou du LaTeX ($...$) pour le voir mis en forme ici.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Requirement: "et aussi ajouter il peut envoyer des images dans les forums" */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image / Illustration (Optionnel)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="new-topic-img"
                    accept="image/*"
                    onChange={(e) => handleImageFile(e, setNewImage)}
                    className="hidden"
                  />
                  <label
                    htmlFor="new-topic-img"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md border border-slate-300 transition"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Choisir un fichier image
                  </label>

                  {newImage && (
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-xs">
                      <span className="text-blue-800 font-semibold">Image attachée</span>
                      <button
                        type="button"
                        onClick={() => setNewImage(null)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTopicOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0056b3] hover:bg-[#0a3d75] rounded-md shadow-xs transition cursor-pointer"
                >
                  Publier la Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom for forum images */}
      <ImageModal
        images={zoomImages}
        isOpen={zoomModalOpen}
        onClose={() => setZoomModalOpen(false)}
        title={zoomTitle}
      />
    </div>
  );
};
