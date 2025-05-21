from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Scene, Actrice, Acteur, Tag, Favorite, History

import os

app = Flask(__name__)
CORS(app)  # Autorise les requêtes du frontend React

# Config SQLite : le fichier sera créé dans backend/
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'intyma.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Lier l'app Flask à SQLAlchemy
db.init_app(app)

@app.route('/')
def home():
    return "API Intyma – Backend prêt !"

# Exemple : route qui liste toutes les scènes (vide pour l’instant)
@app.route('/api/scenes')
def get_scenes():
    scenes = Scene.query.all()
    result = []
    for s in scenes:
        result.append({
            "id": s.id,
            "titre": s.titre,
            "chemin": s.chemin,
            "note_perso": s.note_perso,
            "date_ajout": s.date_ajout.isoformat() if s.date_ajout else None,
            # Ajoute d’autres champs au besoin
        })
    return jsonify(result)

@app.route('/api/actrices')
def get_actrices():
    actrices = Actrice.query.all()
    result = []
    for a in actrices:
        result.append({
            "id": a.id,
            "nom": a.nom,
            "note_moyenne": a.note_moyenne,
            "photo": a.photo,
            "derniere_vue": a.derniere_vue.isoformat() if a.derniere_vue else None,
            "commentaire": a.commentaire,
            # Ajoute d'autres champs au besoin
        })
    return jsonify(result)

@app.route('/api/tags')
def get_tags():
    tags = Tag.query.all()
    result = [{"id": t.id, "nom": t.nom} for t in tags]
    return jsonify(result)

@app.route('/api/favorites')
def get_favorites():
    favs = Favorite.query.all()
    result = []
    for f in favs:
        scene = Scene.query.get(f.scene_id)
        result.append({
            "id": f.id,
            "scene_id": scene.id,
            "titre": scene.titre,
            "chemin": scene.chemin,
            "date_ajout": f.date_ajout.isoformat() if f.date_ajout else None,
        })
    return jsonify(result)

@app.route('/api/history')
def get_history():
    hists = History.query.all()
    result = []
    for h in hists:
        scene = Scene.query.get(h.scene_id)
        result.append({
            "id": h.id,
            "scene_id": scene.id,
            "titre": scene.titre,
            "chemin": scene.chemin,
            "date_vue": h.date_vue.isoformat() if h.date_vue else None,
            "note_session": h.note_session,
            "commentaire_session": h.commentaire_session,
        })
    return jsonify(result)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée toutes les tables si elles n’existent pas
    app.run(debug=True)
