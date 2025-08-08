"""Tkinter-based media player GUI for local files and Spotify tracks.

The player loads API credentials from ``config.json`` and supports basic
controls such as play, pause, stop, and track navigation. A configuration menu
is available under ``Settings`` allowing users to adjust the stored API keys.
"""

from __future__ import annotations

import os
import json
import tkinter as tk
from tkinter import ttk
from typing import List

import pygame
import spotipy
from spotipy.oauth2 import SpotifyOAuth

import config_ui

CONFIG_FILE = "config.json"
LOCAL_MUSIC_DIR = "local_music"


def load_config() -> None:
    """Populate environment variables from the config file."""
    if os.path.isfile(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        for key, value in data.items():
            if value and not os.getenv(key):
                os.environ[key] = value


def load_local_tracks() -> List[str]:
    """Return list of local MP3 file paths."""
    if not os.path.isdir(LOCAL_MUSIC_DIR):
        return []
    return [os.path.join(LOCAL_MUSIC_DIR, f) for f in os.listdir(LOCAL_MUSIC_DIR) if f.lower().endswith(".mp3")]


def fetch_spotify_tracks(sp: spotipy.Spotify, playlist_id: str) -> List[str]:
    """Fetch track names and URIs from a Spotify playlist."""
    tracks = []
    if not playlist_id:
        return tracks
    results = sp.playlist_items(playlist_id)
    for item in results["items"]:
        track = item["track"]
        name = track["name"]
        uri = track["uri"]
        tracks.append((name, uri))
    return tracks


class MusicPlayerGUI:
    """Simple media player GUI."""

    def __init__(self, root: tk.Tk) -> None:
        load_config()

        self.root = root
        self.root.title("Music Player")

        pygame.mixer.init()
        self.sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope="user-modify-playback-state user-read-playback-state"))
        self.spotify_playlist = os.getenv("SPOTIFY_PLAYLIST_ID", "")

        self.tracks: List[tuple[str, str]] = []  # (display_name, path_or_uri)
        self.current_index: int | None = None
        self.is_paused = False

        self._build_ui()
        self._load_tracks()

    def _build_ui(self) -> None:
        menu = tk.Menu(self.root)
        self.root.config(menu=menu)
        settings = tk.Menu(menu, tearoff=0)
        settings.add_command(label="Configure APIs", command=lambda: config_ui.open_config_window(self.root))
        menu.add_cascade(label="Settings", menu=settings)

        main_frame = ttk.Frame(self.root, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)

        self.playlist = tk.Listbox(main_frame)
        self.playlist.pack(fill=tk.BOTH, expand=True)

        controls = ttk.Frame(main_frame)
        controls.pack(pady=10)

        ttk.Button(controls, text="Prev", command=self.prev_track).grid(row=0, column=0, padx=5)
        ttk.Button(controls, text="Play", command=self.play_selected).grid(row=0, column=1, padx=5)
        ttk.Button(controls, text="Pause", command=self.pause).grid(row=0, column=2, padx=5)
        ttk.Button(controls, text="Stop", command=self.stop).grid(row=0, column=3, padx=5)
        ttk.Button(controls, text="Next", command=self.next_track).grid(row=0, column=4, padx=5)

        volume_frame = ttk.Frame(main_frame)
        volume_frame.pack(fill=tk.X)
        ttk.Label(volume_frame, text="Volume").pack(side=tk.LEFT)
        self.volume = tk.DoubleVar(value=0.5)
        slider = ttk.Scale(volume_frame, from_=0, to=1, orient=tk.HORIZONTAL, variable=self.volume, command=self.set_volume)
        slider.pack(fill=tk.X, expand=True, padx=5)
        self.set_volume(0.5)

    def _load_tracks(self) -> None:
        local = load_local_tracks()
        self.tracks.extend([(os.path.basename(path), path) for path in local])

        spotify_tracks = fetch_spotify_tracks(self.sp, self.spotify_playlist)
        self.tracks.extend(spotify_tracks)

        for name, _ in self.tracks:
            self.playlist.insert(tk.END, name)

    def set_volume(self, value: float) -> None:
        pygame.mixer.music.set_volume(self.volume.get())
        try:
            self.sp.volume(int(self.volume.get() * 100))
        except spotipy.SpotifyException:
            pass

    def play_selected(self) -> None:
        selection = self.playlist.curselection()
        if not selection:
            return
        self.current_index = selection[0]
        self._play_current()

    def _play_current(self) -> None:
        if self.current_index is None:
            return
        name, path_or_uri = self.tracks[self.current_index]
        if path_or_uri.startswith("spotify:"):
            self.sp.start_playback(uris=[path_or_uri])
        else:
            pygame.mixer.music.load(path_or_uri)
            pygame.mixer.music.play()
            self._monitor_song()
        self.is_paused = False

    def _monitor_song(self) -> None:
        if pygame.mixer.music.get_busy():
            self.root.after(1000, self._monitor_song)
        else:
            self.next_track()

    def pause(self) -> None:
        if self.current_index is None:
            return
        if self.is_paused:
            if self.tracks[self.current_index][1].startswith("spotify:"):
                self.sp.start_playback()
            else:
                pygame.mixer.music.unpause()
            self.is_paused = False
        else:
            if self.tracks[self.current_index][1].startswith("spotify:"):
                self.sp.pause_playback()
            else:
                pygame.mixer.music.pause()
            self.is_paused = True

    def stop(self) -> None:
        if self.current_index is None:
            return
        if self.tracks[self.current_index][1].startswith("spotify:"):
            self.sp.pause_playback()
        else:
            pygame.mixer.music.stop()
        self.is_paused = False

    def next_track(self) -> None:
        if self.tracks and self.current_index is not None:
            self.current_index = (self.current_index + 1) % len(self.tracks)
            self.playlist.selection_clear(0, tk.END)
            self.playlist.selection_set(self.current_index)
            self._play_current()

    def prev_track(self) -> None:
        if self.tracks and self.current_index is not None:
            self.current_index = (self.current_index - 1) % len(self.tracks)
            self.playlist.selection_clear(0, tk.END)
            self.playlist.selection_set(self.current_index)
            self._play_current()


def main() -> None:
    root = tk.Tk()
    app = MusicPlayerGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
