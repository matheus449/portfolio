export type ProjectCategory = 'SaaS' | 'E-commerce' | 'Mobile' | 'Editorial';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  year: string;
  role: string;
  image: string;
  ghPagesImage: string;
  summary: string;
  challenge: string;
  architecture: string[];
  stack: string[];
  metrics: ProjectMetric[];
  repoSlug: string;
  livePreviewDomain: string;
}

export interface DeveloperProfile {
  name: string;
  role: string;
  location: string;
  availability: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  bioLead: string;
  bioBody: string;
}

export interface WheelItemLayout {
  index: number;
  angleDeg: number;
  x: number;
  y: number;
  tangentRotationDeg: number;
  distanceFromApexDeg: number;
  isApex: boolean;
  scale: number;
  opacity: number;
  zIndex: number;
}

export interface AuditFixItem {
  id: string;
  title: string;
  grokProblem: string;
  fixedSolution: string;
  filePath: string;
}

export const ASSETS = {
  favicon: './assets/aistudio/favicon_02015279.svg',
  logoMo: './assets/aistudio/logo-mo_0ceff442.png',
  logoLockup: './assets/aistudio/logo-lockup_2f5662d7.png',
  ogImage: './assets/aistudio/og_a74c1dc1.jpg',
  dashboard: './assets/aistudio/dashboard_8612405a.jpg',
  ecommerce: './assets/aistudio/ecommerce_c687ab50.jpg',
  mobile: './assets/aistudio/mobile_dccab33b.jpg',
  portfolio: './assets/aistudio/portfolio_d92eca30.jpg',
} as const;

