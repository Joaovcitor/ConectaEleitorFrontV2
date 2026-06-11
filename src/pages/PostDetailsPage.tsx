import { ArrowLeft, Eye, Heart, MessageCircle, Pin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { postService } from "../api/services";
import type { PostResponseDTO } from "../api/types";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";

const formatDateTime = (value?: string | null) => {
  if (!value || value.startsWith("0001-")) return "-";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("pt-BR");
};

export function PostDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    postService
      .getById(id)
      .then(setPost)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!id || !post || !window.confirm(`Excluir o post "${post.title}"?`)) return;

    await postService.delete(id);
    navigate("/posts");
  };

  if (loading) return <LoadingState label="Carregando post..." />;
  if (error) return <div className="alert error"><strong>Erro</strong><span>{error}</span></div>;
  if (!post) return <EmptyState title="Post não encontrado" description="Não foi possível localizar esta publicação." />;

  return (
    <section className="stack">
      <div className="page-heading">
        <div>
          <span>Post</span>
          <h1>{post.title}</h1>
          <p>{post.summary || "Visualização completa da publicação selecionada."}</p>
        </div>
        <div className="form-actions">
          <Link className="ghost-button" to="/posts"><ArrowLeft size={18} /> Voltar</Link>
          <button className="danger-button" type="button" onClick={remove}><Trash2 size={18} /> Excluir</button>
        </div>
      </div>

      <article className="social-post-detail">
        <header className="social-post-header">
          <div className="social-avatar">LG</div>
          <div className="social-author">
            <strong>LegisGest</strong>
            <span>{post.categoryName ?? "Publicação"} · {formatDateTime(post.createdAt)}</span>
          </div>
          <div className="badge-row">
            {post.isPinned && <StatusBadge tone="amber"><Pin size={14} /> Fixado</StatusBadge>}
            <StatusBadge tone={post.isPublished ? "green" : "slate"}>{post.isPublished ? "Publicado" : "Rascunho"}</StatusBadge>
            <StatusBadge tone={post.isPublic ? "blue" : "slate"}>{post.isPublic ? "Público" : "Privado"}</StatusBadge>
          </div>
        </header>

        <div className="social-post-detail-copy">
          <h2>{post.title}</h2>
          {post.summary && <p className="social-post-summary">{post.summary}</p>}
        </div>

        {post.coverImageUrl && (
          <div className="social-post-detail-media">
            <img src={post.coverImageUrl} alt={`Imagem de capa de ${post.title}`} />
          </div>
        )}

        <div className="social-post-detail-content">
          <p>{post.content}</p>
        </div>

        <footer className="social-post-detail-footer">
          <div className="social-metrics">
            <span><Eye size={18} /> {post.viewsCount} visualizações</span>
            <span><Heart size={18} /> {post.likesCount} curtidas</span>
            <span><MessageCircle size={18} /> {post.commentsCount} comentários</span>
          </div>
          <span>Atualizado em {formatDateTime(post.updatedAt)}</span>
        </footer>
      </article>
    </section>
  );
}
