# app/db/database.py

import logging
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from ..config import settings

logger = logging.getLogger(__name__)

# MongoDB client with connection pooling settings
client: MongoClient | None = None
db_client = None
songs_collection = None
users_collection = None
history_collection = None


def get_client() -> MongoClient:
    """Get or create the MongoDB client with proper connection pooling."""
    global client
    if client is None:
        client = MongoClient(
            settings.MONGO_URI,
            maxPoolSize=50,
            minPoolSize=5,
            maxIdleTimeMS=30000,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            retryWrites=True,
        )
    return client


def init_db() -> None:
    """
    Initialize database connection and create indexes.
    Call this during application startup.
    """
    global db_client, songs_collection, users_collection, history_collection
    
    mongo_client = get_client()
    db_client = mongo_client[settings.MONGO_DB_NAME]
    
    songs_collection = db_client["songs"]
    users_collection = db_client["users"]
    history_collection = db_client["history"]
    
    # Create indexes for performance and data integrity
    _ensure_indexes()
    
    logger.info(f"Database initialized: {settings.MONGO_DB_NAME}")


def _ensure_indexes() -> None:
    """Create necessary indexes for optimal query performance."""
    try:
        # History collection indexes
        # Unique compound index to prevent duplicate history entries
        history_collection.create_index(
            [("user_id", ASCENDING), ("track_id", ASCENDING), ("played_at", ASCENDING)],
            unique=True,
            name="history_unique_play"
        )
        # Index for efficient user history queries
        history_collection.create_index(
            [("user_id", ASCENDING), ("played_at", ASCENDING)],
            name="history_user_time"
        )
        
        # Users collection indexes
        users_collection.create_index(
            [("user_id", ASCENDING)],
            unique=True,
            name="users_user_id"
        )
        
        # Songs collection indexes
        songs_collection.create_index(
            [("user_id", ASCENDING), ("played_at", ASCENDING)],
            name="songs_user_time"
        )
        songs_collection.create_index(
            [("username", ASCENDING), ("played_at", ASCENDING)],
            name="songs_username_time"
        )
        
        logger.info("Database indexes created/verified")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


def verify_connection() -> bool:
    """
    Verify MongoDB connection is working.
    Returns True if connection is healthy.
    """
    try:
        mongo_client = get_client()
        mongo_client.admin.command('ping')
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False


def close_db() -> None:
    """
    Close database connection gracefully.
    Call this during application shutdown.
    """
    global client, db_client, songs_collection, users_collection, history_collection
    
    if client is not None:
        client.close()
        client = None
        db_client = None
        songs_collection = None
        users_collection = None
        history_collection = None
        logger.info("Database connection closed")


def get_songs_collection():
    """Get the songs collection. Must call init_db() first."""
    if songs_collection is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return songs_collection


def get_users_collection():
    """Get the users collection. Must call init_db() first."""
    if users_collection is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return users_collection


def get_history_collection():
    """Get the history collection. Must call init_db() first."""
    if history_collection is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return history_collection