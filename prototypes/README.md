# VirtualDJ Plugin Prototypes

This directory contains experimental prototypes for a future VirtualDJ
plugin that integrates with [Music Assistant](https://music-assistant.io).
The goal is to expose a VirtualDJ instance as a smart speaker and to
control Music Assistant media via MIDI controllers connected to
VirtualDJ.

## Components

- `smart_speaker_advertiser.py` – broadcasts VirtualDJ on the local
  network via Zeroconf as a placeholder smart speaker.
- `midi_music_assistant_bridge.py` – listens to a MIDI controller and
  issues Music Assistant API calls based on received messages.
- `config_gui.py` – minimal Tkinter application for editing settings.

These scripts are for demonstration purposes only and are **not** a
complete plugin.
