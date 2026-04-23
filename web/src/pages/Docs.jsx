import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

// ── shared primitives ──────────────────────────────────────────────────────

function Code({ children, lang = '' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(children.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative group my-3">
      <pre className="overflow-x-auto rounded-lg px-4 py-3 text-xs leading-relaxed font-mono
        bg-gray-900 text-gray-100 dark:bg-black dark:text-gh-text border border-gray-700 dark:border-gh-border">
        {lang && (
          <span className="absolute top-2 left-3 text-[10px] text-gray-500 uppercase tracking-widest select-none">
            {lang}
          </span>
        )}
        <code className={lang ? 'block pt-4' : ''}>{children.trim()}</code>
      </pre>
      <button onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
          px-2 py-1 text-[10px] rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
        {copied ? '✓ copiado' : 'copiar'}
      </button>
    </div>
  )
}

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono
      bg-gray-100 text-gray-700 border border-gray-300
      dark:bg-gh-surface dark:text-gh-muted dark:border-gh-border">
      {children}
    </kbd>
  )
}

function Badge({ children, color = 'gray' }) {
  const c = {
    gray:   'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gh-border/50 dark:text-gh-muted dark:border-gh-border',
    blue:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-gh-blue/10 dark:text-gh-blue dark:border-gh-blue/30',
    green:  'bg-green-50 text-green-700 border-green-200 dark:bg-gh-green/10 dark:text-gh-green dark:border-gh-green/30',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-gh-orange/10 dark:text-gh-orange dark:border-gh-orange/30',
    red:    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-gh-red dark:border-gh-red/30',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
  }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold border ${c[color]}`}>
      {children}
    </span>
  )
}

function Method({ m }) {
  const c = { GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red' }
  return <Badge color={c[m] ?? 'gray'}>{m}</Badge>
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-20 mb-12">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gh-text mb-4 pb-2
        border-b border-gray-200 dark:border-gh-border">{title}</h2>
      {children}
    </section>
  )
}

function Sub({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-20 mb-8">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gh-text mb-3">{title}</h3>
      {children}
    </div>
  )
}

function P({ children }) {
  return <p className="text-sm text-gray-600 dark:text-gh-muted leading-relaxed mb-3">{children}</p>
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gh-border my-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gh-dark/50 border-b border-gray-200 dark:border-gh-border">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase
                tracking-wide text-gray-500 dark:text-gh-muted whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gh-border/50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gh-border/10">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Endpoint({ method, path, auth = true, desc, body, response, note }) {
  return (
    <div className="mb-5 rounded-lg border overflow-hidden bg-white dark:bg-gh-surface
      border-gray-200 dark:border-gh-border">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gh-border
        bg-gray-50 dark:bg-gh-dark/50 flex-wrap gap-y-1">
        <Method m={method} />
        <code className="text-sm font-mono text-gray-800 dark:text-gh-text">{path}</code>
        <span className="ml-auto text-xs font-medium whitespace-nowrap">
          {auth
            ? <span className="text-amber-600 dark:text-amber-400">🔒 requer token</span>
            : <span className="text-green-600 dark:text-gh-green">🌐 público</span>
          }
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-sm text-gray-600 dark:text-gh-muted">{desc}</p>
        {note && (
          <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20
            rounded px-2 py-1">{note}</p>
        )}
        {body && <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gh-muted">Body (JSON)</p>
          <Code lang="json">{body}</Code>
        </>}
        {response && <>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gh-muted">Resposta</p>
          <Code lang="json">{response}</Code>
        </>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — GUIA DO USUÁRIO
// ══════════════════════════════════════════════════════════════════════════

function UserGuide({ isAdmin }) {
  return (
    <div>

      <Section id="intro" title="Introducao">
        <P>
          O <strong>ShieldForce Commands</strong> e um sistema pessoal para armazenar, organizar
          e recuperar comandos de terminal e tarefas estruturadas. Acesse pelo browser com os mesmos
          atalhos do cliente de terminal.
        </P>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {[
            { icon: '⬡', color: 'text-blue-600 dark:text-gh-blue',   title: 'Comando',
              desc: 'Uma instrucao de terminal, script ou one-liner para copiar e executar.' },
            { icon: '◆', color: 'text-orange-500 dark:text-gh-orange', title: 'Tarefa',
              desc: 'Um procedimento detalhado com passos, Markdown, links e blocos de codigo.' },
          ].map((t) => (
            <div key={t.title} className="rounded-lg border p-4 bg-white border-gray-200
              dark:bg-gh-surface dark:border-gh-border">
              <span className={`text-xl ${t.color}`}>{t.icon}</span>
              <p className="font-semibold text-sm text-gray-900 dark:text-gh-text mt-1 mb-1">{t.title}</p>
              <p className="text-xs text-gray-500 dark:text-gh-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="roles" title="Niveis de acesso (Roles)">
        <P>Ao criar uma conta voce recebe automaticamente o nivel <strong>User</strong>.
        O nivel pode ser alterado por um administrador.</P>
        <Table
          headers={['Role', 'O que pode fazer']}
          rows={[
            [<Badge color="blue">User</Badge>,
              'Ver, criar, editar e deletar seus proprios comandos e tarefas.'],
            [<Badge color="orange">admin</Badge>,
              'Tudo do User, mais: ver todos os comandos, gerenciar usuarios, roles e permissoes, acessar documentacao tecnica e API.'],
            [<Badge color="red">SA</Badge>,
              'Acesso total sem restricoes. Deleta usuarios e roles. Mesmo acesso do admin, mas sem checagem de permissao.'],
          ]}
        />
      </Section>

      <Section id="acesso" title="Acesso">
        <Sub id="login" title="Login">
          <P>Acesse <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">/login</code>.
          Informe email e senha. O token de sessao fica salvo no navegador e e enviado automaticamente
          em todas as requisicoes.</P>
        </Sub>
        <Sub id="registro" title="Registro">
          <P>Acesse <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">/register</code>.
          Preencha nome, email e senha (minimo 4 caracteres, confirmacao obrigatoria).
          Apos o cadastro voce ganha o nivel <Badge color="blue">User</Badge> e ja pode fazer login.</P>
        </Sub>
        <Sub id="recuperacao" title="Recuperacao de senha">
          <P>Clique em <strong>Esqueceu?</strong> na tela de login. Informe seu email — um link
          de recuperacao sera enviado. O link expira em 1 hora.</P>
        </Sub>
      </Section>

      <Section id="interface" title="Interface">
        <Sub id="header-ui" title="Barra superior">
          <Table
            headers={['Elemento', 'Funcao']}
            rows={[
              ['Campo de busca', 'Filtra por titulo, descricao ou grupo em tempo real (atalho /)'],
              ['Seletor de tipo', 'Filtra entre Todos / Comandos / Tarefas'],
              [<>Icone <strong>⚙</strong> (admin/SA)</>, 'Abre o painel de administracao'],
              ['Icone de pagina', 'Abre a documentacao'],
              ['Icone ? ', 'Painel de atalhos de teclado'],
              ['Sol / Lua', 'Alterna entre tema claro e escuro (salvo no navegador)'],
              ['Seta de saida', 'Encerra a sessao (logout)'],
            ]}
          />
        </Sub>
        <Sub id="grupos-ui" title="Abas de grupo">
          <P>Logo abaixo do header ficam as abas de grupo com o numero de itens em cada uma.
          Clique ou navegue pelo teclado para filtrar a lista. <strong>Todos</strong> exibe tudo.
          Os grupos sao criados automaticamente ao cadastrar um item com um novo nome de grupo.</P>
          <Table
            headers={['Acao', 'Teclado']}
            rows={[
              ['Entrar nas abas', <><Kbd>Tab</Kbd> ate chegar nas abas</>],
              ['Proxima aba', <Kbd>→</Kbd>],
              ['Aba anterior', <Kbd>←</Kbd>],
              ['Primeira aba (Todos)', <Kbd>Home</Kbd>],
              ['Ultima aba', <Kbd>End</Kbd>],
              ['Selecionar', <><Kbd>Enter</Kbd> ou <Kbd>Space</Kbd></>],
            ]}
          />
        </Sub>
        <Sub id="lista-ui" title="Lista de itens">
          <P>Cada item exibe: ID (4 digitos), grupo, tipo (<Badge color="blue">⬡ cmd</Badge> ou{' '}
          <Badge color="orange">◆ task</Badge>), titulo e primeira linha da descricao.
          O item selecionado e destacado com borda colorida na esquerda.</P>
          <P>Pressione <Kbd>Enter</Kbd> ou <strong>clique duas vezes</strong> em um item para
          abrir a visualizacao completa.</P>
        </Sub>
      </Section>

      <Section id="atalhos" title="Atalhos de teclado">
        <P>O sistema e totalmente operavel pelo teclado. Abaixo a referencia completa.</P>

        <Sub id="atalhos-lista" title="Na lista">
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<><Kbd>j</Kbd> / <Kbd>↓</Kbd></>, 'Proximo item'],
              [<><Kbd>k</Kbd> / <Kbd>↑</Kbd></>, 'Item anterior'],
              [<Kbd>Enter</Kbd>, 'Abrir visualizacao completa'],
              [<Kbd>g</Kbd>, 'Abrir seletor de grupo'],
              [<Kbd>n</Kbd>, 'Novo item'],
              [<Kbd>e</Kbd>, 'Editar item selecionado'],
              [<Kbd>d</Kbd>, 'Deletar (abre confirmacao)'],
              [<Kbd>c</Kbd>, 'Copiar titulo para o clipboard'],
              [<Kbd>/</Kbd>, 'Abrir barra de busca'],
              [<Kbd>ESC</Kbd>, 'Fechar busca / limpar filtro'],
              [<Kbd>?</Kbd>, 'Painel de atalhos'],
            ]}
          />
        </Sub>

        <Sub id="atalhos-grupos" title="No seletor de grupo (g)">
          <P>Pressione <Kbd>g</Kbd> na lista para abrir o seletor rapido de grupo.
          Digite para filtrar, navegue com setas e pressione Enter para selecionar.
          As abas visiveis no topo tambem sao navegaveis pelo teclado quando focadas.</P>
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<Kbd>g</Kbd>, 'Abrir seletor (de qualquer lugar na lista)'],
              [<><Kbd>↑</Kbd> / <Kbd>↓</Kbd></>, 'Navegar entre grupos no seletor'],
              [<Kbd>Enter</Kbd>, 'Selecionar grupo destacado'],
              [<Kbd>ESC</Kbd>, 'Fechar sem selecionar'],
              [<><Kbd>←</Kbd> / <Kbd>→</Kbd> nas abas</>, 'Navegar entre abas de grupo visiveis'],
              [<><Kbd>Home</Kbd> / <Kbd>End</Kbd></>, 'Primeira / ultima aba'],
            ]}
          />
        </Sub>

        <Sub id="atalhos-view" title="Na visualizacao completa (Enter)">
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<Kbd>Tab</Kbd>, 'Navegar entre botoes (Copiar / Editar / Fechar)'],
              [<Kbd>E</Kbd>, 'Editar o item'],
              [<Kbd>ESC</Kbd>, 'Fechar'],
            ]}
          />
        </Sub>

        <Sub id="atalhos-modal" title="No modal de criar / editar">
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<Kbd>Tab</Kbd>, 'Avancar entre campos'],
              [<><Kbd>Shift</Kbd>+<Kbd>Tab</Kbd></>, 'Voltar ao campo anterior'],
              [<><Kbd>←</Kbd> / <Kbd>→</Kbd></>, 'Alternar tipo (Comando / Tarefa) quando o campo Tipo esta focado'],
              [<><Kbd>Ctrl</Kbd>+<Kbd>S</Kbd></>, 'Salvar'],
              [<Kbd>ESC</Kbd>, 'Cancelar e fechar'],
            ]}
          />
        </Sub>

        <Sub id="atalhos-confirm" title="No modal de confirmacao (deletar)">
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<><Kbd>←</Kbd> / <Kbd>→</Kbd></>, 'Alternar entre Cancelar e Confirmar'],
              [<Kbd>Tab</Kbd>, 'Avancar entre os botoes'],
              [<Kbd>Enter</Kbd>, 'Ativar botao focado'],
              [<Kbd>ESC</Kbd>, 'Cancelar (sempre)'],
            ]}
          />
          <P>O foco inicia no botao <strong>Cancelar</strong> por seguranca — pressionar Enter
          sem navegar nao confirma a exclusao acidentalmente.</P>
        </Sub>
      </Section>

      <Section id="gerenciar" title="Criar e editar itens">
        <Sub id="novo-item" title="Novo item">
          <P>Pressione <Kbd>n</Kbd> ou clique em <strong>+ Novo</strong> no rodape. O modal possui:</P>
          <Table
            headers={['Campo', 'Descricao', 'Teclado']}
            rows={[
              ['Grupo', 'Selecione um existente ou crie um novo. Organiza nas abas.', 'Tab para chegar, digitar filtra'],
              ['Titulo', 'Nome curto. E o que e copiado com a tecla C.', 'Tab'],
              ['Tipo', 'Comando ou Tarefa.', <><Kbd>←</Kbd><Kbd>→</Kbd> apos focar com Tab</>],
              ['Descricao', 'Corpo do item com editor rico.', 'Tab, barra de ferramentas clicavel'],
            ]}
          />
        </Sub>

        <Sub id="editor-rico" title="Editor de descricao (rich text)">
          <P>O editor suporta formatacao completa via barra de ferramentas ou atalhos do proprio editor:</P>
          <Table
            headers={['Elemento', 'Como inserir']}
            rows={[
              ['Negrito, italico, sublinhado', 'Botoes na barra ou Ctrl+B / Ctrl+I / Ctrl+U'],
              ['Titulos H1, H2, H3', 'Botoes H1/H2/H3 na barra'],
              ['Listas com marcadores / numeradas', 'Botoes • e 1. na barra'],
              ['Citacao (blockquote)', 'Botao " na barra'],
              ['Codigo inline / bloco', 'Botoes ` e </> na barra'],
              ['Link', 'Botao 🔗 — abre dialogo para colar a URL'],
              ['Imagem', 'Botao 🖼 — abre dialogo para colar a URL da imagem'],
              ['Video (YouTube / Vimeo)', 'Botao ▶ — abre dialogo para colar a URL do video'],
              ['Linha horizontal', 'Botao — na barra'],
              ['Desfazer / Refazer', <><Kbd>Ctrl+Z</Kbd> / <Kbd>Ctrl+Y</Kbd></>],
            ]}
          />
        </Sub>

        <Sub id="visualizacao" title="Visualizacao completa">
          <P>Pressione <Kbd>Enter</Kbd> na lista ou <strong>clique duas vezes</strong> em qualquer
          item para abrir a visualizacao completa. O conteudo e exibido como artigo formatado,
          com imagens, videos e links renderizados. Comandos aparecem em bloco de terminal.</P>
          <P>Dentro da visualizacao: <Kbd>E</Kbd> abre a edicao diretamente,
          <Kbd>Tab</Kbd> navega entre os botoes do header, <Kbd>ESC</Kbd> fecha.</P>
        </Sub>

        <Sub id="busca-filtro" title="Busca e filtros">
          <P>A busca (<Kbd>/</Kbd>) filtra em tempo real por titulo, descricao e grupo.
          Com a busca aberta, <Kbd>↓</Kbd> sai do campo e navega pelos resultados.
          As abas de grupo e o seletor de tipo no header se combinam com a busca.</P>
        </Sub>
      </Section>

      {isAdmin && (
        <Section id="admin-panel" title="Painel de Administracao (admin / SA)">
          <P>Acessivel pelo icone ⚙ no header ou pela rota
          <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded ml-1">/admin</code>.
          Na lista principal, pressione <Kbd>r</Kbd> para ativar o modo de rota e depois
          <Kbd>1</Kbd>, <Kbd>2</Kbd> ou <Kbd>3</Kbd> para ir direto a cada aba.</P>

          <Sub id="admin-keys" title="Atalhos do painel">
            <Table
              headers={['Tecla', 'Acao', 'Contexto']}
              rows={[
                [<><Kbd>r</Kbd> + <Kbd>1</Kbd></>, 'Ir para Usuarios (da lista principal)', 'Lista'],
                [<><Kbd>r</Kbd> + <Kbd>2</Kbd></>, 'Ir para Roles (da lista principal)', 'Lista'],
                [<><Kbd>r</Kbd> + <Kbd>3</Kbd></>, 'Ir para Permissoes (da lista principal)', 'Lista'],
                [<Kbd>1</Kbd>, 'Trocar para aba Usuarios', 'Dentro do painel'],
                [<Kbd>2</Kbd>, 'Trocar para aba Roles', 'Dentro do painel'],
                [<Kbd>3</Kbd>, 'Trocar para aba Permissoes', 'Dentro do painel'],
                [<><Kbd>←</Kbd> / <Kbd>→</Kbd></>, 'Navegar abas (quando aba esta focada)', 'Dentro do painel'],
                [<><Kbd>j</Kbd> / <Kbd>k</Kbd></>, 'Navegar linhas da tabela', 'Usuarios / Roles'],
                [<Kbd>e</Kbd>, 'Editar linha selecionada', 'Usuarios / Roles'],
                [<Kbd>ESC</Kbd>, 'Cancelar edicao', 'Usuarios / Roles'],
                [<Kbd>n</Kbd>, 'Focar campo de nova role', 'Aba Roles (2)'],
                [<Kbd>r</Kbd>, 'Sincronizar permissoes com as rotas', 'Roles / Permissoes'],
                [<Kbd>/</Kbd>, 'Focar busca de permissao', 'Aba Permissoes (3)'],
              ]}
            />
          </Sub>

          <Sub id="admin-users" title="Aba Usuarios (1)">
            <P>Lista todos os usuarios com ID, nome, email, roles e data de cadastro.</P>
            <Table
              headers={['Acao', 'Quem pode', 'Como']}
              rows={[
                ['Ver lista', 'admin, SA', 'Aba aberta automaticamente'],
                ['Navegar linhas', 'admin, SA', <><Kbd>j</Kbd> / <Kbd>k</Kbd> ou clique</>],
                ['Editar roles', 'admin, SA', <><Kbd>e</Kbd> ou botao "Editar roles"</>],
                ['Deletar usuario', 'SA apenas', 'Botao "Deletar" (nao aparece para admin)'],
              ]}
            />
          </Sub>

          <Sub id="admin-roles" title="Aba Roles (2)">
            <P>Lista todas as roles. Crie novas, edite permissoes e sincronize com as rotas.</P>
            <Table
              headers={['Acao', 'Como']}
              rows={[
                ['Criar nova role', <><Kbd>n</Kbd> para focar o campo, digite o nome, Enter para criar</>],
                ['Editar permissoes', <><Kbd>e</Kbd> na role selecionada ou botao "Editar permissoes"</>],
                ['Sync rotas', <><Kbd>r</Kbd> ou botao "⟳ Sync rotas"</>],
                ['Deletar role', 'Botao "Deletar" (SA e User sao protegidas)'],
              ]}
            />
          </Sub>

          <Sub id="admin-perms" title="Aba Permissoes (3)">
            <P>Lista todas as permissoes (uma por rota protegida) com as roles que as possuem.</P>
            <Table
              headers={['Acao', 'Como']}
              rows={[
                ['Buscar permissao', <><Kbd>/</Kbd> para focar a busca, ESC para limpar</>],
                ['Filtrar por role', 'Seletor de role ao lado da busca'],
                ['Sync rotas', <><Kbd>r</Kbd> ou botao "⟳ Sync rotas"</>],
              ]}
            />
          </Sub>
        </Section>
      )}

      <Section id="tema-ui" title="Tema claro e escuro">
        <P>Clique no icone sol / lua no header. A preferencia e salva no navegador e
        persiste entre sessoes. Na primeira visita o tema segue a configuracao do sistema operacional.</P>
      </Section>

    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — REFERÊNCIA TÉCNICA
