#!/usr/bin/env python3
"""
AutoPrime Local Database & Automated GitHub Sync Engine
Manages SQLite database for fleet, prices, and leads, and auto-pushes to GitHub.
"""

import sqlite3
import json
import os
import subprocess
from pathlib import Path

DB_PATH = "/home/vertex-medical/Documents/Default Project/car-hub/database.sqlite"
REPO_DIR = "/home/vertex-medical/Documents/Default Project/car-hub"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Cars table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        daily_price REAL NOT NULL,
        buy_price TEXT,
        specs TEXT,
        image_url TEXT,
        status TEXT DEFAULT available,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Bookings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        customer_phone TEXT,
        customer_email TEXT,
        car_id INTEGER,
        days INTEGER,
        total_amount REAL,
        status TEXT DEFAULT pending,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # System settings / Pricing
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)
    
    conn.commit()
    conn.close()
    print("[DB] Local SQLite Database Initialized successfully at " + DB_PATH)

def sync_to_github(commit_message):
    """Commits and pushes all code and data updates to GitHub automatically."""
    try:
        os.environ["GIT_SSH_COMMAND"] = "ssh -i /home/admin/.ssh/id_github -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
        subprocess.run(["git", "config", "--global", "--add", "safe.directory", "*"], cwd=REPO_DIR, check=True)
        subprocess.run(["git", "add", "."], cwd=REPO_DIR, check=True)
        subprocess.run(["git", "commit", "-m", commit_message], cwd=REPO_DIR, check=False)
        res = subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, capture_output=True, text=True, check=True)
        print(f"[GIT] Successfully synced and pushed to GitHub: {commit_message}")
        return True
    except Exception as e:
        print(f"[GIT ERROR] Failed to push to GitHub: {e}")
        return False

if __name__ == "__main__":
    init_db()
    sync_to_github("chore: initialize local database and auto-sync pipeline")

