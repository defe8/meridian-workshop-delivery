"""
Mock data for the Factory Inventory Management System.

Loads seed data from JSON files in `data/`. Mutable collections
(`tasks`, `purchase_orders`) are persisted back to disk via
`save_json_file()` after every change so they survive server restarts.
"""

import json
import os
from typing import Any

# Get the directory where this file is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')


def load_json_file(filename: str, default: Any = None) -> Any:
    """Load data from a JSON file in the data directory.

    If the file is missing, return `default` (and create the file with that
    default if `default` is not None). This makes the system tolerant of a
    fresh checkout where mutable collections like tasks haven't been written
    yet.
    """
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        if default is not None:
            save_json_file(filename, default)
            return default
        raise FileNotFoundError(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json_file(filename: str, data: Any) -> None:
    """Atomically persist `data` to JSON in the data directory.

    Writes to a sibling tmp file then renames to avoid leaving a half-written
    file if the process is killed mid-write.
    """
    filepath = os.path.join(DATA_DIR, filename)
    tmp_path = filepath + '.tmp'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp_path, filepath)


# Read-only seed data
inventory_items = load_json_file('inventory.json')
orders = load_json_file('orders.json')
demand_forecasts = load_json_file('demand_forecasts.json')
backlog_items = load_json_file('backlog_items.json')

spending_data = load_json_file('spending.json')
spending_summary = spending_data['spending_summary']
monthly_spending = spending_data['monthly_spending']
category_spending = spending_data['category_spending']

recent_transactions = load_json_file('transactions.json')

# Mutable collections — persisted after every write
purchase_orders = load_json_file('purchase_orders.json', default=[])
tasks = load_json_file('tasks.json', default=[])
