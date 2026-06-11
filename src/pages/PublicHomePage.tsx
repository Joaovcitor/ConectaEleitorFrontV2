import { BarChart3, CalendarCheck, CheckCircle2, ClipboardList, CreditCard, FileText, MapPinned, ShieldCheck, Smartphone, Users } from "lucide-react";
import { Link } from "react-router-dom";

const featureGroups = [
  {
    icon: <Users size={22} />,
    title: "Base eleitoral organizada",
    description: "Cadastre eleitores, lideranças, contatos, endereço, zona, seção e vínculo com responsáveis.",
  },
  {
    icon: <ClipboardList size={22} />,
    title: "Demandas com acompanhamento",
    description: "Registre solicitações, prioridade, status e histórico para acompanhar o atendimento.",
  },
  {
    icon: <CalendarCheck size={22} />,
    title: "Agenda e compromissos",
    description: "Controle agendas institucionais, compromissos, horários, locais e vínculos com eleitores.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Relatórios do gabinete",
    description: "Acompanhe indicadores de eleitores, demandas, compromissos, bairros, distritos e lideranças.",
  },
  {
    icon: <CreditCard size={22} />,
    title: "Planos, uso e pagamentos",
    description: "Visualize assinatura, limites do plano, consumo atual e pagamentos vinculados ao tenant.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Acesso por perfil",
    description: "A interface respeita perfis como Admin, vereador, assessor, liderança e eleitor.",
  },
];

const workflowItems = [
  "Cadastre e qualifique a base de contatos.",
  "Vincule lideranças e territórios.",
  "Registre demandas e compromissos.",
  "Monitore relatórios e evolução mensal.",
];

export function PublicHomePage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <img src="/marketing/landing-hero.png" alt="Equipe usando um painel digital de gestão de relacionamento" />
        <div className="marketing-nav">
          <Link className="login-brand" to="/apresentacao">
            <span>LG</span>
            <div>
              <h2>LegisGest</h2>
              <p>Gestão parlamentar moderna</p>
            </div>
          </Link>
          <nav>
            <Link to="/planos-publicos">Planos</Link>
            <Link to="/login">Entrar</Link>
          </nav>
        </div>
        <div className="marketing-hero-content">
          <span className="eyebrow">LegisGest</span>
          <h1>Organize relacionamento, demandas e agenda em um só painel.</h1>
          <p>
            Plataforma para gabinetes e equipes acompanharem eleitores, lideranças, solicitações,
            compromissos e indicadores operacionais com controle de acesso.
          </p>
          <div className="marketing-actions">
            <Link className="primary-button" to="/planos-publicos">Ver planos</Link>
            <Link className="ghost-button" to="/login">Entrar no sistema</Link>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-product">
        <div className="marketing-copy">
          <span className="eyebrow">Operação diária</span>
          <h2>Feito para rotinas de atendimento, acompanhamento territorial e prestação de contas interna.</h2>
          <p>
            O sistema reúne cadastro, demandas, agenda, compromissos e relatórios. A área administrativa
            também acompanha planos, assinatura, uso do plano e pagamentos quando disponível para o perfil.
          </p>
        </div>
        <img src="/marketing/dashboard-mock.png" alt="Mock visual do painel do LegisGest" />
      </section>

      <section className="marketing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Funcionalidades</span>
            <h2>O que existe no sistema hoje</h2>
            <p>Recursos conectados às telas e módulos já presentes no front-end.</p>
          </div>
        </div>
        <div className="marketing-feature-grid">
          {featureGroups.map((feature) => (
            <article className="marketing-feature" key={feature.title}>
              <span>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-band">
        <div>
          <span className="eyebrow">Fluxo de trabalho</span>
          <h2>Da base eleitoral ao acompanhamento mensal</h2>
        </div>
        <div className="workflow-list">
          {workflowItems.map((item) => (
            <div key={item}>
              <CheckCircle2 size={20} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-split">
        <article>
          <MapPinned size={26} />
          <h2>Leitura territorial</h2>
          <p>Relatórios por bairros, distritos e lideranças ajudam a enxergar concentração e evolução da base cadastrada.</p>
        </article>
        <article>
          <FileText size={26} />
          <h2>Registro de solicitações</h2>
          <p>Demandas têm prioridade, status, eleitor vinculado e detalhes para acompanhamento pela equipe.</p>
        </article>
        <article>
          <Smartphone size={26} />
          <h2>Experiência instalável</h2>
          <p>O projeto inclui suporte a PWA, com manifesto, service worker e fluxo de instalação quando o navegador permitir.</p>
        </article>
      </section>

      <section className="marketing-cta">
        <div>
          <span className="eyebrow">Planos</span>
          <h2>Veja os planos públicos disponíveis</h2>
          <p>Compare limites, recursos e valores cadastrados no módulo de planos.</p>
        </div>
        <Link className="primary-button" to="/planos-publicos">Ver planos</Link>
      </section>
    </main>
  );
}
