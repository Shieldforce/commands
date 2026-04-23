#!/usr/bin/env python3
import sys
from InquirerPy import inquirer
from InquirerPy.base.control import Choice
from InquirerPy.separator import Separator
from rich.prompt import Prompt

import api
import ui
from tui_viewer import CommandViewer

TOKEN: str = ""
EMAIL: str = ""
CACHE: dict = {}


# ── auth flow ──────────────────────────────────────────────────────────────

def _extract_error(exc: Exception) -> str:
    if hasattr(exc, "response") and exc.response is not None:
        try:
            data = exc.response.json()
            if "message" in data:
                return data["message"]
            if "errors" in data:
                return "  ".join(
                    m for msgs in data["errors"].values() for m in msgs
                )
        except Exception:
            pass
    return str(exc)


def screen_login() -> tuple[str, str] | None:
    ui.header("Entrar na conta")
    try:
        email    = inquirer.text(message="Email:").execute()
        password = inquirer.secret(message="Senha:").execute()
        token    = api.login(email, password)
        api.save_session(token, email)
        ui.success(f"Bem-vindo, {email}!")
        return token, email
    except Exception as exc:
        ui.error(f"Falha no login: {_extract_error(exc)}")
        _wait()
        return None


def screen_register() -> None:
    ui.header("Criar nova conta")
    try:
        name  = inquirer.text(message="Nome:").execute()
        email = inquirer.text(message="Email:").execute()
        while True:
            password = inquirer.secret(message="Senha:").execute()
            confirm  = inquirer.secret(message="Confirmar senha:").execute()
            if password == confirm:
                break
            ui.error("As senhas nao coincidem. Tente novamente.")

        api.register(name, email, password)
        ui.success("Conta criada! Faca login para continuar.")
        _wait()
    except Exception as exc:
        ui.error(f"Erro ao registrar: {_extract_error(exc)}")
        _wait()


def screen_forgot() -> None:
    ui.header("Recuperar senha")
    try:
        email = inquirer.text(message="Email da conta:").execute()
        api.forgot_password(email)
        ui.success(f"Link de recuperacao enviado para {email}.")
        ui.info("Verifique sua caixa de entrada e siga as instrucoes.")
        _wait()
    except Exception as exc:
        ui.error(f"Erro: {_extract_error(exc)}")
        _wait()


def do_auth() -> None:
    """Garante que TOKEN e EMAIL globais estejam preenchidos com sessao valida."""
    global TOKEN, EMAIL

    # Tenta restaurar sessao salva
    session = api.load_session()
    if session:
        ui.header("Verificando sessao...")
        if api.verify_token(session["token"]):
            TOKEN = session["token"]
            EMAIL = session.get("email", "")
            ui.success(f"Sessao restaurada — {EMAIL}")
            return
        ui.info("Sessao expirada. Faca login novamente.")
        api.clear_session()

    # Menu de autenticacao
    while True:
        ui.header("Autenticacao")
        choice = inquirer.select(
            message="Como deseja continuar?",
            choices=[
                Choice("login",    "→  Entrar com minha conta"),
                Choice("register", "→  Criar nova conta"),
                Choice("forgot",   "→  Recuperar senha"),
                Separator(),
                Choice("exit",     "✗  Sair"),
            ],
        ).execute()

        if choice == "login":
            result = screen_login()
            if result:
                TOKEN, EMAIL = result
                return
        elif choice == "register":
            screen_register()
        elif choice == "forgot":
            screen_forgot()
        elif choice == "exit":
            ui.console.print("\n [bold cyan]Ate logo! ⚡[/bold cyan]\n")
            sys.exit(0)


# ── commands ───────────────────────────────────────────────────────────────

def load_commands(group: str = "all", force: bool = False) -> dict:
    global CACHE
    if group not in CACHE or force:
        CACHE[group] = api.get_commands(TOKEN, group)
    return CACHE[group]


def _open_viewer(rows: list[dict], subtitle: str = "") -> None:
    if not rows:
        ui.info("Nenhum comando encontrado.")
        _wait()
        return
    CommandViewer(rows, token=TOKEN, subtitle=subtitle).run()
    CACHE.clear()


def screen_list_all():
    ui.header("Carregando...")
    try:
        rows = ui._parse_commands(load_commands("all"))
        _open_viewer(rows, subtitle="Todos os comandos")
    except Exception as exc:
        ui.error(str(exc))
        _wait()


def screen_list_group():
    ui.header("Comandos por Grupo")
    try:
        raw    = load_commands("all")
        groups = ui.render_groups(raw)
        if not groups:
            _wait()
            return
        group = inquirer.select(
            message="Selecione o grupo:",
            choices=groups + ["← Voltar"],
        ).execute()
        if group == "← Voltar":
            return
        filtered = {group: raw[group]} if group in raw else {}
        _open_viewer(ui._parse_commands(filtered), subtitle=f"Grupo: {group}")
    except Exception as exc:
        ui.error(str(exc))
        _wait()


def screen_search():
    ui.header("Pesquisar Comandos")
    try:
        raw   = load_commands("all")
        query = Prompt.ask(" [bold cyan]Pesquisar[/bold cyan]")
        rows  = ui._parse_commands(raw)
        q     = query.lower()
        rows  = [
            r for r in rows
            if q in r["title"].lower()
            or q in r["description"].lower()
            or q in r["group"].lower()
        ]
        _open_viewer(rows, subtitle=f'Pesquisa: "{query}"')
    except Exception as exc:
        ui.error(str(exc))
        _wait()


