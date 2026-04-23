import subprocess
import threading
import logging
from typing import Callable
from requests.exceptions import HTTPError
from textual import on
from textual.app import App, ComposeResult
from textual.screen import ModalScreen
from textual.widgets import Header, Footer, ListView, ListItem, Label, Input, Static, Select, TextArea
from textual.binding import Binding
from textual.containers import Vertical

import api

logging.basicConfig(
    filename="/tmp/sf_debug.log",
    level=logging.DEBUG,
    format="%(asctime)s %(message)s",
    filemode="w",
)

HELP_TEXT = """\
 ⚡ SHIELDFORCE Commands — Atalhos
 ──────────────────────────────────────────

  NAVEGAÇÃO
    j / ↓      Próximo comando
    k / ↑      Comando anterior

  BUSCA
    /          Abrir barra de busca
               (filtra por título, descrição,
                grupo ou tipo: command / task)
    ESC        Fechar busca e limpar filtro

  AÇÕES (lista)
    c          Copiar comando para o clipboard
    e          Editar comando selecionado
    d          Deletar comando selecionado
    n          Criar novo comando

  EDIÇÃO (painel inferior)
    Tab        Avançar entre os campos
    Ctrl+S     Salvar (criar ou atualizar)
    ESC        Cancelar edição

  GERAL
    ?          Mostrar esta ajuda
    q / ESC    Voltar ao menu principal
"""

_TYPE_OPTIONS = [("⬡  Comando  (command)", "command"), ("◆  Tarefa   (task)", "task")]

def _type_badge(type_: str) -> str:
    if type_ == "task":
        return "  [bold #f0883e]◆ task[/bold #f0883e]"
    return "  [bold #58a6ff]⬡ cmd[/bold #58a6ff]"


class HelpScreen(ModalScreen):
    CSS = """
    HelpScreen { align: center middle; }
    #help-box {
        width: 52;
        height: auto;
        background: #161b22;
        border: solid #3fb950;
        padding: 1 2;
    }
    #help-box Static { color: #e6edf3; }
    #help-close {
        color: #8b949e;
        text-align: center;
        padding: 1 0 0 0;
    }
    """
    BINDINGS = [Binding("escape,q,?", "dismiss", show=False)]

    def compose(self) -> ComposeResult:
        with Vertical(id="help-box"):
            yield Static(HELP_TEXT)
            yield Static("[ ESC / q / ? para fechar ]", id="help-close")


