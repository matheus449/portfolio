import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GlassIconReveal } from './components/GlassIconReveal';
import { RadialScrollGallery } from './components/RadialScrollGallery';

const PROJECTS = [
  {
    title: 'Organiza-Me',
    description: 'Organize sua rotina com leveza e acompanhe suas tarefas do dia.',
    href: 'https://organizame-pi.vercel.app/#inicio',
    code: 'https://github.com/matheus449/organizame',
    image: './work/organizame-cover.webp',
  },
  {
    title: 'OVERCLOCKED',
    description: 'Simulador de TI para explorar a rotina de suporte em uma empresa.',
    href: 'https://over-clocked-phi.vercel.app/',
    code: 'https://github.com/matheus449/OverClockedII',
    image: './work/overclocked-cover.webp',
  },
];

function Badge({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <>
      <header className="nav">
        <a className="logo" href="#topo">
          <img src="./logo-mo.png" alt="Matheus Oliveira" />
        </a>
        <nav>
          <a href="#perfil">Perfil</a>
          <a href="#galeria">Galeria</a>
          <a href="#contato">Contato</a>
        </nav>
      </header>

      <main id="topo">
        <section className="hero">
          <GlassIconReveal
            className="glass-mark"
            logo="./logo-mo.png"
            look="dark"
            background="#101b2d"
            logoColor="#f4f6fa"
            plateColor="#101b2d"
            iconPlate={false}
            label="Matheus Oliveira"
            tileSize={720}
            logoScale={0.95}
            loop={true}
          />
          <p className="kicker">マテウス オリベイラ</p>
          <h1>
            Matheus
            <br />
            Oliveira
          </h1>
          <p className="role">Desenvolvedor</p>
        </section>

        <div className="ticker" aria-hidden="true">
          <div className="ticker-track">
            <span>
              Organiza-Me · OVERCLOCKED · React · TypeScript ·{' '}
            </span>
            <span>
              Organiza-Me · OVERCLOCKED · React · TypeScript ·{' '}
            </span>
          </div>
        </div>

        <section id="perfil" className="sheet">
          <div className="wrap split">
            <p className="index">01 — Perfil</p>
            <div className="portrait">
              <img src="./matheus-profile.jpeg" alt="Matheus Oliveira" loading="lazy" />
            </div>
            <div>
              <h2>
                Olá, eu sou
                <br />
                <em>Matheus Oliveira</em>
              </h2>
              <p className="lede">
                Desenvolvedor focado em produtos digitais com atenção aos detalhes.
                Código bom some: a interface fica clara e o sistema aguenta o uso
                real.
              </p>
              <dl className="facts">
                <div>
                  <dt>Nome</dt>
                  <dd>Matheus Oliveira</dd>
                </div>
                <div>
                  <dt>Área</dt>
                  <dd>Full stack</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Disponível</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="galeria" className="sheet sheet-wheel">
          <div className="wrap">
            <p className="index">02 — Galeria</p>
            <h2>
              Projetos
              <br />
              <em>em destaque</em>
            </h2>
            <p className="hint">Role para girar a roda.</p>
          </div>
          <RadialScrollGallery
            className="!min-h-0"
            baseRadius={460}
            mobileRadius={168}
            visiblePercentage={48}
            scrollDuration={2200}
            onItemSelect={(index) => {
              const item = PROJECTS[index % PROJECTS.length];
              const a = document.createElement('a');
              a.href = item.href;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.click();
            }}
          >
            {(hoveredIndex) =>
              [...PROJECTS, ...PROJECTS].map((item, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <div
                    key={`${item.title}-${idx}`}
                    className="relative h-[200px] w-[148px] overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:h-[300px] sm:w-[220px]"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                        isHovered ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <Badge className="bg-paper/90 px-2 py-0 text-[10px] text-ink backdrop-blur">
                          {item.title}
                        </Badge>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white transition-all duration-500 ${
                            isHovered
                              ? 'rotate-0 opacity-100'
                              : '-rotate-45 opacity-0'
                          }`}
                        >
                          <ArrowUpRight size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </RadialScrollGallery>
        </section>

        <section id="contato" className="contact">
          <div className="wrap">
            <p className="index">03 — Contato</p>
            <h2>
              Obrigado por
              <br />
              <em>passar</em>
            </h2>
            <div className="links">
              <a
                href="https://github.com/seunome"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/seunome"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a href="mailto:seu@email.com">Email</a>
              <a href="https://x.com/seunome" target="_blank" rel="noreferrer">
                X
              </a>
            </div>
            <img
              className="lockup"
              src="./logo-lockup.png"
              alt="Matheus Oliveira"
            />
          </div>
        </section>
      </main>
    </>
  );
}
