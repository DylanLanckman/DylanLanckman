"""Install required Python packages for the music program."""

import subprocess
import sys
from pathlib import Path


def install() -> None:
    """Install dependencies listed in requirements.txt using pip."""
    req_file = Path("requirements.txt")
    if not req_file.exists():
        print("requirements.txt not found.")
        return
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(req_file)])


if __name__ == "__main__":
    install()
