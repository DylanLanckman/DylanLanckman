"""Music program with LLM commentary and hourly news updates.

This script mixes local MP3 files and tracks from a Spotify playlist. After
playing a few songs, it uses an LLM to generate a spoken fact and a short note
about upcoming tracks. Every hour it fetches a JSON news feed and reads the
headlines aloud via text-to-speech.
"""

import os
import random
import time
from datetime import datetime, timedelta
from typing import List

import json
import requests
from gtts import gTTS
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import openai
from playsound import playsound

# Load API keys from a config file if present
CONFIG_FILE = "config.json"


def load_config() -> None:
    """Populate environment variables from the config file."""
    if os.path.isfile(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        for key, value in data.items():
            if value and not os.getenv(key):
                os.environ[key] = value


load_config()

# Configuration for directories and external services
LOCAL_MUSIC_DIR = "local_music"  # folder with local mp3 files
SPOTIFY_PLAYLIST_ID = os.getenv("SPOTIFY_PLAYLIST_ID", "")
NEWS_FEED_URL = os.getenv("NEWS_FEED_URL", "")  # URL returning JSON news items

# API key for OpenAI used in commentary and news summaries
openai.api_key = os.getenv("OPENAI_API_KEY")


def load_local_tracks() -> List[str]:
    """Return list of local MP3 file paths."""
    # Look for .mp3 files inside the configured local directory
    if not os.path.isdir(LOCAL_MUSIC_DIR):
        return []
    return [os.path.join(LOCAL_MUSIC_DIR, f) for f in os.listdir(LOCAL_MUSIC_DIR) if f.lower().endswith(".mp3")]


def fetch_spotify_tracks(sp: spotipy.Spotify, playlist_id: str) -> List[str]:
    """Fetch tracks from a Spotify playlist and return their URIs."""
    tracks = []
    if not playlist_id:
        return tracks
    results = sp.playlist_items(playlist_id)
    for item in results["items"]:
        track = item["track"]
        tracks.append(track["uri"])
    return tracks


def speak_text(text: str, filename: str = "commentary.mp3") -> None:
    """Convert text to speech and play it."""
    # Create an MP3 via gTTS, play it, then delete the temporary file
    tts = gTTS(text=text, lang="nl")
    tts.save(filename)
    playsound(filename)
    os.remove(filename)


def generate_commentary(upcoming_tracks: List[str]) -> str:
    """Generate commentary with a random fact and info about upcoming tracks."""
    prompt = (
        "Geef een willekeurig weetje en vertel kort iets over de volgende nummers:"\
        f" {', '.join(upcoming_tracks)}"
    )
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "Je bent een vrolijke radio commentator."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message["content"].strip()


def read_news_from_feed() -> str:
    """Fetch news data from JSON feed and summarize it using the LLM."""
    if not NEWS_FEED_URL:
        return ""
    # Retrieve JSON from the feed and collect up to three article titles
    data = requests.get(NEWS_FEED_URL, timeout=10).json()
    articles = [item.get("title", "") for item in data.get("articles", [])][:3]
    if not articles:
        return "Geen nieuws beschikbaar op dit moment."
    prompt = "Lees het nieuws voor: " + "; ".join(articles)
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "Je leest het nieuws zoals een radiopresentator."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message["content"].strip()


def play_track(sp: spotipy.Spotify, track: str) -> None:
    """Play a track either from local path or Spotify URI."""
    if track.startswith("spotify:"):
        sp.start_playback(uris=[track])
        # Wait a fixed time to simulate playback
        time.sleep(5)
    else:
        playsound(track)


def main():
    # Gather tracks from local folder and Spotify playlist
    local_tracks = load_local_tracks()
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(scope="user-modify-playback-state"))
    spotify_tracks = fetch_spotify_tracks(sp, SPOTIFY_PLAYLIST_ID)

    # Combine tracks into one queue and randomize order
    queue = local_tracks + spotify_tracks
    random.shuffle(queue)

    # Ensure news is read on the first loop iteration
    last_news_time = datetime.now() - timedelta(hours=1)

    while queue:
        # Play a block of 3 to 6 songs
        block_size = random.randint(3, 6)
        for _ in range(min(block_size, len(queue))):
            track = queue.pop(0)
            play_track(sp, track)

        # Generate commentary about the next upcoming tracks
        upcoming = queue[:3]
        commentary = generate_commentary(upcoming)
        speak_text(commentary)

        # Read news roughly once per hour
        if datetime.now() - last_news_time >= timedelta(hours=1):
            news = read_news_from_feed()
            if news:
                speak_text(news, filename="news.mp3")
            last_news_time = datetime.now()


if __name__ == "__main__":
    main()
