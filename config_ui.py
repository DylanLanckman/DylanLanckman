"""Configuration UI for storing API keys used by the music player."""

import json
import os
import tkinter as tk
from tkinter import messagebox

CONFIG_FILE = "config.json"

FIELDS = [
    ("OpenAI API Key", "OPENAI_API_KEY"),
    ("Spotify Client ID", "SPOTIPY_CLIENT_ID"),
    ("Spotify Client Secret", "SPOTIPY_CLIENT_SECRET"),
    ("Spotify Redirect URI", "SPOTIPY_REDIRECT_URI"),
    ("Spotify Playlist ID", "SPOTIFY_PLAYLIST_ID"),
    ("News Feed URL", "NEWS_FEED_URL"),
]


def load_config():
    """Return configuration values if a config file exists."""
    if os.path.isfile(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_config(data):
    """Write configuration values to the config file."""
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def open_config_window(parent: tk.Misc | None = None) -> None:
    """Open a configuration window.

    If *parent* is provided the window is created as a Toplevel widget so it can
    be launched from another GUI. Otherwise a standalone root window is used and
    a local Tk mainloop is started.
    """

    config = load_config()

    window = tk.Toplevel(parent) if parent else tk.Tk()
    window.title("API Config")

    entries: dict[str, tk.Entry] = {}
    for idx, (label_text, key) in enumerate(FIELDS):
        tk.Label(window, text=label_text).grid(row=idx, column=0, sticky="e", padx=5, pady=5)
        entry = tk.Entry(window, width=40)
        entry.grid(row=idx, column=1, padx=5, pady=5)
        entry.insert(0, config.get(key, ""))
        entries[key] = entry

    def save_and_close() -> None:
        data = {key: ent.get().strip() for key, ent in entries.items()}
        save_config(data)
        messagebox.showinfo("Saved", "Configuration saved to config.json")
        window.destroy()

    tk.Button(window, text="Save", command=save_and_close).grid(row=len(FIELDS), column=0, columnspan=2, pady=10)

    if not parent:
        window.mainloop()


# Backwards compatibility for earlier scripts
def create_ui():  # pragma: no cover - thin wrapper
    """Launch the configuration window as a standalone application."""
    open_config_window()


if __name__ == "__main__":
    open_config_window()