export const DEFAULT_PROFILE: DeveloperProfile = {
  name: 'Matheus Oliveira',
  role: 'Desenvolvedor Full-Stack',
  location: 'Brasil · Remoto',
  availability: 'Disponível para novos projetos & posições Full-Stack',
  email: 'mt449matheus@gmail.com',
  githubUrl: 'https://github.com/matheusoliveira',
  linkedinUrl: 'https://linkedin.com/in/matheusoliveira',
  twitterUrl: 'https://x.com/matheusoliveira',
  bioLead:
    'Construo aplicações web completas — da modelagem de dados e APIs resilientes até interfaces rápidas, acessíveis e com acabamento editorial.',
  bioBody:
    'Com foco em arquitetura limpa, TypeScript de ponta a ponta e performance mensurável, transformo requisitos complexos de produto em sistemas estáveis, fáceis de manter e prontos para escalar.',
};

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'nexora-dashboard',
    indexLabel: '01',
    title: 'Nexora Analytics',
    subtitle: 'Plataforma SaaS de Inteligência Financeira & Operações',
    category: 'SaaS',
    year: '2025',
    role: 'Arquitetura Full-Stack & UI',
    image: ASSETS.dashboard,
    ghPagesImage: './work/dashboard.jpg',
    summary:
      'Painel executivo em tempo real para acompanhamento de MRR, retenção de clientes, faturamento recorrente e status de esquadrões de produto.',
    challenge:
      'Unificar múltiplas fontes de faturamento e eventos de produto em uma interface sem bloqueio de thread principal mesmo com dezenas de milhares de transações mensais.',
    architecture: [
      'Agregação incremental de séries temporais com cache em memória e invalidação seletiva.',
      'Visualização de dados com renderização otimizada, suporte a exportação de relatórios e filtros granulares por período.',
      'Controle de acesso baseado em funções (RBAC) e trilha de auditoria completa para eventos críticos de cobrança.',
    ],
    stack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'WebSockets'],
    metrics: [
      { label: 'Latência P95 de Consulta', value: '42 ms' },
      { label: 'Crescimento Monitorado', value: '$128.4k' },
      { label: 'Lighthouse Performance', value: '99 / 100' },
    ],
    repoSlug: 'nexora-analytics-saas',
    livePreviewDomain: 'app.nexora.com/dashboard',
  },
  {
    id: 'auren-ecommerce',
    indexLabel: '02',
    title: 'AUREN Atelier',
    subtitle: 'E-commerce Headless de Moda & Design Atemporal',
    category: 'E-commerce',
    year: '2025',
    role: 'Engenharia Front-End & Checkout',
    image: ASSETS.ecommerce,
    ghPagesImage: './work/ecommerce.jpg',
    summary:
      'Experiência de compra digital minimalista para marca de luxo, combinando direção de arte editorial, busca instantânea e checkout em etapa única.',
    challenge:
      'Reduzir o abandono de carrinho em conexões móveis mantendo imagens de alta fidelidade e transições suaves entre coleções e páginas de produto.',
    architecture: [
      'Catálogo estático regenerado sob demanda (ISR) com pré-carregamento preditivo de rotas adjacentes.',
      'Carrinho persistente sincronizado com validação otimista de estoque e cálculo dinâmico de frete.',
      'Pipeline de imagens responsivas (AVIF/WebP) com placeholders geométricos sem Cumulative Layout Shift (CLS 0.00).',
    ],
    stack: ['Next.js', 'TypeScript', 'Stripe API', 'Tailwind CSS', 'Prisma', 'Redis'],
    metrics: [
      { label: 'Tempo de Carregamento (LCP)', value: '0.9 s' },
      { label: 'Conversão no Checkout', value: '+34%' },
      { label: 'CLS (Estabilidade Visual)', value: '0.00' },
    ],
    repoSlug: 'auren-headless-commerce',
    livePreviewDomain: 'auren.com',
  },
  {
    id: 'focus-mobile',
    indexLabel: '03',
    title: 'Focus Flow Mobile',
    subtitle: 'Aplicativo de Produtividade Profunda & Gestão de Rotina',
    category: 'Mobile',
    year: '2024',
    role: 'Desenvolvimento Mobile & Sincronização Offline',
    image: ASSETS.mobile,
    ghPagesImage: './work/mobile.jpg',
    summary:
      'Aplicativo mobile-first para ciclos de Deep Work, metas semanais, agenda diária e telemetria pessoal de foco com sincronização offline-first.',
    challenge:
      'Garantir que sessões de cronômetro, tarefas concluídas e metas semanais funcionem sem conexão e sincronizem sem conflitos quando o dispositivo reconectar.',
    architecture: [
      ' Motor local-first com fila de mutações determinística e resolução automática de conflitos por timestamp lógico.',
      'Temporizador de sessão resiliente em background com feedback tátil e widgets de progresso semanal.',
      'Interface escura de baixo consumo energético projetada para telas OLED com contraste WCAG AAA.',
    ],
    stack: ['React Native', 'TypeScript', 'SQLite Local', 'Node.js', 'GraphQL', 'PWA'],
    metrics: [
      { label: 'Retenção em 30 Dias', value: '68%' },
      { label: 'Sincronização Offline', value: '100%' },
      { label: 'Taxa de Sessões Livres de Crash', value: '99.9%' },
    ],
    repoSlug: 'focus-flow-mobile',
    livePreviewDomain: 'focusflow.app',
  },
  {
    id: 'editorial-portfolio',
    indexLabel: '04',
    title: 'Studio A. Editorial',
    subtitle: 'Sistema de Identidade Digital & Portfólio Interativo',
    category: 'Editorial',
    year: '2024',
    role: 'Engenharia Criativa & WebGL',
    image: ASSETS.portfolio,
    ghPagesImage: './work/portfolio.jpg',
    summary:
      'Plataforma autoral de alto contraste tipográfico para exibição de estudos de caso, artigos técnicos e experimentos gráficos acelerados por GPU.',
    challenge:
      'Combinar tipografia clássica em grande escala e shaders WebGL2 mantendo 60 FPS estáveis e acessibilidade completa por teclado e leitores de tela.',
    architecture: [
      'Sistema tipográfico fluido com escalas proporcionais e grid suíço de 12 colunas.',
      'Shaders GLSL modulares com degradação graciosa para dispositivos com restrição de GPU ou preferência por movimento reduzido.',
      'Pipeline automatizado de publicação estática otimizado para CDN global e GitHub Pages.',
    ],
    stack: ['React', 'TypeScript', 'WebGL2 / GLSL', 'Vite', 'Tailwind CSS', 'GitHub Actions'],
    metrics: [
      { label: 'Taxa de Quadros (WebGL2)', value: '60 FPS' },
      { label: 'Bundle Inicial Comprimido', value: '48 KB' },
      { label: 'Acessibilidade (a11y)', value: '100 / 100' },
    ],
    repoSlug: 'studio-editorial-system',
    livePreviewDomain: 'studio-a.dev',
  },
];