def screen_create():
    ui.header("Criar Comando / Tarefa")
    try:
        raw    = load_commands("all")
        groups = sorted(raw.keys())

        use_existing = groups and inquirer.confirm(
            message="Usar um grupo existente?", default=True
        ).execute()

        if use_existing:
            group = inquirer.select(message="Grupo:", choices=groups).execute()
        else:
            group = Prompt.ask(" [bold cyan]Nome do novo grupo[/bold cyan]")

        type_ = inquirer.select(
            message="Tipo:",
            choices=[
                Choice("command", "⬡  Comando  — instrucao de terminal"),
                Choice("task",    "◆  Tarefa   — procedimento detalhado"),
            ],
        ).execute()

        title       = Prompt.ask(" [bold cyan]Titulo[/bold cyan]")
        description = Prompt.ask(" [bold cyan]Descricao[/bold cyan]")

        ui.info(f"[{group}] ({type_}) {title}  →  {description}")
        if inquirer.confirm(message="Confirmar?", default=True).execute():
            result = api.create_command(TOKEN, group, title, description, type_)
            CACHE.clear()
            ui.success(f"Criado! ID: {result.get('id', '?')}")
        else:
            ui.info("Cancelado.")
    except Exception as exc:
        ui.error(str(exc))
    _wait()


def screen_edit():
    ui.header("Editar Comando / Tarefa")
    try:
        raw  = load_commands("all")
        rows = ui.render_table(raw)
        if not rows:
            _wait()
            return

        choices = [
            Choice(r["id"], f"[{str(r['id']).zfill(4)}] ({r['group']}) {r['title']}")
            for r in rows
        ] + [Choice(None, "← Voltar")]

        cmd_id = inquirer.fuzzy(
            message="Selecione o comando para editar:", choices=choices
        ).execute()
        if cmd_id is None:
            return

        target = next(r for r in rows if r["id"] == cmd_id)
        ui.console.print(f"\n Editando: [bold magenta]{target['title']}[/bold magenta]\n")

        group       = Prompt.ask(" [bold cyan]Grupo[/bold cyan]",     default=target["group"])
        title       = Prompt.ask(" [bold cyan]Titulo[/bold cyan]",    default=target["title"])
        description = Prompt.ask(" [bold cyan]Descricao[/bold cyan]", default=target["description"])
        type_       = inquirer.select(
            message="Tipo:",
            choices=[
                Choice("command", "⬡  Comando"),
                Choice("task",    "◆  Tarefa"),
            ],
            default=target.get("type", "command"),
        ).execute()

        if inquirer.confirm(message="Confirmar edicao?", default=True).execute():
            api.update_command(TOKEN, cmd_id, group, title, description, type_)
            CACHE.clear()
            ui.success("Atualizado!")
        else:
            ui.info("Cancelado.")
    except Exception as exc:
        ui.error(str(exc))
    _wait()


def screen_delete():
    ui.header("Deletar Comando")
    try:
        raw  = load_commands("all")
        rows = ui.render_table(raw)
        if not rows:
            _wait()
            return

        choices = [
            Choice(r["id"], f"[{str(r['id']).zfill(4)}] ({r['group']}) {r['title']}")
            for r in rows
        ] + [Choice(None, "← Voltar")]

        cmd_id = inquirer.fuzzy(
            message="Selecione o comando para deletar:", choices=choices
        ).execute()
        if cmd_id is None:
            return

        target = next(r for r in rows if r["id"] == cmd_id)
        ui.console.print(f"\n [bold red]Deletar:[/bold red] [{target['group']}] {target['title']}\n")

        if inquirer.confirm(message="Tem certeza?", default=False).execute():
            api.delete_command(TOKEN, cmd_id)
            CACHE.clear()
            ui.success("Deletado!")
        else:
            ui.info("Cancelado.")
    except Exception as exc:
        ui.error(str(exc))
    _wait()


def screen_logout() -> None:
    if inquirer.confirm(message="Encerrar sessao?", default=False).execute():
        api.logout(TOKEN)
        ui.success("Sessao encerrada.")
        do_auth()


# ── main menu ──────────────────────────────────────────────────────────────

def menu_main():
    while True:
        ui.header()
        ui.console.print(f" [dim]Logado como[/dim] [bold cyan]{EMAIL}[/bold cyan]\n")
        choice = inquirer.select(
            message="O que deseja fazer?",
            choices=[
                Choice("list_all",   "📋  Listar todos os comandos"),
                Choice("list_group", "🗂️   Listar por grupo"),
                Choice("search",     "🔍  Pesquisar"),
                Separator(),
                Choice("create",     "➕  Criar comando / tarefa"),
                Choice("edit",       "✏️   Editar"),
                Choice("delete",     "🗑️   Deletar"),
                Separator(),
                Choice("logout",     "🔓  Sair da conta"),
                Choice("exit",       "🚪  Fechar"),
            ],
            vi_mode=True,
        ).execute()

        if   choice == "list_all":   screen_list_all()
        elif choice == "list_group": screen_list_group()
        elif choice == "search":     screen_search()
        elif choice == "create":     screen_create()
        elif choice == "edit":       screen_edit()
        elif choice == "delete":     screen_delete()
        elif choice == "logout":     screen_logout()
        elif choice == "exit":
            ui.console.print("\n [bold cyan]Ate logo! ⚡[/bold cyan]\n")
            sys.exit(0)


def _wait():
    ui.console.print(" [dim]Pressione Enter para voltar...[/dim]")
    input()


# ── entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        do_auth()
        menu_main()
    except KeyboardInterrupt:
        ui.console.print("\n\n [dim]Ate logo![/dim]\n")
        sys.exit(0)
