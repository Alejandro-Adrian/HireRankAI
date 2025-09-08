import json
import base64
import asyncio
import jwt
import datetime
from Crypto.Cipher import AES
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import concurrent.futures
import threading

from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

from GenerativeAI.app import AI_Interface
from encryptData import encrypt

from base64 import b64decode

app = Flask(__name__)
app.config["SECRET_KEY"] = "super-secret-key"
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])

with open("private.pem", "rb") as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

connected_users = {}

def generate_token(username):
    payload = {
        "user": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["user"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@app.route("/token", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    username = request.json.get("username")
    if not username:
        return jsonify({"error": "Missing username"}), 400
    token = generate_token(username)
    return jsonify({"token": token})

async def routing(instruction, message):
    if instruction == "AI":
        result = await AI_Interface(message, "chat")
        return {"encrypted": encrypt({"message": result})}
    elif instruction == "grade":
        result = await AI_Interface(message, "grader")
        return {"encrypted": encrypt({"result": result})}
    else:
        return {"encrypted": encrypt({"error": "Unknown instruction"})}

@socketio.on("connect")
def on_connect():
    print("Client connected:", request.sid)

@socketio.on("disconnect")
def on_disconnect():
    print("🔌 Client disconnected:", request.sid)
    connected_users.pop(request.sid, None)

@socketio.on("authenticate")
def handle_auth(data):
    token = data.get("token")
    user = verify_token(token)
    if user:
        connected_users[request.sid] = user
        emit("auth_success", {"message": f"Welcome, {user}!"})
    else:
        emit("auth_failed", {"error": "Invalid or expired token"})
        disconnect()

@socketio.on("client_request")
@limiter.limit("150 per minute")
def handle_send(data):
    try:
        if request.sid not in connected_users:
            emit("result", {"error": "Unauthorized"})
            return

        encrypted = data.get("encrypted")
        encrypted_bytes = base64.b64decode(encrypted)

        decrypted = private_key.decrypt(
            encrypted_bytes,
            padding.PKCS1v15()
        )
        decrypted_text = decrypted.decode()

        payload = json.loads(decrypted_text)
        instruction = payload.get("instruction")
        message = payload.get("message")

        socketio.start_background_task(process_task, request.sid, instruction, message)

    except Exception as e:
        emit("result", {"error": str(e)})

def process_task(sid, instruction, message):
    result = asyncio.run(routing(instruction, message))
    socketio.emit("result", result, to=sid)

SAMPLE_RATE = 16000
BYTES_PER_SAMPLE = 2
CHUNK_SECONDS = 1.2
CHUNK_BYTES = int(SAMPLE_RATE * CHUNK_SECONDS * BYTES_PER_SAMPLE)

try:
    transcriber = Transcriber(model_path="./faster-whisper-small", device="cuda", compute_type="int8")
except Exception as e:
    print("[main] Warning: Transcriber failed to initialize:", e)
    transcriber = None

audio_buffers = {}
buffers_lock = threading.Lock()

executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

def submit_transcription_task(sid, chunk_bytes):
    """
    Offload to executor, then emit result back to client when done.
    """
    def work():
        try:
            if transcriber is None:
                return {"type": "final", "text": ""}
            text = transcriber.transcribe_chunk_pcm16(chunk_bytes, sample_rate=SAMPLE_RATE)
            return {"type": "final", "text": text}
        except Exception as e:
            print("[transcription task] error:", e)
            return {"type": "final", "text": ""}

    future = executor.submit(work)

    def _on_done(fut):
        res = fut.result()
        try:
            socketio.emit("stt_result", res, to=sid)
        except Exception as e:
            print("[stt emit] failed:", e)

    future.add_done_callback(_on_done)

@socketio.on("audio_chunk")
def handle_audio_chunk(data):
    """
    Expectation:
    - client emits binary audio as Int16 PCM bytes (16kHz mono)
    - If client sends base64 text, adapt decode accordingly
    """
    sid = request.sid

    if isinstance(data, dict) and data.get("b64"):
        try:
            chunk = base64.b64decode(data["b64"])
        except Exception:
            return
    elif isinstance(data, (bytes, bytearray)):
        chunk = data
    else:
        return

    with buffers_lock:
        buf = audio_buffers.get(sid)
        if buf is None:
            buf = bytearray()
            audio_buffers[sid] = buf
        buf.extend(chunk)
        while len(buf) >= CHUNK_BYTES:
            chunk_bytes = bytes(buf[:CHUNK_BYTES])
            del buf[:CHUNK_BYTES]
            submit_transcription_task(sid, chunk_bytes)

@socketio.on("end_stream")
def handle_end_stream():
    """
    Call when client finishes sending audio. Transcribe remaining buffer if any.
    """
    sid = request.sid
    with buffers_lock:
        buf = audio_buffers.pop(sid, None)
    if buf and len(buf) > 0:
        submit_transcription_task(sid, bytes(buf))

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