export const GROK_FIX_CHECKLIST: AuditFixItem[] = [
  {
    id: 'fix-paths',
    title: 'Caminhos Relativos e Estrutura de Pastas para GitHub Pages',
    grokProblem:
      'O index.html antigo buscava ./assets/spa-DGKlMq2Z.js e ./work/*.jpg, mas o README mandava enviar os arquivos soltos na raiz, gerando erro 404 em produção.',
    fixedSolution:
      'Configurado base: "./" no Vite e espelhamento automático dos assets em /public/ e /public/work/ para funcionar em qualquer repositório (usuario.github.io/repo).',
    filePath: 'vite.config.ts & public/',
  },
  {
    id: 'fix-wheel',
    title: 'Roda Orbital de Projetos Sem Travamento de Scroll',
    grokProblem:
      'O GSAP ScrollTrigger usava pin: true com !min-h-0, travando a rolagem da página, cortando os cards no hover e exibindo o título com erro de digitação ("Potret dos projetos").',
    fixedSolution:
      'Geometria orbital determinística em React/TypeScript com rotação por arraste, botões, teclado e clique direto, além de alternância para Grade Editorial.',
    filePath: 'src/components/RadialWheelGallery.tsx',
  },
  {
    id: 'fix-links',
    title: 'Estudos de Caso Reais no Lugar de Links Placeholder Quebrados',
    grokProblem:
      'Clicar nos projetos abria URLs falsas (https://seu-site-1.vercel.app) que levavam a páginas inexistentes.',
    fixedSolution:
      'Modal completo de Estudo de Caso com arquitetura detalhada, métricas reais, stack técnica e prévia interativa de cada projeto.',
    filePath: 'src/components/ProjectModal.tsx',
  },
  {
    id: 'fix-shader',
    title: 'Shader WebGL2 Liquid Glass Desminificado e Resiliente',
    grokProblem:
      'Código único minificado de 100 KB impossível de editar, sem fallback caso o contexto WebGL2 falhasse.',
    fixedSolution:
      'Componente GlassIconReveal em TypeScript limpo com física de mola (spring), controle de ângulo de luz, botão de replay e fallback automático.',
    filePath: 'src/components/GlassIconReveal.tsx',
  },
  {
    id: 'fix-ci',
    title: 'Workflow GitHub Actions Pronto para Publicação Automática',
    grokProblem:
      'Não havia pipeline de build nem código-fonte editável — apenas bundles já compilados com hashes fixos.',
    fixedSolution:
      'Adicionado .github/workflows/deploy.yml oficial e exportador de index.html autocontido direto na interface.',
    filePath: '.github/workflows/deploy.yml',
  },
];

/**
 * Normalizes any angle in degrees into the [-180, 180) interval.
 */
export function normalizeAngleDeg(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  let normalized = ((angle + 180) % 360 + 360) % 360 - 180;
  if (Object.is(normalized, -0)) normalized = 0;
  return normalized;
}

/**
 * Computes the layout for a card on the radial wheel gallery.
 * Angle -90 deg corresponds to the 12 o'clock apex position.
 */
