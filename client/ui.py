import re
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import box

console = Console()

BRAND = "[bold cyan]⚡ SHIELDFORCE[/bold cyan] [dim]Commands CLI[/dim]"


def header(title: str = ""):
    console.clear()
    console.print(Panel(BRAND, border_style="cyan", padding=(0, 2)))
    if title:
        console.print(f"\n [bold white]{title}[/bold white]\n")


def success(msg: str):
    console.print(f"\n [bold green]✔[/bold green]  {msg}\n")


def error(msg: str):
    console.print(f"\n [bold red]✖[/bold red]  {msg}\n")


def info(msg: str):
    console.print(f"\n [bold yellow]→[/bold yellow]  {msg}\n")


def _parse_commands(raw: dict) -> list[dict]:
    """
    API returns: { group: ["[0001] : (title) = [description] {type}", ...] }
    Description may be multi-line. {type} is optional for backward compatibility.
    """
    # Greedy (.+) for description so ']' inside content works when {type} is present
    p_typed   = re.compile(r"\[(\d+)\]\s*:\s*\((.+?)\)\s*=\s*\[(.+)\]\s*\{(\w+)\}\s*$", re.DOTALL)
    p_legacy  = re.compile(r"\[(\d+)\]\s*:\s*\((.+?)\)\s*=\s*\[(.+?)\]\s*$",            re.DOTALL)
    rows = []
    for group, entries in raw.items():
        for entry in entries:
            entry = entry.strip()
            m = p_typed.match(entry) or p_legacy.match(entry)
            if m:
                rows.append({
                    "id":          int(m.group(1)),
                    "title":       m.group(2),
                    "description": m.group(3),
                    "group":       group,
                    "type":        m.group(4) if m.lastindex >= 4 else "command",
                })
    return rows


def render_table(raw: dict, filter_text: str = "") -> list[dict]:
    rows = _parse_commands(raw)

    if filter_text:
        q = filter_text.lower()
        rows = [
            r for r in rows
            if q in r["title"].lower()
            or q in r["description"].lower()
            or q in r["group"].lower()
        ]

    if not rows:
        info("Nenhum comando encontrado.")
        return []

    table = Table(
        box=box.ROUNDED,
        border_style="cyan",
        header_style="bold cyan",
        show_lines=True,
        expand=True,
    )
    table.add_column("ID", style="dim", width=6, justify="right")
    table.add_column("Grupo", style="bold magenta", min_width=14)
    table.add_column("Comando  →  Descrição", style="white", ratio=1)

    current_group = None
    for r in sorted(rows, key=lambda x: (x["group"], x["id"])):
        group_label = r["group"] if r["group"] != current_group else ""
        current_group = r["group"]
        command_cell = Text()
        command_cell.append(r["title"], style="bold white")
        command_cell.append("  →  ", style="dim")
        command_cell.append(r["description"], style="white")
        table.add_row(str(r["id"]).zfill(4), group_label, command_cell)

    console.print(table)
    console.print(f" [dim]{len(rows)} comando(s) encontrado(s)[/dim]\n")
    return rows


def render_groups(raw: dict) -> list[str]:
    groups = sorted(raw.keys())
    table = Table(
        box=box.SIMPLE,
        border_style="cyan",
        header_style="bold cyan",
        show_header=True,
    )
    table.add_column("#", style="dim", width=4, justify="right")
    table.add_column("Grupo", style="bold magenta")
    table.add_column("Qtd", style="dim", justify="right")

    for i, g in enumerate(groups, 1):
        table.add_row(str(i), g, str(len(raw[g])))

    console.print(table)
    return groups
