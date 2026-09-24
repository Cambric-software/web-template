"""
Cambric Software website-template Python service foundation.

Product-specific Python functionality belongs in this directory.
The base template intentionally contains no application-specific backend.
"""

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def health_check() -> dict:
    return {
        "status": "ok",
        "service": "cambric-template",
    }


if __name__ == "__main__":
    print(health_check())