def _copy_to_clipboard(text: str) -> bool:
    for tool in (
        ["wl-copy"],
        ["xclip", "-selection", "clipboard"],
        ["xsel", "--clipboard", "--input"],
    ):
        try:
            proc = subprocess.Popen(
                tool,
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            proc.stdin.write(text.encode())
            proc.stdin.close()
            return True
        except FileNotFoundError:
            continue
    return False


class CommandViewer(App):
    TITLE = "⚡ SHIELDFORCE  Commands"

    CSS = """
    Screen { background: #0d1117; }

    Header { background: #161b22; color: #3fb950; }
    Footer { background: #161b22; }

    /* ── search bar ── */
    #search-bar {
        height: 3;
        background: #161b22;
        border-bottom: solid #30363d;
        padding: 0 2;
        display: none;
    }
    #search-bar.active { display: block; }
    #search-input {
        background: #0d1117;
        border: solid #3fb950;
        color: #e6edf3;
        width: 100%;
    }

    /* ── list ── */
    #cmd-list {
        background: #0d1117;
        padding: 0 2;
        border: none;
    }
    ListItem {
        background: #0d1117;
        padding: 0;
        border: none;
        border-bottom: solid #1c2128;
        height: auto;
        width: 1fr;
    }
    ListItem.--highlight {
        background: #0d1117;
        border-left: none;
    }

    .cmd-id {
        color: #30363d;
        padding: 1 1 0 1;
        width: 1fr;
    }
    .cmd-title {
        color: #58a6ff;
        text-style: bold;
        padding: 0 1;
        width: 1fr;
    }
    .cmd-desc {
        color: #8b949e;
        padding: 0 1 1 1;
        width: 1fr;
    }

    /* ── edit panel ── */
    #edit-panel {
        height: auto;
        background: #161b22;
        border-top: solid #30363d;
        padding: 1 2;
        display: none;
    }
    #edit-panel.active { display: block; }
    #edit-hint {
        color: #3fb950;
        text-style: bold;
        padding: 0 0 1 0;
    }
    .field-label { color: #8b949e; padding: 0; }
    Input {
        background: #0d1117;
        border: solid #30363d;
        color: #e6edf3;
        margin: 0 0 1 0;
        width: 100%;
    }
    Input:focus { border: solid #3fb950; }
    Select {
        background: #0d1117;
        border: solid #30363d;
        margin: 0 0 1 0;
        width: 100%;
    }
    Select:focus { border: solid #3fb950; }
    SelectOverlay {
        background: #161b22;
        border: solid #3fb950;
    }
    #input-desc {
        background: #0d1117;
        border: solid #30363d;
        color: #e6edf3;
        margin: 0 0 1 0;
        width: 100%;
        height: 5;
    }
    #input-desc:focus { border: solid #3fb950; }
    #desc-hint {
        color: #3fb950;
        text-style: italic;
        padding: 0 0 1 0;
    }
    """

    BINDINGS = [
        # priority=True → interceptados antes de qualquer widget focado
        Binding("e",             "edit_cmd",      "Editar",    show=True,  priority=True),
        Binding("d",             "delete_cmd",    "Deletar",   show=True,  priority=True),
        Binding("c",             "copy_cmd",      "Copiar",    show=True,  priority=True),
        Binding("n",             "new_cmd",       "Novo",      show=True,  priority=True),
        Binding("q",             "quit_app",      "Voltar",    show=True,  priority=True),
        Binding("slash",         "open_search",   "/Buscar",   show=True,  priority=True),
        Binding("question_mark", "show_help",     "? Ajuda",   show=True,  priority=True),
        Binding("escape",        "cancel_or_quit","Cancelar",  show=False, priority=True),
        Binding("down",          "cursor_down",   "↓",         show=False, priority=True),
        Binding("up",            "cursor_up",     "↑",         show=False, priority=True),
        Binding("j",             "cursor_down",   "↓",         show=False),
        Binding("k",             "cursor_up",     "↑",         show=False),
        Binding("ctrl+s",        "save_cmd",      "^S Salvar", show=True),
    ]

    def __init__(self, rows: list[dict], token: str, subtitle: str = ""):
        super().__init__()
        self._all_rows: list[dict] = rows
        self.rows: list[dict] = list(rows)
        self.token = token
        self.sub_title = self._make_subtitle(subtitle)
        self._subtitle_base = subtitle
        self._prev_idx: int | None = None
        self._editing: bool = False
        self._is_new: bool = False
        self._edit_id: int | None = None
        self._searching: bool = False
        self._filter_active: bool = False

    def check_action(self, action: str, parameters: tuple[object, ...]) -> bool | None:
        """
        Retorna False para desabilitar um binding (a tecla cai para o widget focado).
        Usado para que letras como e/d/c/n/q sejam digitadas nos campos de edição/busca.
        """
        _list_actions = {"edit_cmd", "delete_cmd", "copy_cmd", "new_cmd",
                         "quit_app", "show_help", "open_search",
                         "cursor_down", "cursor_up"}
        if self._editing:
            # dentro do painel de edição: repassa tudo exceto ESC e Ctrl+S
            if action in _list_actions:
                return False
        elif self._searching:
            # dentro da barra de busca: repassa ações de lista (digita normalmente)
            if action in {"edit_cmd", "delete_cmd", "copy_cmd", "new_cmd",
                          "quit_app", "show_help"}:
                return False
        return True

    def _make_subtitle(self, base: str = "") -> str:
        b = base or self._subtitle_base if hasattr(self, "_subtitle_base") else base
        n = len(self.rows)
        total = len(self._all_rows)
        if n < total:
            return f"{b}  [{n}/{total} comandos]" if b else f"{n}/{total} comandos"
        return f"{b}  [{n} comandos]" if b else f"{n} comandos"

    # ── compose ──────────────────────────────────────────────────────────────

    def compose(self) -> ComposeResult:
        yield Header(show_clock=False)
        with Vertical(id="search-bar"):
            yield Input(placeholder="buscar por título, descrição ou grupo…", id="search-input")
        yield ListView(*self._make_items(), id="cmd-list")
        with Vertical(id="edit-panel"):
            yield Label("", id="edit-hint")
            yield Label("Grupo", classes="field-label")
            yield Input(placeholder="grupo", id="input-group")
            yield Label("Título", classes="field-label")
            yield Input(placeholder="título do comando", id="input-title")
            yield Label("Tipo", classes="field-label")
            yield Select(_TYPE_OPTIONS, value="command", id="input-type")
            yield Label("Descrição", classes="field-label")
            yield Label("", id="desc-hint")
            yield TextArea("", id="input-desc")
        yield Footer()

    @staticmethod
    def _desc_preview(desc: str) -> str:
        first = desc.split("\n")[0].strip()
        return first + "  …" if len(first) < len(desc.strip()) else first

    def _make_items(self) -> list[ListItem]:
        items = []
        for i, r in enumerate(self.rows):
            type_ = r.get("type", "command")
            items.append(
                ListItem(
                    Label(
                        f"  #{str(r['id']).zfill(4)}  [{r['group']}]{_type_badge(type_)}",
                        id=f"id-{i}", classes="cmd-id",
                    ),
                    Label(f"  {r['title']}", id=f"title-{i}", classes="cmd-title"),
                    Label(f"  {self._desc_preview(r['description'])}", id=f"desc-{i}", classes="cmd-desc"),
                )
            )
        return items

    # ── lifecycle ─────────────────────────────────────────────────────────────

    def on_mount(self) -> None:
        self.query_one("#cmd-list", ListView).focus()
        if self.rows:
            self._update_pointer(0)

    # ── list events ───────────────────────────────────────────────────────────

    @on(ListView.Highlighted)
    def on_highlighted(self, event: ListView.Highlighted) -> None:
        idx = event.list_view.index
        if idx is not None:
            self._update_pointer(idx)

    def _update_pointer(self, idx: int) -> None:
        lv       = self.query_one("#cmd-list", ListView)
        children = list(lv.children)

        # restaura item anterior
        if self._prev_idx is not None and self._prev_idx != idx:
            prev = self._prev_idx
            if prev < len(self.rows) and prev < len(children):
                r = self.rows[prev]
                try:
                    children[prev].styles.background = "#0d1117"
                    children[prev].styles.border_left = ("none", "#0d1117")
                    self.query_one(f"#title-{prev}", Label).update(f"  {r['title']}")
                    self.query_one(f"#id-{prev}",    Label).update(
                        f"  #{str(r['id']).zfill(4)}  [{r['group']}]{_type_badge(r.get('type','command'))}"
                    )
                    self.query_one(f"#desc-{prev}", Label).update(
                        f"  {self._desc_preview(r['description'])}"
                    )
                except Exception:
                    pass

        # destaca item atual
        if idx < len(self.rows) and idx < len(children):
            r = self.rows[idx]
            try:
                children[idx].styles.background = "#1a4731"
                children[idx].styles.border_left = ("thick", "#3fb950")
                self.query_one(f"#title-{idx}", Label).update(
                    f"[bold #aff5c3]▶ {r['title']}[/bold #aff5c3]"
                )
                self.query_one(f"#id-{idx}", Label).update(
                    f"[#56d364]  #{str(r['id']).zfill(4)}  [{r['group']}][/#56d364]"
                    f"{_type_badge(r.get('type','command'))}"
                )
                self.query_one(f"#desc-{idx}", Label).update(
                    f"[#7ee8a2]  {self._desc_preview(r['description'])}[/#7ee8a2]"
                )
            except Exception:
                pass

        self._prev_idx = idx

    # ── search ────────────────────────────────────────────────────────────────

    @on(Input.Changed, "#search-input")
    def on_search_changed(self, event: Input.Changed) -> None:
        q = event.value.strip().lower()
        if q:
            self.rows = [
                r for r in self._all_rows
                if q in r["title"].lower()
                or q in r["description"].lower()
                or q in r["group"].lower()
                or q in r.get("type", "command").lower()
            ]
            self._filter_active = True
        else:
            self.rows = list(self._all_rows)
            self._filter_active = False
        self._rebuild_list()

    @on(Input.Submitted, "#search-input")
    def on_search_submitted(self, _: Input.Submitted) -> None:
        self._close_search(keep_filter=True)

    def action_open_search(self) -> None:
        if self._editing:
            return
        self._searching = True
        self.query_one("#search-bar").add_class("active")
        inp = self.query_one("#search-input", Input)
        inp.value = ""
        inp.focus()

    def _close_search(self, keep_filter: bool = False) -> None:
        self._searching = False
        self.query_one("#search-bar").remove_class("active")
        if not keep_filter:
            self._filter_active = False
            self.rows = list(self._all_rows)
            self._rebuild_list()
        self.query_one("#cmd-list", ListView).focus()

    def _clear_filter(self) -> None:
        self._filter_active = False
        self.rows = list(self._all_rows)
        self._rebuild_list()
        self.query_one("#cmd-list", ListView).focus()

    # ── helpers ───────────────────────────────────────────────────────────────

    def _current_idx(self) -> int:
        lv = self.query_one("#cmd-list", ListView)
        if lv.index is None and self.rows:
            lv.index = 0
        return lv.index or 0

    def _update_desc_editor(self, type_: str) -> None:
        ta   = self.query_one("#input-desc", TextArea)
        hint = self.query_one("#desc-hint",  Label)
        if type_ == "task":
            ta.styles.height = max(15, self.size.height - 18)
            hint.update(
                "Markdown suportado: **negrito**, _itálico_, `código`, "
                "[link](url), # título, - lista"
            )
            try:
                ta.language = "markdown"
            except Exception:
                pass
        else:
            ta.styles.height = 5
            hint.update("")
            try:
                ta.language = None
            except Exception:
                pass

    @on(Select.Changed, "#input-type")
    def on_type_changed(self, event: Select.Changed) -> None:
        if self._editing:
            self._update_desc_editor(str(event.value))

    def _show_panel(self, hint: str, group: str = "", cmd: str = "", desc: str = "", type_: str = "command") -> None:
        try:
            logging.debug(f"_show_panel: hint={hint!r} type_={type_!r}")
            self.query_one("#edit-panel").add_class("active")
            self.query_one("#edit-hint",   Label).update(hint)
            self.query_one("#input-group", Input).value = group
            self.query_one("#input-title", Input).value = cmd
            safe_type = type_ if type_ in ("command", "task") else "command"
            self.query_one("#input-type",  Select).value = safe_type
            self._update_desc_editor(safe_type)
            self.query_one("#input-desc", TextArea).load_text(desc)
            self.query_one("#input-group", Input).focus()
            logging.debug("_show_panel: done")
        except Exception as e:
            logging.exception(f"_show_panel EXCEPTION: {e}")
            self.notify(str(e), title="Erro ao abrir painel", severity="error", timeout=8)

    def _hide_panel(self) -> None:
        self.query_one("#edit-panel").remove_class("active")
        self._editing = False
        self._is_new  = False
        self._edit_id = None
        self.query_one("#cmd-list", ListView).focus()

    def _rebuild_list(self) -> None:
        lv = self.query_one("#cmd-list", ListView)
        lv.clear()
        for item in self._make_items():
            lv.append(item)
        self._prev_idx = None
        self.sub_title = self._make_subtitle()
        if self.rows:
            self.call_later(self._select_first)

    async def _select_first(self) -> None:
        lv = self.query_one("#cmd-list", ListView)
        lv.index = 0

    # ── actions ───────────────────────────────────────────────────────────────

    def action_copy_cmd(self) -> None:
        if not self.rows:
            return
        idx = self._current_idx()
        if idx >= len(self.rows):
            return
        cmd = self.rows[idx]["title"]
        if _copy_to_clipboard(cmd):
            self.notify(f'"{cmd}"', title="✔ Copiado!", severity="information", timeout=2)
        else:
            self.notify(
                "Instale wl-clipboard (Wayland) ou xclip (X11)",
                title="✖ Clipboard indisponível", severity="warning", timeout=3,
            )

    def action_edit_cmd(self) -> None:
        lv = self.query_one("#cmd-list", ListView)
        logging.debug(f"action_edit_cmd: editing={self._editing} rows={len(self.rows)} lv.index={lv.index} filter={self._filter_active}")
        if self._editing or not self.rows:
            return
        idx = self._current_idx()
        if idx >= len(self.rows):
            logging.debug(f"action_edit_cmd: idx={idx} out of range {len(self.rows)}")
            return
        r = self.rows[idx]
        logging.debug(f"action_edit_cmd: opening panel for id={r['id']} title={r['title']!r}")
        self._editing = True
        self._is_new  = False
        self._edit_id = r["id"]
        self._show_panel(
            f"✏  Editando #{str(r['id']).zfill(4)} — Ctrl+S salvar  •  ESC cancelar",
            group=r["group"], cmd=r["title"], desc=r["description"], type_=r.get("type", "command"),
        )

    def action_new_cmd(self) -> None:
        if self._editing:
            return
        self._editing = True
        self._is_new  = True
        self._edit_id = None
        self._show_panel("➕  Novo comando — Ctrl+S salvar  •  ESC cancelar")

    def action_delete_cmd(self) -> None:
        if self._editing or not self.rows:
            return
        idx = self._current_idx()
        if idx >= len(self.rows):
            return
        r = self.rows[idx]
        threading.Thread(target=self._do_delete, args=(r, idx), daemon=True).start()

    def action_save_cmd(self) -> None:
        if not self._editing:
            return
        group = self.query_one("#input-group", Input).value.strip()
        title = self.query_one("#input-title", Input).value.strip()
        desc  = self.query_one("#input-desc",  TextArea).text.strip()
        type_ = str(self.query_one("#input-type", Select).value)
        if not group or not title or not desc:
            self.notify("Preencha todos os campos", title="⚠ Atenção", severity="warning", timeout=2)
            return
        is_new  = self._is_new
        edit_id = self._edit_id
        threading.Thread(target=self._do_save, args=(group, title, desc, type_, is_new, edit_id), daemon=True).start()

    def action_show_help(self) -> None:
        self.push_screen(HelpScreen())

    def action_cancel_or_quit(self) -> None:
        if self._editing:
            self._hide_panel()
        elif self._searching:
            self._close_search(keep_filter=False)
        elif self._filter_active:
            self._clear_filter()
        else:
            self.exit()

    def action_quit_app(self) -> None:
        logging.debug(f"action_quit_app: editing={self._editing} searching={self._searching} filter={self._filter_active}")
        self.exit()

    def action_cancel_or_quit(self) -> None:
        logging.debug(f"action_cancel_or_quit: editing={self._editing} searching={self._searching} filter={self._filter_active}")
        if self._editing:
            self._hide_panel()
        elif self._searching:
            self._close_search(keep_filter=False)
        elif self._filter_active:
            self._clear_filter()
        else:
            self.exit()

    def action_cursor_down(self) -> None:
        lv = self.query_one("#cmd-list", ListView)
        if self._searching and not lv.has_focus:
            self._close_search(keep_filter=True)
            # índice já está em 0 após _rebuild_list; não mover para baixo
            return
        lv.action_cursor_down()

    def action_cursor_up(self) -> None:
        lv = self.query_one("#cmd-list", ListView)
        if self._searching and not lv.has_focus:
            self._close_search(keep_filter=True)
            return
        lv.action_cursor_up()

    # ── API calls (background threads) ───────────────────────────────────────

    def _refresh_token(self) -> None:
        session = api.load_session()
        if session and api.verify_token(session["token"]):
            self.token = session["token"]
        else:
            api.clear_session()
            self.call_from_thread(
                lambda: self.notify(
                    "Sessao expirada. Feche e faca login novamente.",
                    title="Sessao invalida", severity="error", timeout=6,
                )
            )
            self.call_from_thread(self.exit)

    def _call_with_retry(self, fn: Callable) -> None:
        try:
            fn()
        except HTTPError as e:
            if e.response is not None and e.response.status_code in (401, 403):
                self._refresh_token()
                fn()
            else:
                raise

    def _do_delete(self, r: dict, idx: int) -> None:
        try:
            self._call_with_retry(lambda: api.delete_command(self.token, r["id"]))
            self.rows.pop(idx)
            self._all_rows = [x for x in self._all_rows if x["id"] != r["id"]]
            self.call_from_thread(self._rebuild_list)
            self.call_from_thread(
                lambda: self.notify(f'"{r["title"]}" deletado', title="✔ Deletado!", severity="information", timeout=2)
            )
        except Exception as e:
            self.call_from_thread(
                lambda: self.notify(str(e), title="✖ Erro ao deletar", severity="error", timeout=4)
            )

    def _do_save(self, group: str, title: str, desc: str, type_: str, is_new: bool, edit_id: int | None) -> None:
        try:
            if is_new:
                result = None
                def _create():
                    nonlocal result
                    result = api.create_command(self.token, group, title, desc, type_)
                self._call_with_retry(_create)
                new_id = result.get("id") or (result.get("data") or {}).get("id")
                new_row = {"id": new_id, "group": group, "title": title, "description": desc, "type": type_}
                self.rows.append(new_row)
                self._all_rows.append(new_row)
                msg = f'"{title}" criado!'
            else:
                self._call_with_retry(lambda: api.update_command(self.token, edit_id, group, title, desc, type_))
                for lst in (self.rows, self._all_rows):
                    for row in lst:
                        if row["id"] == edit_id:
                            row.update({"group": group, "title": title, "description": desc, "type": type_})
                            break
                msg = f'"{title}" atualizado!'
            self.call_from_thread(self._hide_panel)
            self.call_from_thread(self._rebuild_list)
            self.call_from_thread(
                lambda: self.notify(msg, title="✔ Salvo!", severity="information", timeout=2)
            )
        except Exception as e:
            self.call_from_thread(
                lambda: self.notify(str(e), title="✖ Erro ao salvar", severity="error", timeout=4)
            )
