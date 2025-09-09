"""Prototype configuration GUI for the Virtual DJ plugin.

The real plugin would expose a richer configuration interface inside
Virtual DJ. This Tkinter example demonstrates how basic settings such as
MIDI device selection and Music Assistant endpoint could be edited and
stored in a JSON file.
"""

from __future__ import annotations

import json
from pathlib import Path
import tkinter as tk
from tkinter import ttk

CONFIG_PATH = Path(__file__).with_name("config.json")


class ConfigGUI(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("VirtualDJ Plugin Config")
        tk.Label(self, text="Music Assistant URL").grid(row=0, column=0, sticky="w")
        self.url_var = tk.StringVar(value="http://localhost:8095")
        tk.Entry(self, textvariable=self.url_var, width=40).grid(row=0, column=1)
        tk.Label(self, text="MIDI Device").grid(row=1, column=0, sticky="w")
        self.device_var = tk.StringVar(value="default")
        tk.Entry(self, textvariable=self.device_var, width=40).grid(row=1, column=1)
        ttk.Button(self, text="Save", command=self.save).grid(
            row=2, column=0, columnspan=2, pady=5
        )

    def save(self) -> None:
        data = {
            "music_assistant_url": self.url_var.get(),
            "midi_device": self.device_var.get(),
        }
        CONFIG_PATH.write_text(json.dumps(data, indent=2))
        self.destroy()


if __name__ == "__main__":
    app = ConfigGUI()
    app.mainloop()