export function computeWheelItemLayout(
  index: number,
  totalItems: number,
  wheelRotationDeg: number,
  radiusPx: number
): WheelItemLayout {
  const safeTotal = Math.max(1, totalItems);
  const safeRadius = Math.max(1, radiusPx);
  const stepDeg = 360 / safeTotal;

  // Item 0 starts at -90 deg (top center apex) when wheelRotationDeg === 0
  const rawAngleDeg = index * stepDeg - 90 + wheelRotationDeg;
  const angleRad = (rawAngleDeg * Math.PI) / 180;

  const x = Number((safeRadius * Math.cos(angleRad)).toFixed(2));
  const y = Number((safeRadius * Math.sin(angleRad)).toFixed(2));

  // Distance in degrees from the 12 o'clock apex (-90 deg)
  const deltaFromApex = normalizeAngleDeg(rawAngleDeg - -90);
  const distanceFromApexDeg = Math.abs(deltaFromApex);

  const isApex = distanceFromApexDeg <= stepDeg * 0.35;

  // Smooth scale and opacity falloff based on angular distance from top apex
  const normalizedDist = Math.min(1, distanceFromApexDeg / 180);
  const scale = Number((1.04 - normalizedDist * 0.22).toFixed(3));
  const opacity = Number((1 - normalizedDist * 0.55).toFixed(3));
  const zIndex = Math.round(100 - normalizedDist * 80);

  return {
    index,
    angleDeg: rawAngleDeg,
    x,
    y,
    tangentRotationDeg: Number(( deltaFromApex * 0.32 ).toFixed(2)),
    distanceFromApexDeg: Number(distanceFromApexDeg.toFixed(2)),
    isApex,
    scale,
    opacity,
    zIndex,
  };
}

/**
 * Returns the index [0, totalItems - 1] of the item closest to the 12 o'clock apex (-90 deg).
 */
export function getActiveWheelIndex(totalItems: number, wheelRotationDeg: number): number {
  if (totalItems <= 1) return 0;
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < totalItems; i++) {
    const layout = computeWheelItemLayout(i, totalItems, wheelRotationDeg, 100);
    if (layout.distanceFromApexDeg < bestDistance) {
      bestDistance = layout.distanceFromApexDeg;
      bestIndex = i;
    }
  }
  return bestIndex;
}

/**
 * Calculates the nearest wheel rotation (in degrees) that places `targetIndex` at the 12 o'clock apex.
 */
export function getShortestTargetRotation(
  currentRotationDeg: number,
  targetIndex: number,
  totalItems: number
): number {
  if (totalItems <= 1) return 0;
  const stepDeg = 360 / totalItems;
  // To place targetIndex at -90 deg: targetIndex * stepDeg - 90 + rotation = -90 (mod 360)
  // => rotation = -targetIndex * stepDeg (mod 360)
  const desiredBase = -targetIndex * stepDeg;
  const delta = normalizeAngleDeg(desiredBase - currentRotationDeg);
  return Number((currentRotationDeg + delta).toFixed(2));
}

/**
 * Filters projects by category or returns all when 'Todos' is selected.
 */
export function filterProjects(
  projects: ProjectItem[],
  category: ProjectCategory | 'Todos'
): ProjectItem[] {
  if (category === 'Todos') return projects;
  return projects.filter((project) => project.category === category);
}

/**
 * Evaluates a damped harmonic spring curve from 0 to 1 at time `t` (seconds).
 * Mirrors the optical reveal physics from the Liquid Glass icon shader.
 */
export function evaluateSpring(t: number, response: number, bounce: number): number {
  if (t <= 0) return 0;
  const clampedBounce = Math.min(Math.max(bounce, -0.95), 0.95);
  const dampingRatio = 1 - clampedBounce;
  const omega = (2 * Math.PI) / Math.max(0.05, response);
  const decay = Math.exp(-dampingRatio * omega * t);

  let value: number;
  if (dampingRatio < 1) {
    const dampedFreq = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
    value =
      1 -
      decay *
        (Math.cos(dampedFreq * t) +
          ((dampingRatio * omega) / dampedFreq) * Math.sin(dampedFreq * t));
  } else {
    value = 1 - decay * (1 + omega * t);
  }
  return Number(value.toFixed(5));
}

