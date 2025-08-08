- 👋 Hi, I’m @DylanLanckman
- 👀 I’m interested in music and home automation
- 🌱 I’m currently learning Internet Of Things
- 💞️ I’m looking to collaborate on Home Assistant and ESP32
- 📫 How to reach me ...

## Music Program with LLM Commentator

This repository now includes a simple Python script (`music_program.py`) that demonstrates how to:

- Play music from a local `local_music/` folder and from a Spotify playlist.
- Insert a text-to-speech commentator powered by an LLM after every 3 to 6 songs.
- Let the commentator share a random fact and discuss upcoming tracks in the queue.
- Once every hour, fetch news from a JSON feed and let the commentator read it aloud.

### Requirements
Use the helper script to install all dependencies:

```bash
python install_requirements.py
```
This script reads `requirements.txt` and installs the listed libraries.

You can also install them manually with pip:

```bash
pip install -r requirements.txt
```
This command accomplishes the same but requires running pip directly.

### Usage

1. Put your local MP3 files in the `local_music/` directory.
2. Configure API keys via the included Tkinter menu:

   ```bash
   python config_ui.py
   ```

   This stores values such as `OPENAI_API_KEY`, `SPOTIPY_CLIENT_ID`, and `NEWS_FEED_URL` in `config.json`.
3. Put any additional environment variables or leave them blank in the menu if you prefer to export them manually.
4. Run the script:

```bash
python music_program.py
```
This starts the program, which alternates between music playback and spoken commentary.

### GUI Music Player

For a more traditional media-player experience run the graphical interface:

```bash
python music_player_gui.py
```

The window provides a playlist view, standard playback controls (play, pause,
next, previous, stop) and a volume slider. API keys can be configured from the
`Settings -> Configure APIs` menu without leaving the application.

<!---
DylanLanckman/DylanLanckman is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->
