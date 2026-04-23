import json
import os
import requests

BASE_URL    = "https://commands.abeiradocaos.com.br/api"
CLIENT      = "shieldforce"
_SESSION    = os.path.expanduser("~/.config/shieldforce/session.json")


# ── session persistence ────────────────────────────────────────────────────

def save_session(token: str, email: str = "") -> None:
    os.makedirs(os.path.dirname(_SESSION), exist_ok=True)
    with open(_SESSION, "w") as f:
        json.dump({"token": token, "email": email}, f)


def load_session() -> dict | None:
    try:
        with open(_SESSION) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def clear_session() -> None:
    try:
        os.remove(_SESSION)
    except FileNotFoundError:
        pass


# ── auth ───────────────────────────────────────────────────────────────────

def login(email: str, password: str) -> str:
    resp = requests.post(
        f"{BASE_URL}/login",
        json={"email": email, "password": password, "client": CLIENT},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def register(name: str, email: str, password: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "password_confirmation": password,
            "client": CLIENT,
        },
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def forgot_password(email: str) -> dict:
    resp = requests.post(
        f"{BASE_URL}/resetPasswordSend",
        json={"email": email},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def verify_token(token: str) -> bool:
    try:
        resp = requests.get(
            f"{BASE_URL}/auth/verifyToken",
            headers=_headers(token),
            timeout=10,
        )
        return resp.status_code == 200
    except Exception:
        return False


def logout(token: str) -> None:
    try:
        requests.post(f"{BASE_URL}/auth/logout", headers=_headers(token), timeout=10)
    except Exception:
        pass
    clear_session()


# ── helpers ────────────────────────────────────────────────────────────────

def _headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Accept":        "application/json",
        "Content-Type":  "application/json",
    }


# ── commands ───────────────────────────────────────────────────────────────

def get_commands(token: str, group: str = "all") -> dict:
    resp = requests.get(
        f"{BASE_URL}/command/{group}/2",
        headers=_headers(token),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def create_command(token: str, group: str, title: str, description: str, type_: str = "command") -> dict:
    resp = requests.post(
        f"{BASE_URL}/command",
        json={"group": group, "title": title, "description": description, "type": type_},
        headers=_headers(token),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def update_command(token: str, command_id: int, group: str, title: str, description: str, type_: str = "command") -> dict:
    resp = requests.put(
        f"{BASE_URL}/command/{command_id}",
        json={"group": group, "title": title, "description": description, "type": type_},
        headers=_headers(token),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def delete_command(token: str, command_id: int) -> dict:
    resp = requests.delete(
        f"{BASE_URL}/command/{command_id}",
        headers=_headers(token),
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()