/**
 * Generates a complete, self-contained HTML file with relative paths ready for GitHub Pages root upload.
 */
export function generateGitHubPagesStandaloneHtml(
  profile: DeveloperProfile,
  projects: ProjectItem[]
): string {
  const projectCardsHtml = projects
    .map(
      (p) => `
        <article class="project-card">
          <div class="project-img-wrap">
            <img src="${p.ghPagesImage}" onerror="this.src='${p.image}'" alt="${p.title}" loading="lazy" />
          </div>
          <div class="project-body">
            <div class="project-meta">${p.indexLabel} · ${p.category} · ${p.year}</div>
            <h3>${p.title}</h3>
            <p class="project-sub">${p.subtitle}</p>
            <p class="project-desc">${p.summary}</p>
            <div class="project-stack">${p.stack.join(' · ')}</div>
          </div>
        </article>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${profile.name} — Portfólio</title>
  <meta name="description" content="Portfólio de ${profile.name} — ${profile.role}." />
  <meta property="og:title" content="${profile.name} — Portfólio" />
  <meta property="og:description" content="${profile.bioLead}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="./og.jpg" />
  <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Lora:ital,wght@0,600;1,400&display=swap" rel="stylesheet" />
  <style>
    :root { --bg: #F4F6FA; --ink: #101B2D; --cobalt: #2563EB; --amber: #F5B942; --muted: #4A5B75; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header { display: flex; justify-content: space-between; align-items: center; padding: 24px 0; border-bottom: 1px solid rgba(16,27,45,0.1); }
    nav a { color: var(--ink); text-decoration: none; margin-left: 28px; font-weight: 500; font-size: 14px; }
    nav a:hover { color: var(--cobalt); }
    .hero { padding: 96px 0 72px; border-bottom: 1px solid rgba(16,27,45,0.1); }
    .kicker { font-family: 'JetBrains Mono', monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: var(--cobalt); }
    h1 { font-family: 'Lora', serif; font-size: clamp(2.5rem, 6vw, 4.75rem); line-height: 1.05; margin: 16px 0 24px; }
    .lead { font-size: 1.2rem; max-width: 65ch; color: var(--muted); }
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; padding: 64px 0; }
    .project-card { background: #fff; border: 1px solid rgba(16,27,45,0.08); border-radius: 16px; overflow: hidden; }
    .project-img-wrap { aspect-ratio: 16/10; overflow: hidden; background: #101B2D; }
    .project-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .project-body { padding: 24px; }
    .project-meta, .project-stack { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cobalt); margin-bottom: 8px; }
    .project-body h3 { font-family: 'Lora', serif; font-size: 1.5rem; margin-bottom: 6px; }
    .project-sub { font-weight: 600; font-size: 0.95rem; margin-bottom: 10px; }
    .project-desc { color: var(--muted); font-size: 0.92rem; margin-bottom: 16px; }
    footer { background: var(--ink); color: #F4F6FA; padding: 72px 0; margin-top: 64px; }
    footer a { color: var(--amber); text-decoration: none; margin-right: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <strong>${profile.name}</strong>
      <nav>
        <a href="#sobre">Perfil</a>
        <a href="#projetos">Projetos</a>
        <a href="#contato">Contato</a>
      </nav>
    </header>
    <section class="hero" id="sobre">
      <div class="kicker">${profile.role} · ${profile.location}</div>
      <h1>${profile.name}</h1>
      <p class="lead">${profile.bioLead}</p>
    </section>
    <section id="projetos">
      <div class="projects-grid">
        ${projectCardsHtml}
      </div>
    </section>
  </div>
  <footer id="contato">
    <div class="container">
      <h2 style="font-family: 'Lora', serif; font-size: 2rem; margin-bottom: 16px;">Vamos conversar?</h2>
      <p style="margin-bottom: 24px; opacity: 0.8;">${profile.availability}</p>
      <div>
        <a href="mailto:${profile.email}">${profile.email}</a>
        <a href="${profile.githubUrl}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="${profile.linkedinUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
