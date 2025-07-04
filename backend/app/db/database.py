# app/db/database.py

from pymongo import MongoClient
from ..config import settings

client = MongoClient(settings.MONGO_URI)
db_client = client[settings.MONGO_DB_NAME]

songs_collection = db_client["songs"]
users_collection = db_client["users"]
history_collection = db_client["history"]