// ══════════════════════════════════════════════════════════════════════════

function TechDocs() {
  return (
    <div>

      <Section id="arch" title="Arquitetura">
        <Code lang="text">{`
  Internet
    │
  Cloudflare Tunnel
  ├── commands.abeiradocaos.com.br  →  localhost:7004  (Laravel 10 — API REST)
  └── app.abeiradocaos.com.br       →  localhost:7009  (React 18 SPA — Vite preview)
                                              │
                                    /api/*  →  proxy interno  →  localhost:7004
        `}</Code>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {[
            { title: 'Backend — Laravel 10 + PHP 8.5', items: ['Sanctum (Bearer token)', 'ACL + Roles middleware', 'EloquentFilter', 'Horizon (queues)', 'MySQL'] },
            { title: 'Frontend — React 18',            items: ['Vite 5 (build + preview)', 'Tailwind CSS 3 (dark mode)', 'React Router 6', 'Axios', 'Systemd user service'] },
          ].map((s) => (
            <div key={s.title} className="rounded-lg border p-4 bg-white border-gray-200
              dark:bg-gh-surface dark:border-gh-border">
              <p className="font-semibold text-sm text-gray-900 dark:text-gh-text mb-2">{s.title}</p>
              <ul className="space-y-1">
                {s.items.map((i) => (
                  <li key={i} className="text-xs text-gray-500 dark:text-gh-muted flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gh-border shrink-0" />{i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="rbac" title="Sistema de Roles e Permissoes (RBAC)">
        <P>As permissoes sao geradas automaticamente a partir das rotas do Laravel.
        Cada rota nomeada vira uma permissao. O middleware <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">roles:X</code> nas rotas
        define quais roles recebem aquela permissao no banco.</P>
        <Table
          headers={['Middleware na rota', 'Comportamento']}
          rows={[
            [<code className="text-xs font-mono">roles:all</code>, 'Todos os roles existentes recebem a permissao'],
            [<code className="text-xs font-mono">roles:SA,admin</code>, 'Apenas SA e admin recebem a permissao'],
            [<code className="text-xs font-mono">roles:SA</code>, 'Apenas SA recebe a permissao'],
            [<code className="text-xs font-mono">roles:null</code>, 'Nenhum role recebe (rota bloqueada para todos)'],
          ]}
        />
        <Sub id="rbac-flow" title="Fluxo de verificacao">
          <Code lang="text">{`Request
  → auth:sanctum  (token valido?)
  → AclMiddleware
      ├── role SA?    → passa (bypass total)
      ├── role admin? → passa (bypass total)
      └── outro?      → verifica se o token tem a ability da rota
                        e se o role do usuario tem essa permissao no DB`}</Code>
        </Sub>
        <Sub id="rbac-sync" title="Sincronizar permissoes">
          <P>Sempre que adicionar uma nova rota protegida, rode:</P>
          <Code lang="bash">{`# Via painel admin → Roles → botao "⟳ Sync rotas"
# Ou via artisan:
php artisan tinker --execute="App\\Services\\Routes\\SetRoutesService::run();"`}</Code>
        </Sub>
      </Section>

      <Section id="db" title="Banco de dados">
        <Sub id="schema-commands" title="Tabela: commands">
          <Table
            headers={['Coluna', 'Tipo', 'Nullable', 'Descricao']}
            rows={[
              [<code className="text-xs font-mono font-bold">id</code>,          <code className="text-xs font-mono text-purple-600 dark:text-purple-300">bigint</code>,                   'NO',  'Chave primaria auto-increment'],
              [<code className="text-xs font-mono font-bold">user_id</code>,     <code className="text-xs font-mono text-purple-600 dark:text-purple-300">bigint FK</code>,               'YES', 'Dono do item (null = item legado sem dono)'],
              [<code className="text-xs font-mono font-bold">title</code>,       <code className="text-xs font-mono text-purple-600 dark:text-purple-300">varchar(255)</code>,             'NO',  'Titulo do item'],
              [<code className="text-xs font-mono font-bold">description</code>, <code className="text-xs font-mono text-purple-600 dark:text-purple-300">text</code>,                    'NO',  'Corpo — suporta Markdown'],
              [<code className="text-xs font-mono font-bold">group</code>,       <code className="text-xs font-mono text-purple-600 dark:text-purple-300">varchar(255)</code>,             'NO',  'Grupo de classificacao'],
              [<code className="text-xs font-mono font-bold">type</code>,        <code className="text-xs font-mono text-purple-600 dark:text-purple-300">enum(command,task)</code>,      'YES', 'Tipo do item (padrao: command)'],
              [<code className="text-xs font-mono font-bold">created_at</code>,  <code className="text-xs font-mono text-purple-600 dark:text-purple-300">timestamp</code>,              'YES', 'Data de criacao'],
              [<code className="text-xs font-mono font-bold">updated_at</code>,  <code className="text-xs font-mono text-purple-600 dark:text-purple-300">timestamp</code>,              'YES', 'Data de atualizacao'],
            ]}
          />
        </Sub>
        <Sub id="schema-outros" title="Outras tabelas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ['users',                  'Usuarios — name, email, password, picture, client_id'],
              ['roles',                  'Roles — name (SA, admin, User, ...)'],
              ['users_roles',            'Vinculo N:N user ↔ role'],
              ['permissions',            'Permissoes — name = nome da rota Laravel'],
              ['permissions_roles',      'Vinculo N:N permission ↔ role'],
              ['personal_access_tokens', 'Tokens Sanctum com abilities'],
              ['password_resets',        'Tokens de recuperacao de senha'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-2 rounded-lg border px-3 py-2
                bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
                <code className="text-xs font-mono font-semibold text-blue-700 dark:text-gh-blue shrink-0">{t}</code>
                <span className="text-xs text-gray-500 dark:text-gh-muted">{d}</span>
              </div>
            ))}
          </div>
        </Sub>
      </Section>

      <Section id="env" title="Variaveis de ambiente (.env)">
        <Code lang="env">{`APP_URL=http://localhost:7004

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shieldforce
DB_USERNAME=root
DB_PASSWORD=

# Dominios aceitos pelo Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,app.abeiradocaos.com.br

MAIL_MAILER=smtp
MAIL_HOST=smtp.exemplo.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=`}</Code>
      </Section>

      <Section id="run-system" title="Como subir o sistema">
        <Sub id="run-dev" title="Desenvolvimento">
          <Code lang="bash">{`# Terminal 1 — Laravel API (porta 7004)
cd /home/alexandrefn/projects/shieldforce/prod/commands
php artisan serve --port=7004

# Terminal 2 — React com hot-reload (porta 5173)
cd web
npm run dev`}</Code>
        </Sub>
        <Sub id="run-prod" title="Producao">
          <Table
            headers={['Subdominio', 'Porta', 'Servico']}
            rows={[
              [<code className="text-xs font-mono text-blue-700 dark:text-gh-blue">commands.abeiradocaos.com.br</code>, '7004', 'Laravel — gerenciado pelo Herd Lite'],
              [<code className="text-xs font-mono text-blue-700 dark:text-gh-blue">app.abeiradocaos.com.br</code>,      '7009', 'React — systemd user service'],
            ]}
          />
        </Sub>
      </Section>

      <Section id="systemd" title="Servico permanente (systemd)">
        <P>O frontend e gerenciado como servico de usuario systemd.
        O Laravel e gerenciado pelo Herd Lite separadamente.</P>
        <Sub id="systemd-file" title="Arquivo do servico">
          <P>Em <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">~/.config/systemd/user/shieldforce-web.service</code>:</P>
          <Code lang="ini">{`[Unit]
Description=ShieldForce Web Frontend (Vite preview :7009)
After=network.target

[Service]
Type=simple
WorkingDirectory=/home/alexandrefn/projects/shieldforce/prod/commands/web
ExecStartPre=/home/alexandrefn/.asdf/shims/npm run build
ExecStart=/home/alexandrefn/.asdf/shims/npx vite preview
Restart=on-failure
RestartSec=5
Environment=PATH=/home/alexandrefn/.asdf/shims:/home/alexandrefn/.asdf/bin:/usr/local/bin:/usr/bin:/bin
Environment=HOME=/home/alexandrefn

[Install]
WantedBy=default.target`}</Code>
          <P>O <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">ExecStartPre</code> faz
          o build automaticamente antes de cada inicializacao.</P>
        </Sub>
        <Sub id="systemd-cmds" title="Comandos">
          <Table
            headers={['Acao', 'Comando']}
            rows={[
              ['Status',              <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">systemctl --user status shieldforce-web</code>],
              ['Logs em tempo real',  <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">journalctl --user -u shieldforce-web -f</code>],
              ['Reiniciar (deploy)',  <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">systemctl --user restart shieldforce-web</code>],
              ['Parar',               <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">systemctl --user stop shieldforce-web</code>],
              ['Habilitar no boot',   <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">systemctl --user enable shieldforce-web</code>],
            ]}
          />
          <P>O <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">loginctl enable-linger alexandrefn</code> garante que
          o servico suba mesmo sem sessao de usuario ativa.</P>
        </Sub>
        <Sub id="systemd-deploy" title="Deploy de nova versao">
          <Code lang="bash">{`# Um unico comando — o servico ja faz o build automaticamente
systemctl --user restart shieldforce-web

# Acompanhar o processo
journalctl --user -u shieldforce-web -f`}</Code>
        </Sub>
      </Section>

      <Section id="terminal-client" title="Cliente de terminal (Python TUI)">
        <P>Cliente interativo em <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">client/</code> que
        consome a mesma API REST com autenticacao por Bearer token. Interface no terminal com menus navegaveis,
        visualizador full-screen e atalhos de teclado.</P>

        <Sub id="terminal-requisitos" title="Requisitos">
          <Table
            headers={['Requisito', 'Versao minima', 'Verificar']}
            rows={[
              ['Python',  '3.10+', <Code lang="bash">{'python3 --version'}</Code>],
              ['pip',     'qualquer', <Code lang="bash">{'pip --version'}</Code>],
              ['Git',     'qualquer', <Code lang="bash">{'git --version'}</Code>],
            ]}
          />
        </Sub>

        <Sub id="terminal-instalacao" title="Instalacao">
          <P>1. Clone o repositorio (se ainda nao tiver feito):</P>
          <Code lang="bash">{`git clone https://github.com/Shieldforce/commands.git
cd commands`}</Code>
          <P>2. Instale as dependencias Python:</P>
          <Code lang="bash">{`cd client
pip install -r requirements.txt`}</Code>
          <P>3. Confirme que o executavel tem permissao:</P>
          <Code lang="bash">{'chmod +x commands-tui'}</Code>
          <P>4. Execute:</P>
          <Code lang="bash">{'./commands-tui'}</Code>
          <P>Na primeira execucao o cliente pede login ou criacao de conta. A sessao e salva em
          <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded mx-1">~/.config/shieldforce/session.json</code>
          e restaurada automaticamente nas proximas execucoes.</P>
        </Sub>

        <Sub id="terminal-atalhos" title="Atalhos de teclado">
          <Table
            headers={['Tecla', 'Acao']}
            rows={[
              [<Kbd>e</Kbd>,         'Editar comando selecionado'],
              [<Kbd>d</Kbd>,         'Deletar comando selecionado'],
              [<Kbd>c</Kbd>,         'Copiar descricao para clipboard'],
              [<Kbd>n</Kbd>,         'Criar novo comando'],
              [<Kbd>/</Kbd>,         'Abrir busca'],
              [<Kbd>?</Kbd>,         'Ajuda'],
              [<Kbd>q</Kbd>,         'Voltar / sair'],
              [<><Kbd>j</Kbd> / <Kbd>k</Kbd></>, 'Mover cursor (vim-style)'],
              [<><Kbd>↑</Kbd> / <Kbd>↓</Kbd></>, 'Mover cursor'],
              [<><Kbd>Ctrl</Kbd>+<Kbd>S</Kbd></>, 'Salvar edicao'],
              [<Kbd>Esc</Kbd>,       'Cancelar / fechar painel'],
            ]}
          />
        </Sub>

        <Sub id="terminal-arquivos" title="Estrutura dos arquivos">
          <Table
            headers={['Arquivo', 'Funcao']}
            rows={[
              [<code className="text-xs font-mono">commands-tui</code>, 'Script de entrada — chama main.py com python3'],
              [<code className="text-xs font-mono">main.py</code>,       'Menu interativo — login, registro, recuperacao, CRUD'],
              [<code className="text-xs font-mono">api.py</code>,        'Cliente HTTP — sessao salva em ~/.config/shieldforce/session.json'],
              [<code className="text-xs font-mono">tui_viewer.py</code>, 'Visualizador TUI (Textual) com atalhos de teclado'],
              [<code className="text-xs font-mono">ui.py</code>,         'Utilitarios Rich — tabelas, cores, parser de comandos'],
              [<code className="text-xs font-mono">requirements.txt</code>, 'Dependencias: rich, requests, InquirerPy'],
            ]}
          />
          <P>O cliente envia <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">client: "shieldforce"</code> em
          todas as requisicoes. O frontend web envia <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">client: "front"</code>.</P>
        </Sub>
      </Section>

    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — API EXTERNA
// ══════════════════════════════════════════════════════════════════════════

function ApiDocs() {
  const BASE = 'https://commands.abeiradocaos.com.br/api'

  return (
    <div>

      <Section id="api-overview" title="Visao geral">
        <P>A API do ShieldForce e uma REST API JSON protegida por Bearer token (Laravel Sanctum).
        Qualquer cliente HTTP pode consumi-la.</P>
        <Table
          headers={['Item', 'Valor']}
          rows={[
            ['Base URL', <code className="text-xs font-mono text-blue-700 dark:text-gh-blue">{BASE}</code>],
            ['Formato',  'JSON (Content-Type: application/json)'],
            ['Auth',     'Bearer token no header Authorization'],
            ['Versao',   'v1 (sem prefixo de versao na URL)'],
          ]}
        />
      </Section>

      <Section id="api-auth-section" title="Autenticacao">
        <Sub id="api-clients" title="Clientes permitidos">
          <P>O campo <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">client</code> identifica
          a origem da requisicao. Valores aceitos:</P>
          <div className="flex flex-wrap gap-2 my-2">
            {['postman', 'app', 'front', 'shieldforce'].map((c) => (
              <code key={c} className="text-xs font-mono px-2 py-1 rounded bg-gray-100
                text-gray-700 dark:bg-gh-border dark:text-gh-muted">{c}</code>
            ))}
          </div>
          <P>Use <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">app</code> ou
          <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded ml-1">postman</code> para
          integracao ou testes externos.</P>
        </Sub>

        <Sub id="api-get-token" title="Obter token (login)">
          <Endpoint
            method="POST" path="/api/login" auth={false}
            desc="Autentica o usuario e retorna o Bearer token."
            body={`{
  "email":    "usuario@exemplo.com",
  "password": "suasenha",
  "client":   "app"
}`}
            response={`{
  "type_token":   "Bearer",
  "access_token": "1|abc123...",
  "expires_at":   null,
  "user": {
    "id":          1,
    "name":        "Alexandre",
    "email":       "usuario@exemplo.com",
    "roles":       ["admin"],
    "permissions": ["api.command.index", "api.command.store", ...]
  }
}`}
          />
          <P>Use o <code className="text-xs bg-gray-100 dark:bg-gh-border px-1 rounded">access_token</code> em
          todas as requisicoes seguintes no header:</P>
          <Code lang="http">{`Authorization: Bearer 1|abc123...`}</Code>
          <P>Exemplo com cURL:</P>
          <Code lang="bash">{`curl -X POST ${BASE}/login \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"email":"voce@exemplo.com","password":"suasenha","client":"app"}'`}</Code>
        </Sub>

        <Sub id="api-verify" title="Verificar token">
          <Endpoint
            method="GET" path="/api/auth/verifyToken"
            desc="Verifica se o token e valido e retorna os dados do usuario autenticado com roles e permissoes."
            response={`{
  "access_token": "1|abc123...",
  "id":           1,
  "name":         "Alexandre",
  "email":        "usuario@exemplo.com",
  "roles":        ["User"],
  "permissions":  ["api.command.index", "api.command.store", "api.command.update", "api.command.delete"],
  "picture":      "https://commands.abeiradocaos.com.br/img/avatar.png",
  "created_at":   "1 hora atras",
  "updated_at":   "1 hora atras"
}`}
          />
        </Sub>

        <Sub id="api-logout" title="Logout">
          <Endpoint
            method="POST" path="/api/auth/logout"
            desc="Invalida o token atual. Apos este endpoint o token nao funciona mais."
            response={`{ "logout": true }`}
          />
          <Code lang="bash">{`curl -X POST ${BASE}/auth/logout \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Accept: application/json"`}</Code>
        </Sub>

        <Sub id="api-register" title="Registro">
          <Endpoint
            method="POST" path="/api/register" auth={false}
            desc="Cria uma nova conta. O usuario recebe automaticamente o role User."
            body={`{
  "name":                  "Alexandre",
  "email":                 "novo@exemplo.com",
  "password":              "minimo4",
  "password_confirmation": "minimo4",
  "client":                "app"
}`}
          />
        </Sub>

        <Sub id="api-forgot" title="Recuperacao de senha">
          <Endpoint
            method="POST" path="/api/resetPasswordSend" auth={false}
            desc="Envia email com link de recuperacao. O link expira em 1 hora."
            body={`{ "email": "usuario@exemplo.com" }`}
            response={`true`}
          />
          <Endpoint
            method="POST" path="/api/resetPassword" auth={false}
            desc="Redefine a senha usando o token recebido por email."
            body={`{
  "email":                 "usuario@exemplo.com",
  "token":                 "token-do-email",
  "password":              "novasenha",
  "password_confirmation": "novasenha"
}`}
          />
        </Sub>
      </Section>

      <Section id="api-commands-section" title="Comandos e Tarefas">
        <P>Usuarios comuns so veem e manipulam seus proprios itens.
        Admin e SA veem todos os itens de todos os usuarios.</P>

        <Sub id="api-cmd-list" title="Listar">
          <Endpoint
            method="GET" path="/api/command/{group?}/{type?}"
            desc="Retorna todos os itens agrupados por grupo."
            note="group: nome do grupo ou 'all' para todos | type: 1 = JSON (browser), 2 = plain text (console)"
            response={`{
  "devops": [
    "[0001] : (kubectl get pods) = [Lista todos os pods] {command}",
    "[0002] : (helm list -A) = [Lista releases Helm] {command}"
  ],
  "docker": [
    "[0003] : (Docker cleanup) = [Remove imagens e containers parados] {task}"
  ]
}`}
          />
          <Code lang="bash">{`# Todos os itens
curl ${BASE}/command/all/1 \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Accept: application/json"

# Apenas grupo devops
curl ${BASE}/command/devops/1 \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Accept: application/json"`}</Code>

          <Sub id="api-cmd-format" title="Formato do item na listagem">
            <Code lang="text">{`[NNNN] : (titulo) = [descricao] {tipo}

Exemplo:
[0001] : (kubectl get pods -A) = [Lista pods em todos os namespaces] {command}`}</Code>
            <Table
              headers={['Parte', 'Descricao']}
              rows={[
                [<code className="text-xs font-mono">[NNNN]</code>, 'ID com 4 digitos (zero-padded)'],
                [<code className="text-xs font-mono">(titulo)</code>, 'Titulo do item'],
                [<code className="text-xs font-mono">[descricao]</code>, 'Descricao completa (pode conter quebras de linha)'],
                [<code className="text-xs font-mono">{'{tipo}'}</code>, 'command ou task'],
              ]}
            />
          </Sub>
        </Sub>

        <Sub id="api-cmd-create" title="Criar">
          <Endpoint
            method="POST" path="/api/command"
            desc="Cria um novo item associado ao usuario autenticado."
            body={`{
  "title":       "kubectl get pods -A",
  "description": "Lista todos os pods em todos os namespaces",
  "group":       "devops",
  "type":        "command"
}`}
            response={`{
  "id":          42,
  "user_id":     1,
  "title":       "kubectl get pods -A",
  "description": "Lista todos os pods em todos os namespaces",
  "group":       "devops",
  "type":        "command",
  "created_at":  "2026-04-23T10:00:00.000000Z",
  "updated_at":  "2026-04-23T10:00:00.000000Z"
}`}
          />
          <Code lang="bash">{`curl -X POST ${BASE}/command \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "title": "kubectl get pods -A",
    "description": "Lista todos os pods em todos os namespaces",
    "group": "devops",
    "type": "command"
  }'`}</Code>
        </Sub>

        <Sub id="api-cmd-update" title="Atualizar">
          <Endpoint
            method="PUT" path="/api/command/{id}"
            desc="Atualiza um item existente. Todos os campos sao opcionais. Usuario comum so pode editar seus proprios itens."
            body={`{
  "title":       "kubectl get pods -A --no-headers",
  "description": "Lista pods sem cabecalho",
  "group":       "devops",
  "type":        "command"
}`}
          />
        </Sub>

        <Sub id="api-cmd-delete" title="Deletar">
          <Endpoint
            method="DELETE" path="/api/command/{id}"
            desc="Remove permanentemente um item. Usuario comum so pode deletar seus proprios itens."
            response={`true`}
          />
        </Sub>
      </Section>

      <Section id="api-admin-section" title="Administracao (admin / SA)">
        <P>Todos os endpoints abaixo exigem role <Badge color="orange">admin</Badge> ou <Badge color="red">SA</Badge>.</P>

        <Sub id="api-users-section" title="Usuarios">
          <Endpoint
            method="GET" path="/api/user"
            desc="Lista todos os usuarios com paginacao (15 por pagina)."
            response={`{
  "data": [
    {
      "id": 1, "name": "Alexandre", "email": "...",
      "roles": ["SA"], "permissions": [...],
      "picture": "...", "created_at": "...", "updated_at": "..."
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta":  { "current_page": 1, "last_page": 1, "total": 2 }
}`}
          />
          <Endpoint
            method="GET" path="/api/user/{id}"
            desc="Retorna os dados de um usuario especifico."
          />
          <Endpoint
            method="PUT" path="/api/user/{id}"
            desc="Atualiza dados e/ou roles de um usuario."
            body={`{
  "name":      "Novo Nome",
  "roles_ids": [2, 3]
}`}
          />
          <Endpoint
            method="DELETE" path="/api/user/{id}"
            desc="Deleta um usuario permanentemente. Exclusivo para SA."
            note="Somente role SA pode executar esta acao."
          />
        </Sub>

        <Sub id="api-roles-section" title="Roles">
          <Endpoint method="GET" path="/api/role"
            desc="Lista todas as roles com suas permissoes."
            response={`{
  "data": [
    {
      "id": 1, "name": "SA",
      "permissions_ids": [1,2,3,...],
      "permissions_descriptions": ["api.command.index", "api.user.index", ...],
      "created_at": "...", "updated_at": "..."
    }
  ]
}`}
          />
          <Endpoint method="POST" path="/api/role"
            desc="Cria uma nova role."
            body={`{
  "name":            "editor",
  "permissions_ids": [1, 2, 3]
}`}
          />
          <Endpoint method="PUT" path="/api/role/{id}"
            desc="Atualiza nome e/ou permissoes de uma role."
            body={`{
  "name":            "editor",
  "permissions_ids": [1, 2, 5, 8]
}`}
          />
          <Endpoint method="DELETE" path="/api/role/{id}"
            desc="Deleta uma role. Exclusivo para SA."
            note="Somente role SA pode executar esta acao."
          />
        </Sub>

        <Sub id="api-permissions-section" title="Permissoes">
          <Endpoint method="GET" path="/api/permission"
            desc="Lista todas as permissoes (rotas) do sistema com as roles que as possuem."
            response={`{
  "data": [
    {
      "id": 1,
      "name": "api.command.index",
      "roles": ["SA", "admin", "User"],
      "roles_ids": [1, 2, 3]
    },
    {
      "id": 5,
      "name": "api.user.index",
      "roles": ["SA", "admin"],
      "roles_ids": [1, 2]
    }
  ]
}`}
          />
          <Endpoint method="GET" path="/api/auth/setupRoutes"
            desc="Sincroniza as permissoes do banco com as rotas atuais do Laravel. Equivale ao php artisan route:list."
            note="Somente role SA pode executar."
          />
        </Sub>
      </Section>

      <Section id="api-errors" title="Erros e codigos de status">
        <Table
          headers={['Status', 'Significado', 'Quando ocorre']}
          rows={[
            ['200', 'OK', 'Requisicao bem-sucedida'],
            ['401', 'Unauthorized', 'Token ausente, invalido ou expirado'],
            ['403', 'Forbidden', 'Token valido mas sem permissao para a rota'],
            ['404', 'Not Found', 'Recurso nao encontrado'],
            ['422', 'Unprocessable Entity', 'Dados invalidos (validacao falhou)'],
            ['500', 'Internal Server Error', 'Erro inesperado no servidor'],
          ]}
        />
        <P>Erros de validacao retornam:</P>
        <Code lang="json">{`{
  "message": "The title field is required.",
  "errors": {
    "title": ["The title field is required."]
  }
}`}</Code>
        <P>Erros de permissao retornam:</P>
        <Code lang="json">{`{ "error": "Unauthorized" }`}</Code>
      </Section>

      <Section id="api-pagination" title="Paginacao">
        <P>Endpoints de listagem (users, roles) retornam dados paginados:</P>
        <Code lang="json">{`{
  "data":  [...],
  "links": {
    "first": "https://commands.abeiradocaos.com.br/api/user?page=1",
    "last":  "https://commands.abeiradocaos.com.br/api/user?page=3",
    "prev":  null,
    "next":  "https://commands.abeiradocaos.com.br/api/user?page=2"
  },
  "meta": {
    "current_page": 1,
    "from":         1,
    "last_page":    3,
    "per_page":     15,
    "to":           15,
    "total":        42
  }
}`}</Code>
      </Section>

      <Section id="api-example-flow" title="Exemplo de fluxo completo">
        <P>Criar um comando do zero usando somente cURL:</P>
        <Code lang="bash">{`BASE="https://commands.abeiradocaos.com.br/api"

# 1. Login
TOKEN=$(curl -s -X POST $BASE/login \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"email":"voce@exemplo.com","password":"suasenha","client":"app"}' \\
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# 2. Criar comando
curl -X POST $BASE/command \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "title": "docker ps -a",
    "description": "Lista todos os containers incluindo os parados",
    "group": "docker",
    "type": "command"
  }'

# 3. Listar todos os comandos
curl "$BASE/command/all/1" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Accept: application/json"

# 4. Logout
curl -X POST $BASE/auth/logout \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Accept: application/json"`}</Code>
      </Section>

    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// NAV configs
// ══════════════════════════════════════════════════════════════════════════

const USER_NAV = [
  { id: 'intro',    label: 'Introducao' },
  { id: 'roles',    label: 'Niveis de acesso' },
  { id: 'acesso',   label: 'Acesso', sub: [
    { id: 'login',      label: 'Login' },
    { id: 'registro',   label: 'Registro' },
    { id: 'recuperacao', label: 'Recuperacao' },
  ]},
  { id: 'interface', label: 'Interface', sub: [
    { id: 'header-ui', label: 'Barra superior' },
    { id: 'grupos-ui', label: 'Abas de grupo' },
    { id: 'lista-ui',  label: 'Lista de itens' },
  ]},
  { id: 'atalhos',  label: 'Atalhos de teclado' },
  { id: 'gerenciar', label: 'Criar e editar', sub: [
    { id: 'novo-item',   label: 'Novo item' },
    { id: 'markdown-info', label: 'Markdown' },
    { id: 'busca-filtro',  label: 'Busca e filtros' },
  ]},
  { id: 'admin-panel', label: 'Painel admin', adminOnly: true, sub: [
    { id: 'admin-users', label: 'Usuarios' },
    { id: 'admin-roles', label: 'Roles' },
    { id: 'admin-perms', label: 'Permissoes' },
  ]},
  { id: 'tema-ui', label: 'Tema claro/escuro' },
]

const TECH_NAV = [
  { id: 'arch',       label: 'Arquitetura' },
  { id: 'rbac',       label: 'Roles e Permissoes', sub: [
    { id: 'rbac-flow', label: 'Fluxo de verificacao' },
    { id: 'rbac-sync', label: 'Sincronizar permissoes' },
  ]},
  { id: 'db',         label: 'Banco de dados', sub: [
    { id: 'schema-commands', label: 'Tabela commands' },
    { id: 'schema-outros',   label: 'Outras tabelas' },
  ]},
  { id: 'env',        label: 'Variaveis de ambiente' },
  { id: 'run-system', label: 'Como subir', sub: [
    { id: 'run-dev',  label: 'Desenvolvimento' },
    { id: 'run-prod', label: 'Producao' },
  ]},
  { id: 'systemd',    label: 'Servico systemd', sub: [
    { id: 'systemd-file', label: 'Arquivo' },
    { id: 'systemd-cmds', label: 'Comandos' },
    { id: 'systemd-deploy', label: 'Deploy' },
  ]},
  { id: 'terminal-client', label: 'Cliente terminal', sub: [
    { id: 'terminal-requisitos',  label: 'Requisitos' },
    { id: 'terminal-instalacao',  label: 'Instalacao' },
    { id: 'terminal-atalhos',     label: 'Atalhos' },
    { id: 'terminal-arquivos',    label: 'Arquivos' },
  ]},
]

const API_NAV = [
  { id: 'api-overview', label: 'Visao geral' },
  { id: 'api-auth-section', label: 'Autenticacao', sub: [
    { id: 'api-clients',   label: 'Clientes permitidos' },
    { id: 'api-get-token', label: 'Obter token' },
    { id: 'api-verify',    label: 'Verificar token' },
    { id: 'api-logout',    label: 'Logout' },
    { id: 'api-register',  label: 'Registro' },
    { id: 'api-forgot',    label: 'Recuperacao de senha' },
  ]},
  { id: 'api-commands-section', label: 'Comandos e Tarefas', sub: [
    { id: 'api-cmd-list',   label: 'Listar' },
    { id: 'api-cmd-format', label: 'Formato de item' },
    { id: 'api-cmd-create', label: 'Criar' },
    { id: 'api-cmd-update', label: 'Atualizar' },
    { id: 'api-cmd-delete', label: 'Deletar' },
  ]},
  { id: 'api-admin-section', label: 'Administracao (admin/SA)', sub: [
    { id: 'api-users-section',       label: 'Usuarios' },
    { id: 'api-roles-section',       label: 'Roles' },
    { id: 'api-permissions-section', label: 'Permissoes' },
  ]},
  { id: 'api-errors',       label: 'Erros e status HTTP' },
  { id: 'api-pagination',   label: 'Paginacao' },
  { id: 'api-example-flow', label: 'Exemplo completo (cURL)' },
]

// ══════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════

const TABS = [
  { key: 'user', label: 'Guia do Usuario',      adminOnly: false },
  { key: 'tech', label: 'Referencia Tecnica',   adminOnly: true  },
  { key: 'api',  label: 'API Externa',           adminOnly: true  },
]

export default function Docs() {
  const { isAdmin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get('tab') ?? 'user'
  const tab    = (rawTab === 'tech' || rawTab === 'api') && !isAdmin ? 'user' : rawTab

  const navMap = { user: USER_NAV, tech: TECH_NAV, api: API_NAV }
  const nav    = navMap[tab] ?? USER_NAV

  const setTab = (t) => setSearchParams({ tab: t })
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const visibleTabs = TABS.filter((t) => !t.adminOnly || isAdmin)
  const visibleNav  = nav.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gh-dark overflow-hidden">

      {/* Header */}
      <header className="shrink-0 flex items-center gap-3 px-4 h-12 border-b z-10
        bg-white border-gray-200 dark:bg-gh-surface dark:border-gh-border">
        <Link to="/commands" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-yellow-500 text-lg">&#9889;</span>
          <span className="font-bold text-sm text-gray-900 dark:text-gh-text hidden sm:block">ShieldForce</span>
        </Link>
        <span className="text-gray-300 dark:text-gh-border">/</span>
        <span className="text-sm font-medium text-gray-500 dark:text-gh-muted">Documentacao</span>

        {/* Tab switcher */}
        <div className="flex items-center ml-4 gap-0 rounded-lg border border-gray-200
          dark:border-gh-border overflow-hidden">
          {visibleTabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1 text-xs font-medium transition-colors duration-100
                ${tab === t.key
                  ? 'bg-blue-600 text-white dark:bg-gh-green dark:text-gh-dark'
                  : 'text-gray-500 dark:text-gh-muted hover:text-gray-700 dark:hover:text-gh-text bg-transparent'
                }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/commands" className="text-xs text-gray-500 hover:text-gray-700
            dark:text-gh-muted dark:hover:text-gh-text px-2 py-1 rounded-lg
            hover:bg-gray-100 dark:hover:bg-gh-border transition-colors">
            ← Voltar
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r overflow-y-auto
          border-gray-200 dark:border-gh-border bg-white dark:bg-gh-surface">
          <nav className="p-3 space-y-0.5">
            {visibleNav.map((item) => (
              <div key={item.id}>
                <button onClick={() => scrollTo(item.id)}
                  className="w-full text-left px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                    text-gray-700 hover:text-gray-900 hover:bg-gray-100
                    dark:text-gh-muted dark:hover:text-gh-text dark:hover:bg-gh-border/50">
                  {item.label}
                </button>
                {item.sub?.map((s) => (
                  <button key={s.id} onClick={() => scrollTo(s.id)}
                    className="w-full text-left pl-5 pr-2 py-0.5 rounded-md text-xs transition-colors
                      text-gray-500 hover:text-gray-700 hover:bg-gray-50
                      dark:text-gh-border dark:hover:text-gh-muted dark:hover:bg-gh-border/30">
                    {s.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gh-text mb-1">
                {{ user: 'Guia do Usuario', tech: 'Referencia Tecnica', api: 'API Externa' }[tab]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gh-muted">
                {{ user: 'Como usar o ShieldForce Commands pelo browser.',
                   tech: 'Arquitetura, banco de dados, deploy e infraestrutura.',
                   api:  'Referencia completa da API REST para consumo externo.' }[tab]}
              </p>
            </div>

            {tab === 'user' && <UserGuide isAdmin={isAdmin} />}
            {tab === 'tech' && <TechDocs />}
            {tab === 'api'  && <ApiDocs />}
          </div>
        </main>
      </div>
    </div>
  )
}
