"""
Migration script: normalize played_at fields to timezone-aware UTC datetimes.

What it does:
- Scans `history` and `songs` collections for documents where `played_at` is
  either a string that lacks timezone information or a naive ISO string.
- Converts such fields to Python datetimes with tz=timezone.utc and updates
  the documents in-place (MongoDB will store them as BSON datetimes).
- Copies original documents into backup collections before modifying.

Run: python backend/scripts/migrate_played_at_to_utc.py

Be sure to have your environment configured (MONGO_URI etc.).
"""
from pymongo import MongoClient
from datetime import datetime, timezone
import re
import os

from app.config import settings


def parse_maybe_naive_iso(s: str) -> datetime:
    """Parse an ISO datetime string. If it lacks timezone info, assume UTC.
    Returns a timezone-aware datetime in UTC.
    """
    # Quick check: if string ends with Z or contains +HH:MM / -HH:MM
    if re.search(r"Z$|[+-]\d{2}:?\d{2}$", s):
        # datetime.fromisoformat handles offsets like +00:00 but not trailing Z
        try:
            # normalize trailing Z to +00:00 for fromisoformat
            if s.endswith('Z'):
                s = s[:-1] + '+00:00'
            return datetime.fromisoformat(s).astimezone(timezone.utc)
        except Exception:
            pass

    # No timezone info — parse naive and assume UTC
    try:
        return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)
    except Exception:
        # Fallback: try common formats
        for fmt in ('%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f'):
            try:
                return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
            except Exception:
                continue
    raise ValueError(f"Unrecognized datetime format: {s}")


def migrate_collection(client: MongoClient, db_name: str, coll_name: str, backup_suffix: str = '_backup'):
    db = client[db_name]
    coll = db[coll_name]
    backup_coll = db[coll_name + backup_suffix]

    print(f"Scanning {db_name}.{coll_name}...")
    cursor = coll.find({}, {"_id": 1, "played_at": 1})
    updated = 0
    for doc in cursor:
        _id = doc['_id']
        played_at = doc.get('played_at')
        if played_at is None:
            continue

        # If it's already a datetime with tzinfo, skip
        if isinstance(played_at, datetime):
            if played_at.tzinfo is not None:
                continue
            # naive datetime — assume UTC and add tzinfo
            new_dt = played_at.replace(tzinfo=timezone.utc)
        elif isinstance(played_at, str):
            # If string has timezone (e.g., ends with Z or +HH:MM) we'll convert
            try:
                new_dt = parse_maybe_naive_iso(played_at)
            except ValueError as e:
                print(f"Skipping {_id}: {e}")
                continue
        else:
            # Unhandled type
            print(f"Skipping {_id}: unsupported played_at type {type(played_at)}")
            continue

        # Backup original document
        original = coll.find_one({"_id": _id})
        backup_coll.insert_one(original)

        # Update with timezone-aware datetime
        coll.update_one({"_id": _id}, {"$set": {"played_at": new_dt}})
        updated += 1

    print(f"Updated {updated} documents in {coll_name}")


def main():
    mongo_uri = os.environ.get('MONGO_URI', settings.MONGO_URI)
    db_name = os.environ.get('MONGO_DB_NAME', settings.MONGO_DB_NAME)
    client = MongoClient(mongo_uri)

    migrate_collection(client, db_name, 'history')
    migrate_collection(client, db_name, 'songs')


if __name__ == '__main__':
    main()
