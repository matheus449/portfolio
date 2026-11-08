# Portfólio — Matheus Oliveira (Desenvolvedor Full-Stack)

Portfólio pessoal de **Matheus Oliveira**, reconstruído com código-fonte limpo em React + TypeScript + Tailwind CSS, caminhos relativos (`./`) compatíveis com qualquer repositório do **GitHub Pages**, animações corrigidas (**Liquid Glass WebGL2** no monograma MO e **Roda Orbital de Projetos** sem travamentos de scroll) e modal de estudo de caso para cada projeto.

---

## O que foi corrigido em relação à versão gerada pelo Grok

1. **Caminhos de arquivos quebrados (`404 Not Found` no GitHub Pages)**
   - O `index.html` antigo apontava para `./assets/spa-*.js` e `./work/*.jpg`, mas instruía subir os arquivos soltos na raiz.
   - Agora o projeto tem `base: './'` configurado no Vite e todos os assets organizados tanto em `/public/assets/aistudio/` quanto na raiz `/public/` (`favicon.svg`, `logo-mo.png`, `logo-lockup.png`, `og.jpg` e `work/*.jpg`).
2. **Roda da Galeria (`RadialWheelGallery`) corrigida**
   - Removido o `ScrollTrigger` com `pin: true` e `!min-h-0` que travava a rolagem da página e cortava os cards no hover.
   - Corrigido o erro de digitação `"Potret dos projetos"` para **"Portfólio de Projetos"**.
   - Adicionada rotação fluida por **arraste (drag)**, **botões Anterior/Próximo**, **teclado (setas)**, **clique direto no card**, filtros por categoria (`Todos`, `SaaS`, `E-commerce`, `Mobile`, `Editorial`) e alternância entre **Roda Orbital** e **Grade Editorial**.
3. **Estudos de Caso Interativos (Sem links quebrados `seu-site-1.vercel.app`)**
   - Clicar em qualquer projeto abre um modal completo com visão geral, arquitetura técnica, métricas de impacto e prévia da interface.
4. **Liquid Glass Logo (`GlassIconReveal`) em código limpo**
   - Shader WebGL2 SDF com refração óptica reconstruído em TypeScript legível (`src/components/GlassIconReveal.tsx`), com botão para repetir a animação e ajuste de iluminação em tempo real.
5. **Exportador GitHub Pages Integrado**
   - Pelo botão **"GitHub Pages"** no topo do site, você pode personalizar seus links (GitHub, LinkedIn, Email, WhatsApp/X) e baixar um `index.html` estático autocontido ou seguir o deploy automático via GitHub Actions.

---

## Como publicar no GitHub Pages

### Opção A — Automático com GitHub Actions (Recomendado)
Este projeto já inclui o arquivo `.github/workflows/deploy.yml`:
1. Crie um repositório no GitHub (ex: `matheus-portfolio` ou `seu-usuario.github.io`).
2. Envie todos os arquivos deste projeto para a branch `main`.
3. No GitHub, acesse **Settings → Pages** e em **Build and deployment > Source**, selecione **GitHub Actions**.
4. A cada `git push`, o GitHub compilará o projeto (`npm run build`) e publicará automaticamente a pasta `dist/`.

### Opção B — Subir apenas os arquivos prontos (Sem precisar rodar Node.js)
1. Clique no botão **"Pronto p/ GitHub Pages"** no canto superior direito do portfólio.
2. Personalize seus links de redes sociais se desejar.
3. Clique em **"Baixar index.html Pronto"** ou suba o conteúdo da pasta `dist/` diretamente na raiz do seu repositório.
