"""Prototype: Bridge MIDI controllers to Music Assistant commands.

This script listens to the first available MIDI input device using the
``mido`` library. When a Note On message is received it triggers a simple
HTTP request to a hypothetical Music Assistant API. The mapping between
MIDI messages and API endpoints can be extended to provide full control
of Music Assistant from within Virtual DJ.
"""

from __future__ import annotations

import mido
import requests

MUSIC_ASSISTANT_URL = "http://localhost:8095/api/media"


def handle_message(msg: mido.Message) -> None:
    """Handle incoming MIDI messages."""
    if msg.type == "note_on" and msg.velocity > 0:
        requests.post(f"{MUSIC_ASSISTANT_URL}/play", json={"note": msg.note})
    elif msg.type == "control_change":
        requests.post(
            f"{MUSIC_ASSISTANT_URL}/control",
            json={"control": msg.control, "value": msg.value},
        )


def main() -> None:
    inputs = mido.get_input_names()
    if not inputs:
        raise RuntimeError("No MIDI input devices found")
    with mido.open_input(inputs[0]) as inport:
        print(f"Listening on {inputs[0]}")
        for msg in inport:
            handle_message(msg)


if __name__ == "__main__":
    main()
