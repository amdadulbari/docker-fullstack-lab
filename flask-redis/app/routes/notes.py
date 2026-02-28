"""
Notes Routes — app/routes/notes.py
────────────────────────────────────
Full CRUD for the Note resource, stored directly in Redis.

Redis data layout:
  note:{uuid}          → Hash  — stores all fields of a single note
  notes:ids            → Set   — tracks every note's UUID (for listing)

Why Redis Hashes?
  A Hash lets you store and update individual fields (title, content, etc.)
  without re-serializing the whole object, unlike storing JSON strings.

Endpoints (all prefixed with /api/v1 by the blueprint registration in __init__.py):
  GET    /api/v1/notes/           → list all notes
  POST   /api/v1/notes/           → create a note
  GET    /api/v1/notes/<id>       → get one note
  PUT    /api/v1/notes/<id>       → update a note
  DELETE /api/v1/notes/<id>       → delete a note
"""

import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from app.extensions import redis_client

notes_bp = Blueprint('notes', __name__)

# ── Redis key helpers ──────────────────────────────────────────────
def note_key(note_id: str) -> str:
    """Returns the Redis key for a single note hash."""
    return f'note:{note_id}'

# The Redis Set that holds all note IDs — used to list all notes
NOTES_INDEX = 'notes:ids'


# ── List All Notes ─────────────────────────────────────────────────
@notes_bp.route('/notes', methods=['GET'])
def list_notes():
    """
    GET /api/v1/notes/

    Fetches all note IDs from the index set,
    then retrieves each note hash from Redis.
    Returns notes sorted by creation time (newest first).
    """
    # SMEMBERS returns a Python set of all IDs
    note_ids = redis_client.smembers(NOTES_INDEX)

    notes = []
    for nid in note_ids:
        note = redis_client.hgetall(note_key(nid))
        if note:   # skip orphaned IDs (shouldn't happen, but defensive)
            notes.append(note)

    # Sort by created_at descending (newest first)
    notes.sort(key=lambda n: n.get('created_at', ''), reverse=True)

    return jsonify({'count': len(notes), 'notes': notes}), 200


# ── Create a Note ──────────────────────────────────────────────────
@notes_bp.route('/notes', methods=['POST'])
def create_note():
    """
    POST /api/v1/notes/

    Expects JSON body: { "title": "...", "content": "..." }
    'title' is required. 'content' is optional.

    Stores the note as a Redis Hash and adds its ID to the index set.
    Returns the created note with a 201 status code.
    """
    body = request.get_json(silent=True)

    # Validate input
    if not body:
        return jsonify({'error': 'JSON body is required'}), 400
    if not body.get('title', '').strip():
        return jsonify({'error': "'title' field is required and cannot be blank"}), 400

    # Generate a unique ID and timestamp
    note_id  = str(uuid.uuid4())
    now      = datetime.now(timezone.utc).isoformat()

    note = {
        'id':         note_id,
        'title':      body['title'].strip(),
        'content':    body.get('content', '').strip(),
        'created_at': now,
        'updated_at': now,
    }

    # HSET stores the dict as a Redis Hash
    redis_client.hset(note_key(note_id), mapping=note)

    # SADD adds the ID to our index set
    redis_client.sadd(NOTES_INDEX, note_id)

    return jsonify(note), 201


# ── Get a Single Note ──────────────────────────────────────────────
@notes_bp.route('/notes/<note_id>', methods=['GET'])
def get_note(note_id):
    """
    GET /api/v1/notes/<note_id>

    Retrieves a single note by ID.
    Returns 404 if the note doesn't exist.
    """
    # HGETALL returns an empty dict {} if the key doesn't exist
    note = redis_client.hgetall(note_key(note_id))

    if not note:
        return jsonify({'error': f"Note '{note_id}' not found"}), 404

    return jsonify(note), 200


# ── Update a Note ──────────────────────────────────────────────────
@notes_bp.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    """
    PUT /api/v1/notes/<note_id>

    Updates title and/or content of an existing note.
    Only the provided fields are updated (partial update friendly).
    'updated_at' is always refreshed.
    """
    existing = redis_client.hgetall(note_key(note_id))

    if not existing:
        return jsonify({'error': f"Note '{note_id}' not found"}), 404

    body = request.get_json(silent=True)
    if not body:
        return jsonify({'error': 'JSON body is required'}), 400

    # Build update dict — only change what was provided
    updates = {
        'title':      body.get('title',   existing['title']).strip(),
        'content':    body.get('content', existing.get('content', '')).strip(),
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }

    # Validate title isn't being blanked out
    if not updates['title']:
        return jsonify({'error': "'title' cannot be blank"}), 400

    redis_client.hset(note_key(note_id), mapping=updates)

    # Fetch and return the full updated note
    updated_note = redis_client.hgetall(note_key(note_id))
    return jsonify(updated_note), 200


# ── Delete a Note ──────────────────────────────────────────────────
@notes_bp.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    """
    DELETE /api/v1/notes/<note_id>

    Removes the note hash from Redis and its ID from the index set.
    Returns 404 if the note doesn't exist.
    """
    if not redis_client.exists(note_key(note_id)):
        return jsonify({'error': f"Note '{note_id}' not found"}), 404

    # DEL removes the hash entirely
    redis_client.delete(note_key(note_id))

    # SREM removes the ID from the index set
    redis_client.srem(NOTES_INDEX, note_id)

    return jsonify({'message': f"Note '{note_id}' deleted successfully"}), 200
