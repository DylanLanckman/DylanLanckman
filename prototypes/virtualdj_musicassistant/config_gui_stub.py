"""
Prototype configuration GUI for the Virtual DJ Music Assistant plugin.
Provides simple interface to configure Music Assistant connection.
"""

import tkinter as tk
from tkinter import ttk

class ConfigGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Music Assistant Plugin")
        self.geometry("400x200")
        ttk.Label(self, text="Music Assistant URL").pack(pady=10)
        self.url_var = tk.StringVar(value="http://localhost:8080")
        ttk.Entry(self, textvariable=self.url_var, width=40).pack()
        ttk.Button(self, text="Save", command=self.save).pack(pady=20)

    def save(self):
        # TODO: persist configuration
        print(f"Saved URL: {self.url_var.get()}")

if __name__ == "__main__":
    ConfigGUI().mainloop()
