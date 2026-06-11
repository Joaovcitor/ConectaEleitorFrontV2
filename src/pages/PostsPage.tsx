import { ArrowLeft, Edit, Eye, Heart, MessageCircle, Newspaper, Pin, Plus, RefreshCw, Search, Send, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { postCommentService, postService } from "../api/services";
import type { PagedResult, PostCommentResponseDTO, PostCreateDTO, PostResponseDTO } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

type PostFormState = {
  categoryId: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  isPinned: boolean;
  isPublished: boolean;
  isPublic: boolean;
};

const emptyPaged = <T,>(): PagedResult<T> => ({ items: [], totalItems: 0, pageNumber: 1, pageSize: 10 });

const emptyPostForm = (): PostFormState => ({
  categoryId: "",
  title: "",
  summary: "",
  content: "",
  coverImageUrl: "",
  isPinned: false,
  isPublished: true,
  isPublic: true,
});

const nullable = (value: string) => value.trim() || null;

const toPayload = (form: PostFormState): PostCreateDTO => ({
  categoryId: nullable(form.categoryId),
  title: form.title.trim(),
  summary: nullable(form.summary),
  content: form.content.trim(),
  coverImageUrl: nullable(form.coverImageUrl),
  isPinned: form.isPinned,
  isPublished: form.isPublished,
  isPublic: form.isPublic,
});

const toForm = (post: PostResponseDTO): PostFormState => ({
  categoryId: post.categoryId ?? "",
  title: post.title ?? "",
  summary: post.summary ?? "",
  content: post.content ?? "",
  coverImageUrl: post.coverImageUrl ?? "",
  isPinned: post.isPinned,
  isPublished: post.isPublished,
  isPublic: post.isPublic,
});

const formatDate = (value?: string | null) => {
  if (!value || value.startsWith("0001-")) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
};

const formatDateTime = (value?: string | null) => {
  if (!value || value.startsWith("0001-")) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
};

const previewText = (post: PostResponseDTO) => {
  const text = post.summary || post.content;
  return text.length > 220 ? `${text.slice(0, 220).trim()}...` : text;
};

export function PostsPage() {
  const [postsPage, setPostsPage] = useState<PagedResult<PostResponseDTO>>(emptyPaged);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });
  const [commentsPage, setCommentsPage] = useState<PagedResult<PostCommentResponseDTO>>(emptyPaged);
  const [commentsPagination, setCommentsPagination] = useState({ pageNumber: 1, pageSize: 10 });
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsSaving, setCommentsSaving] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentsFeedback, setCommentsFeedback] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<PostFormState>(emptyPostForm);
  const [editing, setEditing] = useState<PostResponseDTO | null>(null);
  const [showForm, setShowForm] = useState(false);

  const posts = postsPage.items ?? postsPage.data ?? [];
  const total = postsPage.totalItems ?? postsPage.totalCount ?? posts.length;
  const page = postsPage.pageNumber ?? pagination.pageNumber;
  const pageSize = postsPage.pageSize ?? pagination.pageSize;
  const canGoNext = page * pageSize < total;
  const comments = commentsPage.items ?? commentsPage.data ?? [];
  const commentsTotal = commentsPage.totalItems ?? commentsPage.totalCount ?? comments.length;
  const commentsPageNumber = commentsPage.pageNumber ?? commentsPagination.pageNumber;
  const commentsPageSize = commentsPage.pageSize ?? commentsPagination.pageSize;
  const canGoNextComments = commentsPage.hasNext ?? commentsPageNumber * commentsPageSize < commentsTotal;

  const visiblePosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return posts;

    return posts.filter((post) =>
      [post.title, post.summary, post.content, post.categoryName, post.categoryId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [posts, query]);

  const load = async (params = pagination) => {
    try {
      setLoading(true);
      setError("");
      setPostsPage(await postService.list(params));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(pagination);
  }, [pagination.pageNumber, pagination.pageSize]);

  const loadComments = async (postId: string, params = commentsPagination) => {
    try {
      setCommentsLoading(true);
      setCommentsError("");
      setCommentsPage(await postCommentService.listByPost(postId, params));
    } catch (err) {
      setCommentsError(getErrorMessage(err));
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!activeCommentsPostId) return;
    loadComments(activeCommentsPostId, commentsPagination);
  }, [activeCommentsPostId, commentsPagination.pageNumber, commentsPagination.pageSize]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyPostForm());
    setError("");
    setFeedback("");
    setShowForm(true);
  };

  const startEdit = async (post: PostResponseDTO) => {
    try {
      setLoadingDetails(true);
      setError("");
      setFeedback("");
      const details = await postService.getById(post.assemblymanPostId);
      setEditing(details);
      setForm(toForm(details));
      setShowForm(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingDetails(false);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyPostForm());
    setError("");
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError("Informe título e conteúdo para salvar o post.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = toPayload(form);

      if (editing) {
        await postService.update(editing.assemblymanPostId, payload);
        setFeedback("Post atualizado com sucesso.");
      } else {
        await postService.create(payload);
        setFeedback("Post criado com sucesso.");
      }

      cancelForm();
      await load(pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: PostResponseDTO) => {
    if (!window.confirm(`Excluir o post "${post.title}"?`)) return;

    try {
      setError("");
      setFeedback("");
      await postService.delete(post.assemblymanPostId);
      setFeedback("Post excluído com sucesso.");
      await load(pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleComments = (postId: string) => {
    setCommentsError("");
    setCommentsFeedback("");
    setCommentInput("");

    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      setCommentsPage(emptyPaged<PostCommentResponseDTO>());
      return;
    }

    setCommentsPage(emptyPaged<PostCommentResponseDTO>());
    setCommentsPagination({ pageNumber: 1, pageSize: 10 });
    setActiveCommentsPostId(postId);
  };

  const saveComment = async (event: FormEvent<HTMLFormElement>, postId: string) => {
    event.preventDefault();

    const content = commentInput.trim();
    if (!content) {
      setCommentsError("Escreva um comentário antes de enviar.");
      return;
    }

    try {
      setCommentsSaving(true);
      setCommentsError("");
      setCommentsFeedback("");
      await postCommentService.create({ postId, content, parentCommentId: null });
      setCommentInput("");
      setCommentsFeedback("Comentário publicado com sucesso.");
      const firstPage = { pageNumber: 1, pageSize: commentsPagination.pageSize };
      setCommentsPagination(firstPage);
      await loadComments(postId, firstPage);
      await load(pagination);
    } catch (err) {
      setCommentsError(getErrorMessage(err));
    } finally {
      setCommentsSaving(false);
    }
  };

  const removeComment = async (comment: PostCommentResponseDTO) => {
    if (!activeCommentsPostId || !window.confirm("Excluir este comentário?")) return;

    try {
      setCommentsError("");
      setCommentsFeedback("");
      await postCommentService.delete(comment.assemblymanPostCommentId);
      setCommentsFeedback("Comentário excluído com sucesso.");
      await loadComments(activeCommentsPostId, commentsPagination);
      await load(pagination);
    } catch (err) {
      setCommentsError(getErrorMessage(err));
    }
  };

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Conteúdo</span>
          <h1>Posts</h1>
          <p>Gerencie publicações, destaque, visibilidade e status de publicação.</p>
        </div>
        <button className="primary-button" type="button" onClick={startCreate}>
          <Plus size={18} /> Novo post
        </button>
      </div>

      {feedback && <div className="alert success"><strong>Sucesso</strong><span>{feedback}</span></div>}
      {error && <div className="alert error"><strong>Erro</strong><span>{error}</span></div>}

      {showForm && (
        <form className="panel form-grid" onSubmit={save}>
          <div className="form-section-title">
            <Newspaper size={20} />
            <div>
              <h3>{editing ? "Editar post" : "Novo post"}</h3>
              <p>{editing ? "Atualize texto, imagem e visibilidade da publicação." : "Crie uma publicação para testar o fluxo de conteúdo."}</p>
            </div>
            <button className="ghost-button" type="button" onClick={cancelForm}>
              <X size={18} /> Fechar
            </button>
          </div>

          <div className="form-grid two-columns">
            <label>
              Título
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Título do post" />
            </label>
            <label>
              Categoria
              <input value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} placeholder="GUID da categoria (opcional)" />
            </label>
            <label className="span-all">
              Resumo
              <textarea rows={3} value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Resumo curto para exibição em listas" />
            </label>
            <label className="span-all">
              Conteúdo
              <textarea rows={8} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} placeholder="Conteúdo completo do post" />
            </label>
            <label className="span-all">
              URL da imagem de capa
              <input value={form.coverImageUrl} onChange={(event) => setForm((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="https://..." />
            </label>
          </div>

          <div className="form-grid three-columns">
            <label className="checkbox-card">
              <input type="checkbox" checked={form.isPinned} onChange={(event) => setForm((current) => ({ ...current, isPinned: event.target.checked }))} />
              <span><strong>Fixado</strong><small>Destaca o post na listagem.</small></span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))} />
              <span><strong>Publicado</strong><small>Marca o conteúdo como publicado.</small></span>
            </label>
            <label className="checkbox-card">
              <input type="checkbox" checked={form.isPublic} onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))} />
              <span><strong>Público</strong><small>Permite exibição pública quando houver vitrine.</small></span>
            </label>
          </div>

          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={cancelForm}>Cancelar</button>
            <button className="primary-button" type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar post"}</button>
          </div>
        </form>
      )}

      <div className="toolbar">
        <Search size={18} />
        <input placeholder="Buscar por título, resumo, conteúdo ou categoria" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="ghost-button" type="button" onClick={() => load(pagination)}>
          <RefreshCw size={18} /> Atualizar
        </button>
      </div>

      <div className="posts-feed-shell">
        {loading ? <LoadingState label="Carregando posts..." /> : visiblePosts.length === 0 ? <EmptyState title="Nenhum post encontrado" description="Crie um post para testar o fluxo de conteúdo." /> : (
          <div className="posts-feed">
            {visiblePosts.map((post) => (
              <article className="social-post-card" key={post.assemblymanPostId}>
                <header className="social-post-header">
                  <div className="social-avatar">LG</div>
                  <div className="social-author">
                    <strong>LegisGest</strong>
                    <span>{post.categoryName ?? "Publicação"} · {formatDate(post.createdAt)}</span>
                  </div>
                  <div className="social-post-actions">
                    {post.isPinned && <span className="pin-indicator" title="Post fixado"><Pin size={16} /></span>}
                    <Link title="Visualizar" to={`/posts/${post.assemblymanPostId}`}><Eye size={17} /></Link>
                    <button title="Editar" type="button" disabled={loadingDetails} onClick={() => startEdit(post)}><Edit size={17} /></button>
                    <button title="Excluir" type="button" onClick={() => remove(post)}><Trash2 size={17} /></button>
                  </div>
                </header>

                <Link className="social-post-body" to={`/posts/${post.assemblymanPostId}`}>
                  <h2>{post.title}</h2>
                  <p>{previewText(post)}</p>
                </Link>

                {post.coverImageUrl ? (
                  <Link className="social-post-media" to={`/posts/${post.assemblymanPostId}`}>
                    <img src={post.coverImageUrl} alt={`Imagem de capa de ${post.title}`} />
                  </Link>
                ) : (
                  <Link className="social-post-placeholder" to={`/posts/${post.assemblymanPostId}`}>
                    <Newspaper size={34} />
                    <span>Sem imagem de capa</span>
                  </Link>
                )}

                <footer className="social-post-footer">
                  <div className="social-metrics">
                    <span><Eye size={17} /> {post.viewsCount}</span>
                    <span><Heart size={17} /> {post.likesCount}</span>
                    <button className="social-comment-toggle" type="button" onClick={() => toggleComments(post.assemblymanPostId)}>
                      <MessageCircle size={17} /> {post.commentsCount} comentários
                    </button>
                  </div>
                  <div className="badge-row">
                    <StatusBadge tone={post.isPublished ? "green" : "slate"}>{post.isPublished ? "Publicado" : "Rascunho"}</StatusBadge>
                    <StatusBadge tone={post.isPublic ? "blue" : "slate"}>{post.isPublic ? "Público" : "Privado"}</StatusBadge>
                  </div>
                </footer>

                {activeCommentsPostId === post.assemblymanPostId && (
                  <section className="social-comments-panel">
                    {commentsFeedback && <div className="comment-feedback success">{commentsFeedback}</div>}
                    {commentsError && <div className="comment-feedback error">{commentsError}</div>}

                    <form className="comment-form" onSubmit={(event) => saveComment(event, post.assemblymanPostId)}>
                      <div className="comment-avatar">LG</div>
                      <input
                        value={commentInput}
                        onChange={(event) => setCommentInput(event.target.value)}
                        placeholder="Escreva um comentário..."
                      />
                      <button type="submit" disabled={commentsSaving}>
                        <Send size={16} />
                        {commentsSaving ? "Enviando" : "Enviar"}
                      </button>
                    </form>

                    <div className="comments-list">
                      {commentsLoading ? (
                        <div className="comments-loading">Carregando comentários...</div>
                      ) : comments.length === 0 ? (
                        <div className="comments-empty">Nenhum comentário ainda.</div>
                      ) : comments.map((comment) => (
                        <article className="comment-item" key={comment.assemblymanPostCommentId}>
                          <div className="comment-avatar muted">U</div>
                          <div className="comment-bubble">
                            <header>
                              <strong>Usuário</strong>
                              <span>{formatDateTime(comment.createdAt)}</span>
                            </header>
                            <p>{comment.content}</p>
                          </div>
                          <button className="comment-delete" type="button" title="Excluir comentário" onClick={() => removeComment(comment)}>
                            <Trash2 size={16} />
                          </button>
                        </article>
                      ))}
                    </div>

                    {commentsTotal > commentsPageSize && (
                      <div className="comments-pagination">
                        <span>{commentsTotal} comentários</span>
                        <div>
                          <button type="button" disabled={commentsPageNumber <= 1 || commentsLoading} onClick={() => setCommentsPagination((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>Anterior</button>
                          <strong>Página {commentsPageNumber}</strong>
                          <button type="button" disabled={!canGoNextComments || commentsLoading} onClick={() => setCommentsPagination((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>Próxima</button>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="pagination-bar">
        <span>{total} registros</span>
        <div>
          <button className="ghost-button" type="button" disabled={page <= 1 || loading} onClick={() => setPagination((current) => ({ ...current, pageNumber: current.pageNumber - 1 }))}>
            <ArrowLeft size={18} /> Anterior
          </button>
          <strong>Página {page}</strong>
          <button className="ghost-button" type="button" disabled={!canGoNext || loading} onClick={() => setPagination((current) => ({ ...current, pageNumber: current.pageNumber + 1 }))}>
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
}
