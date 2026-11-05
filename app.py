import json
import os
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__, template_folder='.', static_folder='static')
scores_file = 'scores.json'

def load_scores():
    if os.path.exists(scores_file):
        try:
            with open(scores_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_scores(scores):
    with open(scores_file, 'w') as f:
        json.dump(scores, f, indent=2)

@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/scores", methods=["GET"])
def get_scores():
    scores = load_scores()
    best = scores[0]["score"] if scores else 0
    return jsonify({"best": best, "leaderboard": scores})

@app.route("/score", methods=["POST"])
def add_score():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "Anon").strip().upper()[:10]
    score = int(data.get("score", 0))
    time_s = float(data.get("time", 0.0))
    moves = int(data.get("moves", 0))
    
    scores = load_scores()
    scores.append({
        "name": name,
        "score": score,
        "time": round(time_s, 1),
        "moves": moves
    })
    scores.sort(key=lambda x: (-x["score"], x["time"]))
    scores = scores[:5]  # Keep only top 5 scores
    save_scores(scores)
    
    best = scores[0]["score"] if scores else 0
    return jsonify({"best": best, "leaderboard": scores})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
