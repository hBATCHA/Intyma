from flask import Flask, jsonify, send_from_directory, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Scene, Actrice, Acteur, Tag, Favorite, History
from datetime import datetime, date, timedelta
import random
import re
import os
from urllib.parse import quote
from werkzeug.utils import secure_filename
import subprocess
import platform


app = Flask(__name__)
CORS(app)  # Autorise les requêtes du frontend React

# Config SQLite : le fichier sera créé dans backend/
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'intyma.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

VIDEOS_PREFIX = '/Volumes/My Passport for Mac/Privé/M364TR0N/'

# Lier l'app Flask à SQLAlchemy
db.init_app(app)


@app.route('/')
def home():
    return "API Intyma – Backend prêt !"


@app.route('/api/scenes')
def get_scenes():
    scenes = Scene.query.all()
    result = []
    for s in scenes:
        # Construire la liste des actrices avec leurs détails
        actrices_data = []
        for actrice in s.actrices:  # s.actrices est la relation many-to-many
            actrices_data.append({
                "id": actrice.id,
                "nom": actrice.nom
            })

        result.append({
            "id": s.id,
            "titre": s.titre,
            "chemin": s.chemin,
            "note_perso": s.note_perso,
            "date_ajout": s.date_ajout.isoformat() if s.date_ajout else None,
            "synopsis": s.synopsis,
            "duree": s.duree,
            "qualite": s.qualite,
            "site": s.site,
            "studio": s.studio,
            "date_scene": s.date_scene.isoformat() if s.date_scene else None,
            "image": s.image,
            "niveau_plaisir": s.niveau_plaisir,
            "actrices": actrices_data,
            "tags": [{"id": t.id, "nom": t.nom} for t in s.tags],
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
            "biographie": a.biographie,                    # ✅ AJOUTÉ
            "photo": a.photo,
            "tags_typiques": a.tags_typiques,              # ✅ AJOUTÉ
            "note_moyenne": a.note_moyenne,
            "derniere_vue": a.derniere_vue.isoformat() if a.derniere_vue else None,
            "commentaire": a.commentaire,
            "date_naissance": a.date_naissance.isoformat() if a.date_naissance else None,  # ✅ AJOUTÉ
            "nationalite": a.nationalite,                  # ✅ AJOUTÉ
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
        scene = db.session.get(Scene, f.scene_id)  # Fix: Utiliser db.session.get() au lieu de Scene.query.get()
        if scene:
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
        scene = db.session.get(Scene, h.scene_id)  # Fix: Utiliser db.session.get()
        if scene:
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


@app.route('/miniatures/<actrice>/<filename>')
def serve_miniature(actrice, filename):
    path = f'/Volumes/My Passport for Mac/Intyma/miniatures/{actrice}'
    return send_from_directory(path, filename)


@app.route('/images/<actrice>/<filename>')
def serve_photo(actrice, filename):
    path = f'/Volumes/My Passport for Mac/Intyma/images/{actrice}'
    return send_from_directory(path, filename)


@app.route('/collections/<filename>')
def serve_collection_image(filename):
    path = '/Volumes/My Passport for Mac/Intyma/collections'
    return send_from_directory(path, filename)


def get_actrice_collection_image(actrice, base_dir="/Volumes/My Passport for Mac/Intyma"):
    """
    Retourne l'URL de l'image de collection pour une actrice
    """
    try:
        # 1. Cherche collection.jpg dans le dossier actrice
        collection_path = os.path.join(base_dir, "images", actrice.nom, "collection.jpg")
        if os.path.exists(collection_path):
            # Utiliser la même approche que dans actrice_du_jour()
            encoded_name = quote(actrice.nom, safe='')
            return f"/images/{encoded_name}/collection.jpg"

        # 2. Sinon, prend la première miniature de la meilleure scène de l'actrice
        def get_note_value(scene):
            try:
                note_str = str(scene.note_perso or '0')
                match = re.search(r'(\d+(?:\.\d+)?)', note_str)
                if match:
                    return float(match.group(1))
                return 0.0
            except Exception as e:
                print(f"Erreur get_note_value pour scene {scene.id}: {e}")
                return 0.0

        scenes_sorted = sorted(
            actrice.scenes,
            key=get_note_value,
            reverse=True
        )
        if scenes_sorted:
            first_scene = scenes_sorted[0]
            if first_scene.image:
                # Utiliser construct_miniature_url comme dans scenes_du_jour()
                return construct_miniature_url(first_scene)

        # 3. Sinon, portrait de l'actrice (même approche que pour la photo dans actrice_du_jour())
        if actrice.photo:
            try:
                # Extraire le nom de fichier du chemin complet
                filename = os.path.basename(actrice.photo)
                encoded_name = quote(actrice.nom, safe='')
                return f"/images/{encoded_name}/{quote(filename, safe='')}"
            except Exception as e:
                print(f"Erreur construction URL portrait pour {actrice.nom}: {e}")

        # 4. Fallback vers image par défaut
        return "/collections/premium.png"

    except Exception as e:
        print(f"Erreur get_actrice_collection_image pour {actrice.nom}: {e}")
        return "/collections/premium.png"


@app.route('/api/actrice_du_jour')
def actrice_du_jour():
    """
    Retourne l'actrice mise en avant du jour avec ses informations principales
    """
    try:
        # Logique pour sélectionner l'actrice du jour
        # Sélection basée sur la date du jour pour avoir une consistance
        actrices_avec_scenes = db.session.query(Actrice).join(Actrice.scenes).all()

        if not actrices_avec_scenes:
            # Données fallback si pas d'actrices
            return jsonify({
                "nom": "Stacy Rouse",
                "photo": "/static/img/actrices/stacy_rouse.jpg",
                "nb_scenes": 42,
                "note_moyenne": 4.8,
                "id": 1,
                "bio": "Actrice iconique, star de nombreuses scènes glamour.",
                "tags": ["glamour", "milf", "star"]
            })

        # Sélection déterministe basée sur la date
        today_seed = datetime.now().day
        random.seed(today_seed)
        actrice = random.choice(actrices_avec_scenes)

        # Calcul du nombre de scènes
        nb_scenes = len(actrice.scenes)

        # Calcul de la note moyenne
        notes = [scene.note_perso for scene in actrice.scenes if scene.note_perso]
        note_moyenne = 4.5  # Default
        if notes:
            try:
                notes_float = []
                for note in notes:
                    if isinstance(note, str):
                        match = re.search(r'(\d+(?:\.\d+)?)', note)
                        if match:  # Vérifier que match n'est pas None
                            notes_float.append(float(match.group(1)))
                    elif isinstance(note, (int, float)):
                        notes_float.append(float(note))

                if notes_float:
                    max_note = max(notes_float)
                    if max_note > 5:
                        notes_float = [n * 5 / max_note for n in notes_float]
                    note_moyenne = round(sum(notes_float) / len(notes_float), 1)
            except Exception as e:
                print(f"Erreur calcul note moyenne: {e}")
                note_moyenne = 4.5

        # Tags typiques
        tags = []
        if actrice.tags_typiques:
            tags = [tag.strip() for tag in actrice.tags_typiques.split(',')]

        # Construire l'URL photo correctement
        photo_url = "/static/img/default_actress.jpg"
        if actrice.photo:
            try:
                # Extraire le nom de fichier du chemin complet
                filename = os.path.basename(actrice.photo)
                encoded_name = quote(actrice.nom, safe='')
                photo_url = f"/images/{encoded_name}/{quote(filename, safe='')}"
            except Exception as e:
                print(f"Erreur construction URL photo: {e}")

        return jsonify({
            "nom": actrice.nom,
            "photo": photo_url,
            "nb_scenes": nb_scenes,
            "note_moyenne": note_moyenne,
            "id": actrice.id,
            "bio": actrice.biographie or f"Découvrez {actrice.nom}, une actrice talentueuse avec {nb_scenes} scènes à son actif.",
            "tags": tags[:3] if tags else ["star", "premium"]
        })

    except Exception as e:
        print(f"Erreur actrice_du_jour: {e}")
        return jsonify({
            "nom": "Stacy Rouse",
            "photo": "/static/img/actrices/stacy_rouse.jpg",
            "nb_scenes": 42,
            "note_moyenne": 4.8,
            "id": 1,
            "bio": "Actrice iconique, star de nombreuses scènes glamour.",
            "tags": ["glamour", "milf", "star"]
        })


def construct_miniature_url(scene):
    """
    Construit l'URL de miniature pour une scène
    """
    if not scene.image:
        return "/static/img/default_scene.jpg"

    try:
        parts = scene.image.split('/')
        if len(parts) >= 2:
            actrice_name = parts[-2]
            filename = parts[-1]
            return f"/miniatures/{quote(actrice_name, safe='')}/{quote(filename, safe='')}"
    except Exception as e:
        print(f"Erreur construction URL miniature: {e}")

    return "/static/img/default_scene.jpg"


@app.route('/api/scenes_du_jour')
def scenes_du_jour():
    """
    Retourne une sélection de scènes à mettre en avant aujourd'hui
    """
    try:
        scenes_selection = []

        # 1. Récupérer l'actrice du jour et ses scènes (2-3 scènes)
        actrice_response = actrice_du_jour()
        actrice_data = actrice_response.get_json()
        actrice_id = actrice_data.get('id')

        if actrice_id and actrice_id != 1:  # Éviter le fallback
            actrice = db.session.get(Actrice, actrice_id)  # Fix: Utiliser db.session.get()
            if actrice and actrice.scenes:
                scenes_actrice = random.sample(actrice.scenes, min(3, len(actrice.scenes)))
                for scene in scenes_actrice:
                    scenes_selection.append({
                        "id": scene.id,
                        "titre": scene.titre,
                        "miniature": construct_miniature_url(scene),
                        "duree": scene.duree or 30,
                        "note": 4.5,
                        "tags": ["actrice du jour", "premium"],
                        "type": "actrice_du_jour"
                    })

        # 2. Scènes récentes (2-3 scènes)
        scenes_recentes = Scene.query.filter(Scene.date_ajout.isnot(None)).order_by(Scene.date_ajout.desc()).limit(
            3).all()
        for scene in scenes_recentes:
            if len(scenes_selection) < 6:
                scenes_selection.append({
                    "id": scene.id,
                    "titre": scene.titre,
                    "miniature": construct_miniature_url(scene),
                    "duree": scene.duree or 25,
                    "note": 4.3,
                    "tags": ["nouveau", "récent"],
                    "type": "recent"
                })

        # 3. Compléter avec des scènes de qualité
        if len(scenes_selection) < 6:
            scenes_quality = Scene.query.filter(Scene.qualite.in_(['HD', '4K', 'Full HD'])).all()
            if scenes_quality:
                scenes_random = random.sample(scenes_quality, min(6 - len(scenes_selection), len(scenes_quality)))
                for scene in scenes_random:
                    scenes_selection.append({
                        "id": scene.id,
                        "titre": scene.titre,
                        "miniature": construct_miniature_url(scene),
                        "duree": scene.duree or 28,
                        "note": 4.4,
                        "tags": ["hot", scene.qualite.lower() if scene.qualite else "hd"],
                        "type": "quality"
                    })

        # Fallback si pas de scènes
        if not scenes_selection:
            scenes_selection = [
                {
                    "id": 1,
                    "titre": "Scène Premium #1",
                    "miniature": "/static/img/scenes/premium1.jpg",
                    "duree": 32,
                    "note": 4.8,
                    "tags": ["hot", "premium"],
                    "type": "featured"
                }
            ]

        return jsonify(scenes_selection[:6])

    except Exception as e:
        print(f"Erreur scenes_du_jour: {e}")
        return jsonify([
            {
                "id": 1,
                "titre": "Scène Premium #1",
                "miniature": "/static/img/scenes/premium1.jpg",
                "duree": 32,
                "note": 4.8,
                "tags": ["hot", "premium"],
                "type": "featured"
            }
        ])

@app.route('/api/collections_favorites')
def collections_favorites():
    try:
        collections = []

        # 1. Collection "Mes Favoris"
        favoris = Favorite.query.all()
        if favoris:
            collections.append({
                "id": "favoris",
                "titre": "Mes Favoris ❤️",
                "image": "/collections/favoris.png",
                "nb_videos": len(favoris),
                "nb_vues": sum([len(fav.scene.histories) if fav.scene else 0 for fav in favoris]),
                "type": "favoris"
            })

        # 2. Collections par actrices populaires (augmenté à 6) avec données enrichies
        actrices_populaires = db.session.query(Actrice).join(Actrice.scenes).group_by(Actrice.id).order_by(
            db.func.count(Scene.id).desc()).limit(6).all()

        # Déterminer l'actrice la plus regardée
        top_actress_id = None
        if actrices_populaires:
            actress_views = {}
            for actrice in actrices_populaires:
                total_views = sum([len(scene.histories) for scene in actrice.scenes if scene.histories])
                actress_views[actrice.id] = total_views

            if actress_views:
                top_actress_id = max(actress_views, key=actress_views.get)

        for actrice in actrices_populaires:
            # Calculer le nombre de scènes "hot" (note élevée ou tags spéciaux)
            hot_scenes_count = 0
            total_note = 0
            note_count = 0

            for scene in actrice.scenes:
                # Compter les scènes avec note élevée (>= 4.0)
                if scene.note_perso:
                    try:
                        if isinstance(scene.note_perso, str):
                            match = re.search(r'(\d+(?:\.\d+)?)', scene.note_perso)
                            if match:
                                note = float(match.group(1))
                                if note > 5:  # Normaliser si note sur plus de 5
                                    note = note * 5 / 10  # Exemple: note sur 10 -> sur 5
                                total_note += note
                                note_count += 1
                                if note >= 4.0:
                                    hot_scenes_count += 1
                        elif isinstance(scene.note_perso, (int, float)):
                            note = float(scene.note_perso)
                            if note > 5:
                                note = note * 5 / 10
                            total_note += note
                            note_count += 1
                            if note >= 4.0:
                                hot_scenes_count += 1
                    except:
                        pass

                # Compter les scènes avec tags "hot"
                if scene.tags:
                    for tag in scene.tags:
                        if tag.nom.lower() in ['hot', 'sexy', 'intense', 'hardcore']:
                            hot_scenes_count += 1
                            break

            # Calculer la note moyenne
            note_moyenne = total_note / note_count if note_count > 0 else 0

            collections.append({
                "id": f"actrice_{actrice.id}",
                "titre": f"Collection {actrice.nom}",
                "image": get_actrice_collection_image(actrice),
                "nb_videos": len(actrice.scenes),
                "nb_vues": sum([len(scene.histories) for scene in actrice.scenes if scene.histories]),
                "type": "actrice",
                # ✨ NOUVELLES DONNÉES pour les badges
                "is_top_actress": actrice.id == top_actress_id,
                "hot_scenes_count": hot_scenes_count,
                "note_moyenne": round(note_moyenne, 1) if note_moyenne > 0 else None
            })

        # 3. Collection HD Premium
        hd_count = Scene.query.filter(Scene.qualite.in_(['HD', '4K', 'Full HD'])).count()
        if hd_count > 0:
            collections.append({
                "id": "hd_premium",
                "titre": "HD Premium",
                "image": "/collections/hd_premium.png",
                "nb_videos": hd_count,
                "nb_vues": 200,
                "type": "qualite"
            })

        # 4. Collection par studio populaire
        studios_populaires = db.session.query(Scene.studio, db.func.count(Scene.id).label('count')).filter(
            Scene.studio.isnot(None)
        ).group_by(Scene.studio).order_by(db.func.count(Scene.id).desc()).limit(2).all()

        for studio, count in studios_populaires:
            if count > 3:  # Seulement si le studio a plus de 3 scènes
                collections.append({
                    "id": f"studio_{studio.replace(' ', '_').lower()}",
                    "titre": f"Collection {studio}",
                    "image": "/collections/studio_default.png",
                    "nb_videos": count,
                    "nb_vues": count * 15,
                    "type": "studio"
                })

        # 5. Collection par site populaire
        sites_populaires = db.session.query(Scene.site, db.func.count(Scene.id).label('count')).filter(
            Scene.site.isnot(None)
        ).group_by(Scene.site).order_by(db.func.count(Scene.id).desc()).limit(2).all()

        for site, count in sites_populaires:
            if count > 3:  # Seulement si le site a plus de 3 scènes
                collections.append({
                    "id": f"site_{site.replace(' ', '_').lower()}",
                    "titre": f"Collection {site}",
                    "image": "/collections/site_default.png",
                    "nb_videos": count,
                    "nb_vues": count * 12,
                    "type": "site"
                })

        # 6. Collection des scènes récentes
        recent_count = Scene.query.filter(
            Scene.date_ajout >= (datetime.now() - timedelta(days=30)).date()).count() if Scene.query.filter(
            Scene.date_ajout.isnot(None)).first() else 0

        if recent_count > 0:
            collections.append({
                "id": "recent",
                "titre": "Ajouts Récents",
                "image": "/collections/recent.png",
                "nb_videos": recent_count,
                "nb_vues": recent_count * 8,
                "type": "recent"
            })

        # Fallback si pas de collections
        if not collections:
            collections = [
                {
                    "id": "premium",
                    "titre": "Collection Premium",
                    "image": "/collections/premium.png",
                    "nb_videos": 25,
                    "nb_vues": 156,
                    "type": "premium"
                }
            ]

        # Retourner jusqu'à 8 collections au lieu de 4
        return jsonify(collections[:8])

    except Exception as e:
        print(f"Erreur collections_favorites: {e}")
        return jsonify([
            {
                "id": "premium",
                "titre": "Collection Premium",
                "image": "/collections/premium.png",
                "nb_videos": 25,
                "nb_vues": 156,
                "type": "premium"
            }
        ])

@app.route('/api/stats')
def get_stats():
    """
    Retourne les statistiques de visionnage et de la collection
    """
    try:
        # Nombre total de scènes
        total_scenes = Scene.query.count()

        # Temps total de visionnage
        histories = History.query.all()
        temps_total = 0
        for history in histories:
            if history.scene and history.scene.duree:
                temps_total += history.scene.duree
        heures_visionnage = round(temps_total / 60, 1) if temps_total > 0 else 0

        # Top actrice regardée
        top_actrice = None
        if histories:
            actrice_vues = {}
            for history in histories:
                if history.scene:
                    for actrice in history.scene.actrices:
                        if actrice.id not in actrice_vues:
                            actrice_vues[actrice.id] = {
                                'actrice': actrice,
                                'vues': 0
                            }
                        actrice_vues[actrice.id]['vues'] += 1

            if actrice_vues:
                top_actrice_data = max(actrice_vues.values(), key=lambda x: x['vues'])
                actrice = top_actrice_data['actrice']

                # Construire l'URL portrait correctement (même logique que actrice_du_jour)
                portrait_url = "/static/img/default_actress_mini.jpg"
                if actrice.photo:
                    try:
                        # Extraire le nom de fichier du chemin complet
                        filename = os.path.basename(actrice.photo)
                        encoded_name = quote(actrice.nom, safe='')
                        portrait_url = f"/images/{encoded_name}/{quote(filename, safe='')}"
                    except Exception as e:
                        print(f"Erreur construction URL portrait: {e}")

                top_actrice = {
                    "nom": actrice.nom,
                    "portrait": portrait_url,
                    "nb_vues": top_actrice_data['vues']
                }

        if not top_actrice:
            top_actrice = {
                "nom": "En cours...",
                "portrait": "/static/img/default_actress_mini.jpg",
                "nb_vues": 0
            }

        # Autres stats
        nb_favoris = Favorite.query.count()
        une_semaine = datetime.now() - timedelta(days=7)
        nouvelles_scenes = Scene.query.filter(Scene.date_ajout >= une_semaine.date()).count() if Scene.query.filter(
            Scene.date_ajout.isnot(None)).first() else 0

        # Nombre de vidéos uniques regardées (dans l'historique)
        videos_regardees = History.query.with_entities(History.scene_id).distinct().count()

        return jsonify({
            "total_videos": total_scenes,
            "heures_visionnage": heures_visionnage,
            "top_actrice": top_actrice,
            "nb_favoris": nb_favoris,
            "nouvelles_scenes": nouvelles_scenes,
            "total_actrices": Actrice.query.count(),
            "videos_regardees": videos_regardees
        })

    except Exception as e:
        print(f"Erreur stats: {e}")
        return jsonify({
            "total_videos": 150,
            "heures_visionnage": 42.5,
            "top_actrice": {
                "nom": "Sarah Connor",
                "portrait": "/static/img/top_actress.jpg",
                "nb_vues": 15
            },
            "nb_favoris": 23,
            "nouvelles_scenes": 5,
            "total_actrices": 45,
            "videos_regardees": 67
        })


@app.route('/api/suggestions')
def get_suggestions():
    """
    Retourne des suggestions personnalisées basées sur l'historique
    """
    try:
        suggestions = []

        # Basé sur l'historique récent
        recent_histories = History.query.order_by(History.date_vue.desc()).limit(5).all()
        actrice_ids_vues = set()

        for history in recent_histories:
            if history.scene:
                for actrice in history.scene.actrices:
                    actrice_ids_vues.add(actrice.id)

        # Suggérer des scènes d'actrices similaires
        if actrice_ids_vues:
            scenes_similaires = Scene.query.join(Scene.actrices).filter(
                Actrice.id.in_(actrice_ids_vues)
            ).filter(
                ~Scene.id.in_([h.scene_id for h in recent_histories if h.scene_id])
            ).limit(4).all()

            for scene in scenes_similaires:
                suggestions.append({
                    "id": scene.id,
                    "titre": scene.titre,
                    "miniature": construct_miniature_url(scene),
                    "duree": scene.duree or 30,
                    "note": 4.4,
                    "raison": "Basé sur vos goûts récents",
                    "type": "similar_actress"
                })

        # Fallback
        if not suggestions:
            suggestions = [
                {
                    "id": 1,
                    "titre": "Suggestion Premium",
                    "miniature": "/static/img/suggestions/default.jpg",
                    "duree": 30,
                    "note": 4.5,
                    "raison": "Recommandé pour vous",
                    "type": "featured"
                }
            ]

        return jsonify(suggestions[:4])

    except Exception as e:
        print(f"Erreur suggestions: {e}")
        return jsonify([
            {
                "id": 1,
                "titre": "Suggestion Premium",
                "miniature": "/static/img/suggestions/default.jpg",
                "duree": 30,
                "note": 4.5,
                "raison": "Recommandé pour vous",
                "type": "featured"
            }
        ])


@app.route('/api/surprends_moi', methods=['POST'])
def surprends_moi():
    """
    Retourne une scène aléatoire mais filtrée selon les préférences
    """
    try:
        # Récupérer les préférences depuis l'historique
        recent_histories = History.query.order_by(History.date_vue.desc()).limit(10).all()

        # Exclure les scènes récemment vues
        scenes_recentes_ids = [h.scene_id for h in recent_histories if h.scene_id]

        # Récupérer les scènes candidates
        if scenes_recentes_ids:
            scenes_candidates = Scene.query.filter(~Scene.id.in_(scenes_recentes_ids)).all()
        else:
            scenes_candidates = Scene.query.all()

        if scenes_candidates:
            scene = random.choice(scenes_candidates)

            # Construire les URLs des actrices
            actrices_data = []
            for actrice in scene.actrices[:2]:
                photo_url = "/static/img/default_actress.jpg"
                if actrice.photo:
                    try:
                        filename = os.path.basename(actrice.photo)
                        encoded_name = quote(actrice.nom, safe='')
                        photo_url = f"/images/{encoded_name}/{quote(filename, safe='')}"
                    except:
                        print(f"Erreur construction URL photo actrice: {e}")

                actrices_data.append({
                    "nom": actrice.nom,
                    "photo": photo_url
                })

            return jsonify({
                "id": scene.id,
                "titre": scene.titre,
                "image": construct_miniature_url(scene),
                "duree": scene.duree or 30,
                "note": 4.5,
                "synopsis": scene.synopsis or f"Découvrez {scene.titre}, une scène qui pourrait vous surprendre !",
                "qualite": scene.qualite or "HD",
                "studio": scene.studio,
                "site": scene.site,
                "actrices": [actrice.nom for actrice in scene.actrices[:2]],
                "actrices_data": actrices_data,
                "tags": [tag.nom for tag in scene.tags],
                "message": "Voici votre surprise ! 🎲"
            })

        # Fallback ultime
        return jsonify({
            "id": 1,
            "titre": "Surprise Premium",
            "image": "/static/img/surprise/default.jpg",
            "duree": 32,
            "note": 4.7,
            "synopsis": "Une scène premium sélectionnée spécialement pour vous !",
            "qualite": "HD",
            "actrices": ["Actrice Mystère"],
            "message": "Voici votre surprise ! 🎲"
        })

    except Exception as e:
        print(f"Erreur surprends_moi: {e}")
        return jsonify({
            "id": 1,
            "titre": "Surprise Premium",
            "image": "/static/img/surprise/default.jpg",
            "duree": 30,
            "note": 4.5,
            "synopsis": "Une scène premium pour vous !",
            "qualite": "HD",
            "actrices": ["Actrice Mystère"],
            "message": "Voici votre surprise ! 🎲"
        })


def update_actrice_note_moyenne(actrice_id):
    """Met à jour la note moyenne d'une actrice basée sur ses scènes"""
    try:
        actrice = db.session.get(Actrice, actrice_id)
        if not actrice:
            print(f"❌ Actrice {actrice_id} non trouvée")
            return

        print(f"🔍 Calcul note moyenne pour {actrice.nom} (ID: {actrice_id})")
        print(f"📊 Nombre de scènes: {len(actrice.scenes)}")

        # Récupérer toutes les notes des scènes de cette actrice
        notes = []
        for i, scene in enumerate(actrice.scenes):
            print(f"  📝 Scène {i + 1}: '{scene.titre}'")
            print(f"      note_perso: '{scene.note_perso}' (type: {type(scene.note_perso)})")

            if scene.note_perso:
                try:
                    note_value = None

                    if isinstance(scene.note_perso, str):
                        note_str = scene.note_perso.strip()

                        # 1. Compter les étoiles ⭐️ ou ⭐
                        star_count = note_str.count('⭐️') + note_str.count('⭐')
                        if star_count > 0:
                            note_value = float(star_count)
                            print(f"      ⭐ {star_count} étoiles trouvées → note: {note_value}")

                        # 2. Chercher un nombre explicite (ex: "4.5", "8/10")
                        elif '/' in note_str:
                            # Format "8/10" ou "4/5"
                            match = re.search(r'(\d+(?:\.\d+)?)/(\d+(?:\.\d+)?)', note_str)
                            if match:
                                numerator = float(match.group(1))
                                denominator = float(match.group(2))
                                note_value = (numerator / denominator) * 5  # Normaliser sur 5
                                print(f"      🔢 Fraction {numerator}/{denominator} → note: {note_value}")

                        else:
                            # Chercher un nombre simple
                            match = re.search(r'(\d+(?:\.\d+)?)', note_str)
                            if match:
                                note_value = float(match.group(1))
                                print(f"      🔢 Nombre trouvé: {note_value}")

                        # Si aucun pattern reconnu, essayer d'assigner une note basée sur des mots-clés
                        if note_value is None:
                            note_str_lower = note_str.lower()
                            if any(word in note_str_lower for word in ['excellent', 'parfait', 'incroyable', 'ouf']):
                                note_value = 5.0
                                print(f"      💯 Mot-clé 'excellent' → note: {note_value}")
                            elif any(word in note_str_lower for word in ['très bon', 'super', 'top', 'génial']):
                                note_value = 4.5
                                print(f"      👍 Mot-clé 'très bon' → note: {note_value}")
                            elif any(word in note_str_lower for word in ['bon', 'bien', 'cool', 'sympa']):
                                note_value = 4.0
                                print(f"      👌 Mot-clé 'bon' → note: {note_value}")
                            elif any(word in note_str_lower for word in ['moyen', 'correct', 'ok']):
                                note_value = 3.0
                                print(f"      😐 Mot-clé 'moyen' → note: {note_value}")
                            else:
                                print(f"      ❓ Aucun pattern reconnu dans '{note_str}'")

                    elif isinstance(scene.note_perso, (int, float)):
                        note_value = float(scene.note_perso)
                        print(f"      ✅ Note numérique: {note_value}")

                    # Ajouter la note si trouvée
                    if note_value is not None:
                        # Normaliser si note > 5
                        if note_value > 5:
                            note_value = note_value * 5 / 10
                            print(f"      📐 Note normalisée: {note_value}")
                        notes.append(note_value)

                except Exception as e:
                    print(f"      ❌ Erreur parsing note: {e}")
                    continue
            else:
                print(f"      ⚪ Pas de note")

        print(f"📋 Notes collectées: {notes}")

        # Calculer la moyenne
        if notes:
            moyenne = sum(notes) / len(notes)
            actrice.note_moyenne = round(moyenne, 1)
            print(f"✅ Note moyenne calculée: {actrice.note_moyenne}")
        else:
            actrice.note_moyenne = None
            print(f"⚪ Aucune note trouvée, note_moyenne = None")

        # Mettre à jour la dernière vue
        actrice.derniere_vue = datetime.now().date()

        db.session.commit()
        print(f"💾 Sauvegarde terminée pour {actrice.nom}")

    except Exception as e:
        print(f"❌ Erreur update_actrice_note_moyenne: {e}")
        db.session.rollback()


def update_actrice_tags_typiques(actrice_id, min_occurrences=2):
    """
    Met à jour les tags typiques d'une actrice basés sur ses scènes
    min_occurrences: nombre minimum d'apparitions d'un tag pour qu'il soit considéré comme "typique"
    """
    try:
        actrice = db.session.get(Actrice, actrice_id)
        if not actrice:
            print(f"❌ Actrice {actrice_id} non trouvée")
            return

        print(f"🏷️ Calcul tags typiques pour {actrice.nom} (ID: {actrice_id})")
        print(f"📊 Nombre de scènes: {len(actrice.scenes)}")

        # Compter les occurrences de chaque tag
        tag_counts = {}
        for i, scene in enumerate(actrice.scenes):
            print(f"  📝 Scène {i + 1}: '{scene.titre}' avec {len(scene.tags)} tags")
            for tag in scene.tags:
                tag_name = tag.nom.lower().strip()
                tag_counts[tag_name] = tag_counts.get(tag_name, 0) + 1
                print(f"      🏷️ Tag '{tag_name}' (count: {tag_counts[tag_name]})")

        print(f"📋 Comptage des tags: {tag_counts}")

        # Garder seulement les tags qui apparaissent assez souvent
        frequent_tags = {
            tag for tag, count in tag_counts.items()
            if count >= min_occurrences
        }

        # Exclure les tags trop génériques
        tags_to_exclude = {'hd', '4k', 'new', 'recent', 'premium', 'video', 'hot', 'sexy'}
        useful_tags = frequent_tags - tags_to_exclude

        # Limiter à 8 tags max et trier alphabétiquement
        final_tags = sorted(useful_tags)[:8]

        # Mettre à jour les tags typiques
        if final_tags:
            actrice.tags_typiques = ','.join(final_tags)
            print(f"✅ Tags typiques mis à jour: {actrice.tags_typiques}")
        else:
            actrice.tags_typiques = None
            print(f"⚪ Aucun tag typique trouvé")

        db.session.commit()
        print(f"💾 Sauvegarde terminée pour {actrice.nom}")

    except Exception as e:
        print(f"❌ Erreur update_actrice_tags_typiques: {e}")
        db.session.rollback()

# ==================== ROUTES CRUD POUR SCENES ====================

@app.route('/api/scenes', methods=['POST'])
def create_scene():
    """Créer une nouvelle scène"""
    try:
        data = request.get_json()
        print(f"=== CREATE SCENE DEBUG ===")
        print(f"Données reçues: {data}")

        # ✅ NOUVEAU : Vérification d'unicité par chemin
        chemin_complet = data.get('chemin')
        if not chemin_complet and data.get('chemin_short'):
            chemin_complet = '/Volumes/My Passport for Mac/Privé/M364TR0N/' + data['chemin_short']

        if chemin_complet:
            existing_scene = Scene.query.filter_by(chemin=chemin_complet).first()
            if existing_scene:
                return jsonify({
                    "error": f"Une scène avec ce chemin vidéo existe déjà : '{existing_scene.titre}' (ID: {existing_scene.id})",
                    "existing_scene": {
                        "id": existing_scene.id,
                        "titre": existing_scene.titre,
                        "chemin": existing_scene.chemin
                    }
                }), 409  # 409 = Conflict

        scene = Scene(
            chemin=data['chemin'],
            titre=data.get('titre'),
            synopsis=data.get('synopsis'),
            duree=data.get('duree'),
            qualite=data.get('qualite'),
            site=data.get('site'),
            studio=data.get('studio'),
            date_ajout=datetime.strptime(data['date_ajout'], '%Y-%m-%d').date() if data.get('date_ajout') else datetime.now().date(),
            note_perso=data.get('note_perso'),
            image=data.get('image')
        )

        # Gérer la date_scene si fournie
        if data.get('date_scene'):
            try:
                scene.date_scene = datetime.strptime(data['date_scene'], '%Y-%m-%d').date()
            except:
                pass

        db.session.add(scene)
        db.session.flush()  # ⚠️ IMPORTANT pour avoir l'ID de la scène
        print(f"Scène créée avec ID: {scene.id}")

        # Associer les actrices
        actrice_ids = []
        print(f"actrice_ids dans data: {data.get('actrice_ids')}")

        if 'actrice_ids' in data:
            for actrice_id in data['actrice_ids']:
                print(f"Traitement actrice_id: {actrice_id}")
                actrice = db.session.get(Actrice, actrice_id)
                if actrice:
                    print(f"Actrice trouvée: {actrice.nom}")
                    scene.actrices.append(actrice)
                    actrice_ids.append(actrice_id)
                    print(f"✅ Actrice {actrice.nom} ajoutée à la scène")
                else:
                    print(f"❌ Actrice {actrice_id} non trouvée")

        # Associer les tags
        if 'tags' in data:
            for tag_name in data['tags']:
                if tag_name.strip():
                    tag = Tag.query.filter_by(nom=tag_name.strip()).first()
                    if not tag:
                        tag = Tag(nom=tag_name.strip())
                        db.session.add(tag)
                        db.session.flush()
                    scene.tags.append(tag)

        print(f"Avant commit - Nombre d'actrices liées à la scène: {len(scene.actrices)}")
        db.session.commit()
        print(f"Après commit - Commit réussi")

        # 🔍 VÉRIFICATION POST-COMMIT
        scene_fresh = db.session.get(Scene, scene.id)
        print(f"🔍 Vérification post-commit:")
        print(f"   Scène ID {scene_fresh.id} a {len(scene_fresh.actrices)} actrices liées")
        for actrice in scene_fresh.actrices:
            print(f"   - {actrice.nom} (ID: {actrice.id})")

        # ✨ Mettre à jour les notes moyennes ET les tags des actrices
        print(f"🔄 Début mise à jour notes moyennes et tags pour {len(actrice_ids)} actrices")
        for actrice_id in actrice_ids:
            print(f"🔄 Appel update_actrice_note_moyenne({actrice_id})")

            # 🔍 Double vérification avant calcul
            actrice_check = db.session.get(Actrice, actrice_id)
            print(f"🔍 Avant calcul: {actrice_check.nom} a {len(actrice_check.scenes)} scènes")

            update_actrice_note_moyenne(actrice_id)

            # 🏷️ NOUVEAU : Mettre à jour les tags typiques
            print(f"🏷️ Appel update_actrice_tags_typiques({actrice_id})")
            update_actrice_tags_typiques(actrice_id)

        print(f"=== FIN CREATE SCENE DEBUG ===")
        return jsonify({"message": "Scène créée avec succès", "id": scene.id}), 201

    except Exception as e:
        print(f"❌ Erreur create_scene: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ✅ NOUVELLE ROUTE : Vérifier si un chemin existe déjà
@app.route('/api/scenes/check-path', methods=['POST'])
def check_scene_path():
    """Vérifier si un chemin de scène existe déjà"""
    try:
        data = request.get_json()
        chemin_short = data.get('chemin_short', '').strip()

        if not chemin_short:
            return jsonify({"exists": False}), 200

        # Construire le chemin complet
        chemin_complet = '/Volumes/My Passport for Mac/Privé/M364TR0N/' + chemin_short

        # Vérifier si une scène avec ce chemin existe
        existing_scene = Scene.query.filter_by(chemin=chemin_complet).first()

        if existing_scene:
            return jsonify({
                "exists": True,
                "scene": {
                    "id": existing_scene.id,
                    "titre": existing_scene.titre,
                    "chemin": existing_scene.chemin,
                    "date_ajout": existing_scene.date_ajout.isoformat() if existing_scene.date_ajout else None
                }
            }), 200
        else:
            return jsonify({"exists": False}), 200

    except Exception as e:
        print(f"❌ Erreur check_scene_path: {e}")
        return jsonify({"error": str(e)}), 400


# ✅ NOUVELLE ROUTE : Vérifier si une actrice existe déjà
@app.route('/api/actrices/check-name', methods=['POST'])
def check_actrice_name():
    """Vérifier si une actrice avec ce nom existe déjà"""
    try:
        data = request.get_json()
        nom_actrice = data.get('nom', '').strip()

        if not nom_actrice:
            return jsonify({"exists": False}), 200

        # Vérifier si une actrice avec ce nom existe (insensible à la casse)
        existing_actrice = Actrice.query.filter(
            db.func.lower(Actrice.nom) == nom_actrice.lower()
        ).first()

        if existing_actrice:
            return jsonify({
                "exists": True,
                "actrice": {
                    "id": existing_actrice.id,
                    "nom": existing_actrice.nom,
                    "photo": existing_actrice.photo,
                    "nationalite": existing_actrice.nationalite,
                    "nb_scenes": len(existing_actrice.scenes) if existing_actrice.scenes else 0,
                    "note_moyenne": existing_actrice.note_moyenne
                }
            }), 200
        else:
            return jsonify({"exists": False}), 200

    except Exception as e:
        print(f"❌ Erreur check_actrice_name: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/scenes/<int:scene_id>', methods=['PUT'])
def update_scene(scene_id):
    """Mettre à jour une scène"""
    try:
        scene = db.session.get(Scene, scene_id)
        if not scene:
            return jsonify({"error": "Scène non trouvée"}), 404

        data = request.get_json()
        print(f"=== UPDATE SCENE DEBUG ===")
        print(f"Scène ID: {scene_id}")
        print(f"Données reçues: {data}")

        # Garder les anciennes actrices pour mise à jour
        old_actrice_ids = [a.id for a in scene.actrices]
        print(f"Anciennes actrices: {old_actrice_ids}")

        # Mettre à jour les champs simples
        for field in ['titre', 'synopsis', 'duree', 'qualite', 'site', 'studio', 'note_perso', 'image', 'chemin']:
            if field in data:
                print(f"Mise à jour {field}: {getattr(scene, field)} -> {data[field]}")
                setattr(scene, field, data[field])

        # Mettre à jour les actrices
        new_actrice_ids = []
        print(f"Nouvelles actrice_ids: {data.get('actrice_ids')}")

        if 'actrice_ids' in data:
            scene.actrices.clear()
            print(f"✅ Anciennes actrices supprimées")

            for actrice_id in data['actrice_ids']:
                print(f"Traitement actrice_id: {actrice_id}")
                actrice = db.session.get(Actrice, actrice_id)
                if actrice:
                    scene.actrices.append(actrice)
                    new_actrice_ids.append(actrice_id)
                    print(f"✅ Actrice {actrice.nom} ajoutée")
                else:
                    print(f"❌ Actrice {actrice_id} non trouvée")

        # Mettre à jour les tags
        if 'tags' in data:
            scene.tags.clear()
            print(f"Tags à ajouter: {data['tags']}")
            for tag_name in data['tags']:
                if tag_name.strip():
                    tag = Tag.query.filter_by(nom=tag_name.strip()).first()
                    if not tag:
                        tag = Tag(nom=tag_name.strip())
                        db.session.add(tag)
                        db.session.flush()
                        print(f"✅ Nouveau tag créé: {tag_name}")
                    scene.tags.append(tag)

        if 'date_scene' in data and data['date_scene']:
            try:
                scene.date_scene = datetime.strptime(data['date_scene'], '%Y-%m-%d').date()
            except:
                pass

        # Gérer la date_ajout si fournie
        if 'date_ajout' in data and data['date_ajout']:
            try:
                scene.date_ajout = datetime.strptime(data['date_ajout'], '%Y-%m-%d').date()
            except:
                pass

        print(f"Avant commit - Nombre d'actrices liées: {len(scene.actrices)}")
        db.session.commit()
        print(f"Après commit - Commit réussi")

        # 🔍 VÉRIFICATION POST-COMMIT
        scene_fresh = db.session.get(Scene, scene.id)
        print(f"🔍 Vérification post-commit:")
        print(f"   Scène ID {scene_fresh.id} a {len(scene_fresh.actrices)} actrices liées")

        # ✨ Mettre à jour les notes moyennes ET les tags (anciennes ET nouvelles actrices)
        all_actrice_ids = set(old_actrice_ids + new_actrice_ids)
        print(f"🔄 Actrices à mettre à jour: {all_actrice_ids}")

        for actrice_id in all_actrice_ids:
            print(f"🔄 Appel update_actrice_note_moyenne({actrice_id})")

            # 🔍 Double vérification avant calcul
            actrice_check = db.session.get(Actrice, actrice_id)
            print(f"🔍 Avant calcul: {actrice_check.nom} a {len(actrice_check.scenes)} scènes")

            update_actrice_note_moyenne(actrice_id)

            # 🏷️ NOUVEAU : Mettre à jour les tags typiques
            print(f"🏷️ Appel update_actrice_tags_typiques({actrice_id})")
            update_actrice_tags_typiques(actrice_id)

        print(f"=== FIN UPDATE SCENE DEBUG ===")
        return jsonify({"message": "Scène mise à jour avec succès"})

    except Exception as e:
        print(f"❌ Erreur update_scene: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/scenes/<int:scene_id>', methods=['DELETE'])
def delete_scene(scene_id):
    """Supprimer une scène"""
    try:
        scene = db.session.get(Scene, scene_id)
        if not scene:
            return jsonify({"error": "Scène non trouvée"}), 404

        # Supprimer d'abord les favoris liés à cette scène
        Favorite.query.filter_by(scene_id=scene_id).delete()

        # Supprimer l'historique lié à cette scène
        History.query.filter_by(scene_id=scene_id).delete()

        # Maintenant supprimer la scène
        db.session.delete(scene)
        db.session.commit()

        return jsonify({"message": "Scène supprimée avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ==================== ROUTES CRUD POUR ACTRICES ====================

@app.route('/api/actrices', methods=['POST'])
def create_actrice():
    """Créer une nouvelle actrice avec vérification d'unicité"""
    try:
        data = request.get_json()
        print(f"=== CREATE ACTRICE DEBUG ===")
        print(f"Données reçues: {data}")

        # ✅ NOUVEAU : Vérification d'unicité par nom
        nom_actrice = data.get('nom', '').strip()
        if nom_actrice:
            existing_actrice = Actrice.query.filter_by(nom=nom_actrice).first()
            if existing_actrice:
                return jsonify({
                    "error": f"Une actrice avec ce nom existe déjà : '{existing_actrice.nom}' (ID: {existing_actrice.id})",
                    "existing_actrice": {
                        "id": existing_actrice.id,
                        "nom": existing_actrice.nom,
                        "photo": existing_actrice.photo,
                        "nationalite": existing_actrice.nationalite
                    }
                }), 409  # 409 = Conflict

        actrice = Actrice(
            nom=data['nom'],
            biographie=data.get('biographie'),
            photo=data.get('photo'),
            tags_typiques=data.get('tags_typiques'),
            note_moyenne=data.get('note_moyenne'),
            commentaire=data.get('commentaire'),
            nationalite=data.get('nationalite')
        )

        # Gérer la date de naissance si fournie
        if data.get('date_naissance'):
            try:
                actrice.date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
            except:
                pass  # Ignorer si format incorrect

        db.session.add(actrice)
        db.session.commit()

        print(f"✅ Actrice créée avec succès: {actrice.nom} (ID: {actrice.id})")
        return jsonify({"message": "Actrice créée avec succès", "id": actrice.id}), 201

    except Exception as e:
        print(f"❌ Erreur create_actrice: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/actrices/<int:actrice_id>', methods=['PUT'])
def update_actrice(actrice_id):
    """Mettre à jour une actrice"""
    try:
        actrice = db.session.get(Actrice, actrice_id)
        if not actrice:
            return jsonify({"error": "Actrice non trouvée"}), 404

        data = request.get_json()

        # Mettre à jour les champs simples
        for field in ['nom', 'biographie', 'photo', 'tags_typiques', 'note_moyenne', 'commentaire', 'nationalite']:
            if field in data:
                setattr(actrice, field, data[field])

        # Gérer la date de naissance
        if 'date_naissance' in data and data['date_naissance']:
            try:
                actrice.date_naissance = datetime.strptime(data['date_naissance'], '%Y-%m-%d').date()
            except:
                pass  # Ignorer si format incorrect

        db.session.commit()
        return jsonify({"message": "Actrice mise à jour avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/actrices/<int:actrice_id>', methods=['DELETE'])
def delete_actrice(actrice_id):
    """Supprimer une actrice"""
    try:
        actrice = db.session.get(Actrice, actrice_id)
        if not actrice:
            return jsonify({"error": "Actrice non trouvée"}), 404

        # Dissocier l'actrice de toutes ses scènes (ne pas supprimer les scènes)
        for scene in actrice.scenes:
            scene.actrices.remove(actrice)

        # Maintenant supprimer l'actrice
        db.session.delete(actrice)
        db.session.commit()

        return jsonify({"message": "Actrice supprimée avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ==================== GESTION DES FAVORIS ====================

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    """Ajouter une scène aux favoris"""
    try:
        data = request.get_json()
        scene_id = data['scene_id']

        # Vérifier si la scène existe
        scene = db.session.get(Scene, scene_id)
        if not scene:
            return jsonify({"error": "Scène non trouvée"}), 404

        # Vérifier si déjà en favoris
        existing = Favorite.query.filter_by(scene_id=scene_id).first()
        if existing:
            return jsonify({"error": "Déjà en favoris"}), 400

        favorite = Favorite(
            scene_id=scene_id,
            date_ajout=datetime.now().date()
        )

        db.session.add(favorite)
        db.session.commit()

        return jsonify({"message": "Ajouté aux favoris"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/favorites/<int:scene_id>', methods=['DELETE'])
def remove_favorite(scene_id):
    """Retirer une scène des favoris"""
    try:
        favorite = Favorite.query.filter_by(scene_id=scene_id).first()
        if not favorite:
            return jsonify({"error": "Pas en favoris"}), 404

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "Retiré des favoris"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ==================== GESTION DE L'HISTORIQUE ====================

@app.route('/api/history', methods=['POST'])
def add_to_history():
    """Ajouter une vue à l'historique avec gestion des vues multiples"""
    try:
        data = request.get_json()
        scene_id = data['scene_id']

        # Vérifier si la scène existe
        scene = db.session.get(Scene, scene_id)
        if not scene:
            return jsonify({"error": "Scène non trouvée"}), 404

        # Vérifier si déjà dans l'historique
        existing_history = History.query.filter_by(scene_id=scene_id).first()
        today = datetime.now().date()

        if existing_history:
            # ✅ NOUVEAU : Incrémenter le compteur
            existing_history.nb_vues += 1
            existing_history.derniere_vue = today
            existing_history.date_vue = today  # Garder pour compatibilité

            if 'note_session' in data:
                existing_history.note_session = data['note_session']
            if 'commentaire_session' in data:
                existing_history.commentaire_session = data['commentaire_session']

            db.session.commit()

            print(f"🎬 Scène '{scene.titre}' vue #{existing_history.nb_vues}")

            return jsonify({
                "message": f"Vue #{existing_history.nb_vues} enregistrée",
                "nb_vues": existing_history.nb_vues,
                "is_new": False
            }), 200

        # Créer nouvelle entrée (première vue)
        history = History(
            scene_id=scene_id,
            date_vue=today,
            date_premiere_vue=today,
            derniere_vue=today,
            nb_vues=1,
            note_session=data.get('note_session'),
            commentaire_session=data.get('commentaire_session')
        )

        db.session.add(history)
        db.session.commit()

        print(f"🆕 Première vue de la scène '{scene.titre}'")

        return jsonify({
            "message": "Première vue enregistrée",
            "nb_vues": 1,
            "is_new": True
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Route pour supprimer des favoris par scene_id
@app.route('/api/favorites/scene/<int:scene_id>', methods=['DELETE'])
def remove_favorite_by_scene(scene_id):
    """Retirer une scène des favoris en utilisant scene_id"""
    try:
        favorite = Favorite.query.filter_by(scene_id=scene_id).first()
        if not favorite:
            return jsonify({"error": "Cette scène n'est pas en favoris"}), 404

        db.session.delete(favorite)
        db.session.commit()

        return jsonify({"message": "Scène retirée des favoris avec succès"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Route pour vérifier si une scène est dans l'historique
@app.route('/api/history/<int:scene_id>', methods=['GET'])
def check_history(scene_id):
    """Vérifier si une scène est dans l'historique"""
    try:
        history_entry = History.query.filter_by(scene_id=scene_id).first()
        if history_entry:
            return jsonify({
                "exists": True,
                "id": history_entry.id,
                "date_vue": history_entry.date_vue.isoformat() if history_entry.date_vue else None,
                "note_session": history_entry.note_session,
                "commentaire_session": history_entry.commentaire_session
            })
        else:
            return jsonify({"exists": False}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Route pour supprimer de l'historique par scene_id
@app.route('/api/history/scene/<int:scene_id>', methods=['DELETE'])
def remove_from_history_by_scene(scene_id):
    """Supprimer toutes les entrées d'historique pour une scène"""
    try:
        deleted_count = History.query.filter_by(scene_id=scene_id).delete()

        if deleted_count == 0:
            return jsonify({"error": "Cette scène n'est pas dans l'historique"}), 404

        db.session.commit()
        return jsonify({"message": f"Scène supprimée de l'historique ({deleted_count} entrée(s) supprimée(s))"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/history/<int:history_id>', methods=['DELETE'])
def remove_from_history(history_id):
    """Supprimer un élément de l'historique"""
    try:
        history = db.session.get(History, history_id)
        if not history:
            return jsonify({"error": "Élément d'historique non trouvé"}), 404

        db.session.delete(history)
        db.session.commit()

        return jsonify({"message": "Retiré de l'historique"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ==================== ROUTE POUR RÉCUPÉRER UNE SCÈNE DÉTAILLÉE ====================

@app.route('/api/scenes/<int:scene_id>')
def get_scene_detail(scene_id):
    """Récupérer les détails d'une scène"""
    try:
        scene = db.session.get(Scene, scene_id)
        if not scene:
            return jsonify({"error": "Scène non trouvée"}), 404

        return jsonify({
            "id": scene.id,
            "titre": scene.titre,
            "chemin": scene.chemin,
            "synopsis": scene.synopsis,
            "duree": scene.duree,
            "qualite": scene.qualite,
            "site": scene.site,
            "studio": scene.studio,
            "date_ajout": scene.date_ajout.isoformat() if scene.date_ajout else None,
            "date_scene": scene.date_scene.isoformat() if scene.date_scene else None,
            "note_perso": scene.note_perso,
            "image": scene.image,
            "niveau_plaisir": scene.niveau_plaisir,
            "statut": scene.statut,
            "actrices": [{"id": a.id, "nom": a.nom} for a in scene.actrices],
            "tags": [{"id": t.id, "nom": t.nom} for t in scene.tags],
            "is_favorite": bool(Favorite.query.filter_by(scene_id=scene.id).first()),
            "view_count": History.query.filter_by(scene_id=scene.id).count()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ==================== ROUTE POUR RÉCUPÉRER UNE ACTRICE DÉTAILLÉE ====================

@app.route('/api/actrices/<int:actrice_id>')
def get_actrice_detail(actrice_id):
    """Récupérer les détails d'une actrice"""
    try:
        actrice = db.session.get(Actrice, actrice_id)
        if not actrice:
            return jsonify({"error": "Actrice non trouvée"}), 404

        return jsonify({
            "id": actrice.id,
            "nom": actrice.nom,
            "biographie": actrice.biographie,
            "photo": actrice.photo,
            "tags_typiques": actrice.tags_typiques,
            "note_moyenne": actrice.note_moyenne,
            "derniere_vue": actrice.derniere_vue.isoformat() if actrice.derniere_vue else None,
            "commentaire": actrice.commentaire,
            "date_naissance": actrice.date_naissance.isoformat() if actrice.date_naissance else None,
            "nationalite": actrice.nationalite,
            "nb_scenes": len(actrice.scenes),
            "scenes": [{"id": s.id, "titre": s.titre} for s in actrice.scenes]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/admin/update_all_tags', methods=['POST'])
def update_all_actress_tags():
    """Endpoint pour mettre à jour tous les tags d'actrices (à usage admin)"""
    try:
        actrices = Actrice.query.all()
        updated_count = 0

        print(f"🔄 Début mise à jour des tags pour {len(actrices)} actrices")

        for actrice in actrices:
            if actrice.scenes:  # Seulement si elle a des scènes
                print(f"🏷️ Mise à jour tags pour {actrice.nom} ({len(actrice.scenes)} scènes)")
                update_actrice_tags_typiques(actrice.id)
                updated_count += 1
            else:
                print(f"⚪ {actrice.nom} n'a pas de scènes, ignorée")

        print(f"✅ Mise à jour terminée pour {updated_count} actrices")

        return jsonify({
            "message": f"Tags mis à jour pour {updated_count} actrices sur {len(actrices)}",
            "success": True,
            "updated_count": updated_count,
            "total_count": len(actrices)
        })

    except Exception as e:
        print(f"❌ Erreur update_all_actress_tags: {e}")
        return jsonify({"error": str(e), "success": False}), 400


import subprocess
import platform


@app.route('/api/scenes/open-video', methods=['POST'])
def open_video():
    """Ouvrir une vidéo avec l'application par défaut du système"""
    try:
        data = request.get_json()
        chemin = data.get('chemin')
        scene_id = data.get('scene_id')
        player_bundle = data.get('player_bundle')

        if not chemin:
            return jsonify({"error": "Chemin vidéo manquant", "success": False}), 400

        # Vérifier que le fichier existe
        if not os.path.exists(chemin):
            return jsonify({
                "error": f"Fichier non trouvé: {chemin}",
                "success": False
            }), 404

        # Détecter l'OS et utiliser la commande appropriée
        system = platform.system()

        try:
            if system == "Darwin":  # macOS
                if player_bundle:
                    # Ouvrir avec une app spécifique
                    subprocess.run(["open", "-b", player_bundle, chemin], check=True)
                else:
                    # Ouvrir avec l'app par défaut
                    subprocess.run(["open", chemin], check=True)

            elif system == "Windows":
                os.startfile(chemin)

            elif system == "Linux":
                subprocess.run(["xdg-open", chemin], check=True)

            else:
                return jsonify({
                    "error": f"Système non supporté: {system}",
                    "success": False
                }), 400

            print(f"✅ Vidéo ouverte avec succès: {chemin}")

            return jsonify({
                "success": True,
                "message": f"Vidéo ouverte avec succès",
                "system": system
            })

        except subprocess.CalledProcessError as e:
            return jsonify({
                "error": f"Erreur lors de l'ouverture: {str(e)}",
                "success": False
            }), 500

    except Exception as e:
        print(f"❌ Erreur open_video: {e}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 400

@app.route('/api/admin/scan-disk', methods=['POST'])
def scan_disk():
    """Scanner le disque dur et comparer avec la BDD"""
    try:
        base_path = '/Volumes/My Passport for Mac/Privé/M364TR0N/'

        if not os.path.exists(base_path):
            return jsonify({"error": "Disque dur non trouvé"}), 404

        print(f"🔍 Scan du disque: {base_path}")

        # Scanner les dossiers (actrices)
        disk_actresses = []
        disk_videos = []

        for actress_folder in os.listdir(base_path):
            actress_path = os.path.join(base_path, actress_folder)
            if os.path.isdir(actress_path) and not actress_folder.startswith('.'):
                try:
                    # Lister les vidéos de cette actrice
                    videos = []
                    for file in os.listdir(actress_path):
                        if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                            videos.append(file)

                    if videos:  # Seulement si elle a des vidéos
                        disk_actresses.append({
                            'name': actress_folder,
                            'video_count': len(videos),
                            'videos': videos
                        })

                        for video in videos:
                            full_path = os.path.join(actress_path, video)
                            relative_path = f"{actress_folder}/{video}"

                            disk_videos.append({
                                'actress': actress_folder,
                                'filename': video,
                                'relative_path': relative_path,
                                'full_path': full_path,
                                'size_mb': round(os.path.getsize(full_path) / (1024 * 1024), 1) if os.path.exists(
                                    full_path) else 0
                            })

                except Exception as e:
                    print(f"❌ Erreur lecture dossier {actress_folder}: {e}")
                    continue

        # Récupérer les données de la BDD
        db_scenes = Scene.query.all()
        db_actresses = Actrice.query.all()

        # Créer des sets pour comparaison rapide
        db_scene_paths = set()
        for scene in db_scenes:
            if scene.chemin:
                # Extraire le chemin relatif depuis le chemin complet
                if scene.chemin.startswith('/Volumes/My Passport for Mac/Privé/M364TR0N/'):
                    relative = scene.chemin.replace('/Volumes/My Passport for Mac/Privé/M364TR0N/', '')
                    db_scene_paths.add(relative)

        db_actress_names = {actress.nom.lower() for actress in db_actresses}

        # Identifier les éléments manquants
        missing_videos = []
        missing_actresses = []
        orphan_scenes = []

        # Vidéos manquantes (sur disque mais pas en BDD)
        for video in disk_videos:
            if video['relative_path'] not in db_scene_paths:
                missing_videos.append(video)

        # Actrices manquantes (sur disque mais pas en BDD)
        for actress in disk_actresses:
            if actress['name'].lower() not in db_actress_names:
                missing_actresses.append(actress)

        # Scènes orphelines (en BDD mais plus sur disque)
        for scene in db_scenes:
            if scene.chemin and not os.path.exists(scene.chemin):
                orphan_scenes.append({
                    'id': scene.id,
                    'titre': scene.titre,
                    'chemin': scene.chemin
                })

        print(f"✅ Scan terminé: {len(disk_videos)} vidéos trouvées, {len(missing_videos)} manquantes")

        return jsonify({
            'disk_stats': {
                'total_actresses': len(disk_actresses),
                'total_videos': len(disk_videos)
            },
            'db_stats': {
                'imported_actresses': len(db_actresses),
                'imported_scenes': len(db_scenes)
            },
            'comparison': {
                'missing_actresses': missing_actresses,
                'missing_videos': missing_videos[:100],  # Limiter pour l'affichage
                'orphan_scenes': orphan_scenes
            },
            'progress': {
                'actresses_percent': round((len(db_actresses) / max(len(disk_actresses), 1)) * 100, 1),
                'videos_percent': round((len(db_scenes) / max(len(disk_videos), 1)) * 100, 1)
            }
        })

    except Exception as e:
        print(f"❌ Erreur scan disque: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/random-video', methods=['POST'])
def get_random_unimported_video():
    """Récupérer une vidéo aléatoire non importée et l'ouvrir"""
    try:
        base_path = '/Volumes/My Passport for Mac/Privé/M364TR0N/'

        # Scanner toutes les vidéos
        all_videos = []
        for actress_folder in os.listdir(base_path):
            actress_path = os.path.join(base_path, actress_folder)
            if os.path.isdir(actress_path) and not actress_folder.startswith('.'):
                try:
                    for file in os.listdir(actress_path):
                        if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                            full_path = os.path.join(actress_path, file)
                            relative_path = f"{actress_folder}/{file}"
                            all_videos.append({
                                'actress': actress_folder,
                                'filename': file,
                                'relative_path': relative_path,
                                'full_path': full_path
                            })
                except:
                    continue

        if not all_videos:
            return jsonify({"error": "Aucune vidéo trouvée sur le disque"}), 404

        # Filtrer les vidéos déjà importées
        db_scene_paths = set()
        db_scenes = Scene.query.all()
        for scene in db_scenes:
            if scene.chemin:
                if scene.chemin.startswith('/Volumes/My Passport for Mac/Privé/M364TR0N/'):
                    relative = scene.chemin.replace('/Volumes/My Passport for Mac/Privé/M364TR0N/', '')
                    db_scene_paths.add(relative)

        # Vidéos non importées
        unimported_videos = [v for v in all_videos if v['relative_path'] not in db_scene_paths]

        if not unimported_videos:
            return jsonify({"error": "Toutes les vidéos sont déjà importées ! 🎉"}), 404

        # Choisir une vidéo aléatoire
        random_video = random.choice(unimported_videos)

        # Vérifier si l'actrice existe en BDD
        actrice_existante = Actrice.query.filter_by(nom=random_video['actress']).first()

        # Générer un titre propre depuis le nom de fichier
        clean_title = random_video['filename']
        # Supprimer l'extension
        clean_title = os.path.splitext(clean_title)[0]
        # Remplacer les underscores/tirets par des espaces
        clean_title = clean_title.replace('_', ' ').replace('-', ' ')
        # Nettoyer les espaces multiples
        clean_title = ' '.join(clean_title.split())

        # Essayer d'ouvrir la vidéo
        try:
            subprocess.run(["open", random_video['full_path']], check=True)
            video_opened = True
            open_message = f"✅ Vidéo ouverte: {random_video['filename']}"
        except subprocess.CalledProcessError as e:
            video_opened = False
            open_message = f"❌ Erreur ouverture: {str(e)}"
        except Exception as e:
            video_opened = False
            open_message = f"❌ Erreur: {str(e)}"

        print(f"🎲 Vidéo surprise: {random_video['actress']}/{random_video['filename']}")

        return jsonify({
            "success": True,
            "video": {
                "actress": random_video['actress'],
                "filename": random_video['filename'],
                "full_path": random_video['full_path'],
                "relative_path": random_video['relative_path'],
                "suggested_title": clean_title,
                "size_mb": round(os.path.getsize(random_video['full_path']) / (1024 * 1024), 1) if os.path.exists(
                    random_video['full_path']) else 0
            },
            "actress_info": {
                "exists_in_db": actrice_existante is not None,
                "actress_id": actrice_existante.id if actrice_existante else None,
                "actress_scenes_count": len(actrice_existante.scenes) if actrice_existante else 0
            },
            "stats": {
                "total_unimported": len(unimported_videos),
                "total_videos_on_disk": len(all_videos)
            },
            "open_result": {
                "opened": video_opened,
                "message": open_message
            }
        })

    except Exception as e:
        print(f"❌ Erreur random video: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/quick-add-scene', methods=['POST'])
def quick_add_scene_from_video():
    """Ajouter rapidement une scène depuis les infos d'une vidéo"""
    try:
        data = request.get_json()

        # Construire le chemin complet
        full_path = '/Volumes/My Passport for Mac/Privé/M364TR0N/' + data['relative_path']

        # Vérifier que le fichier existe
        if not os.path.exists(full_path):
            return jsonify({"error": "Fichier vidéo non trouvé"}), 404

        # Vérifier unicité
        existing_scene = Scene.query.filter_by(chemin=full_path).first()
        if existing_scene:
            return jsonify({
                "error": f"Cette vidéo est déjà importée: '{existing_scene.titre}' (ID: {existing_scene.id})"
            }), 409

        # Créer la scène
        scene = Scene(
            chemin=full_path,
            titre=data.get('titre', data['suggested_title']),
            synopsis=data.get('synopsis'),
            duree=data.get('duree'),
            qualite=data.get('qualite', 'HD'),
            site=data.get('site'),
            studio=data.get('studio'),
            date_ajout=datetime.now().date(),
            note_perso=data.get('note_perso'),
            image=data.get('image')
        )

        db.session.add(scene)
        db.session.flush()

        # Associer l'actrice si elle existe
        if data.get('actress_id'):
            actrice = db.session.get(Actrice, data['actress_id'])
            if actrice:
                scene.actrices.append(actrice)

        # Associer les tags
        if data.get('tags'):
            for tag_name in data['tags']:
                if tag_name.strip():
                    tag = Tag.query.filter_by(nom=tag_name.strip()).first()
                    if not tag:
                        tag = Tag(nom=tag_name.strip())
                        db.session.add(tag)
                        db.session.flush()
                    scene.tags.append(tag)

        db.session.commit()

        # Mettre à jour les stats actrice si applicable
        if data.get('actress_id'):
            update_actrice_note_moyenne(data['actress_id'])
            update_actrice_tags_typiques(data['actress_id'])

        print(f"✅ Scène ajoutée rapidement: {scene.titre}")

        return jsonify({
            "success": True,
            "message": "Scène ajoutée avec succès",
            "scene_id": scene.id
        })

    except Exception as e:
        print(f"❌ Erreur quick add: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Ajouter ces endpoints dans app.py pour débugger

@app.route('/api/admin/debug/orphan-scenes', methods=['GET'])
def get_orphan_scenes():
    """Récupérer les détails des scènes orphelines"""
    try:
        orphan_scenes = []
        scenes = Scene.query.all()

        for scene in scenes:
            if scene.chemin and not os.path.exists(scene.chemin):
                orphan_scenes.append({
                    'id': scene.id,
                    'titre': scene.titre,
                    'chemin': scene.chemin,
                    'date_ajout': scene.date_ajout.isoformat() if scene.date_ajout else None,
                    'actrices': [a.nom for a in scene.actrices] if scene.actrices else []
                })

        return jsonify({
            'orphan_scenes': orphan_scenes,
            'count': len(orphan_scenes)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/debug/disk-actresses', methods=['GET'])
def get_disk_actresses():
    """Analyser les dossiers d'actrices sur le disque"""
    try:
        base_path = '/Volumes/My Passport for Mac/Privé/M364TR0N/'

        if not os.path.exists(base_path):
            return jsonify({"error": "Disque dur non trouvé"}), 404

        disk_folders = []
        for item in os.listdir(base_path):
            item_path = os.path.join(base_path, item)
            if os.path.isdir(item_path) and not item.startswith('.'):
                # Compter les fichiers vidéos
                video_files = []
                try:
                    for file in os.listdir(item_path):
                        if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                            video_files.append(file)
                except:
                    video_files = []

                disk_folders.append({
                    'name': item,
                    'video_count': len(video_files),
                    'has_videos': len(video_files) > 0,
                    'sample_videos': video_files[:3] if video_files else []
                })

        # Trier par nombre de vidéos décroissant
        disk_folders.sort(key=lambda x: x['video_count'], reverse=True)

        # Séparer ceux avec et sans vidéos
        with_videos = [f for f in disk_folders if f['has_videos']]
        without_videos = [f for f in disk_folders if not f['has_videos']]

        return jsonify({
            'total_folders': len(disk_folders),
            'folders_with_videos': len(with_videos),
            'folders_without_videos': len(without_videos),
            'top_actresses': with_videos[:10],  # Top 10 avec le plus de vidéos
            'empty_folders': without_videos[:20],  # 20 premiers dossiers vides
            'suspicious_folders': [f for f in disk_folders if len(f['name']) < 3 or f['name'].isdigit()]
            # Dossiers suspects
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/debug/missing-videos', methods=['GET'])
def get_missing_videos_sample():
    """Récupérer un échantillon des vidéos manquantes"""
    try:
        base_path = '/Volumes/My Passport for Mac/Privé/M364TR0N/'

        # Scanner quelques vidéos du disque
        sample_missing = []
        db_scene_paths = set()

        # Récupérer les chemins déjà en BDD
        db_scenes = Scene.query.all()
        for scene in db_scenes:
            if scene.chemin:
                if scene.chemin.startswith('/Volumes/My Passport for Mac/Privé/M364TR0N/'):
                    relative = scene.chemin.replace('/Volumes/My Passport for Mac/Privé/M364TR0N/', '')
                    db_scene_paths.add(relative)

        # Scanner un échantillon du disque
        count = 0
        for actress_folder in os.listdir(base_path):
            if count >= 20:  # Limite pour ne pas surcharger
                break

            actress_path = os.path.join(base_path, actress_folder)
            if os.path.isdir(actress_path) and not actress_folder.startswith('.'):
                try:
                    for file in os.listdir(actress_path):
                        if file.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.wmv')):
                            relative_path = f"{actress_folder}/{file}"

                            if relative_path not in db_scene_paths:
                                sample_missing.append({
                                    'actress': actress_folder,
                                    'filename': file,
                                    'relative_path': relative_path,
                                    'size_mb': round(os.path.getsize(os.path.join(actress_path, file)) / (1024 * 1024),
                                                     1)
                                })
                                count += 1

                                if count >= 20:  # Max 20 exemples
                                    break
                except:
                    continue

        return jsonify({
            'sample_missing_videos': sample_missing,
            'sample_count': len(sample_missing),
            'note': 'Échantillon de 20 vidéos manquantes maximum'
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/debug/db-actresses', methods=['GET'])
def get_db_actresses_analysis():
    """Analyser les actrices en base de données"""
    try:
        actrices = Actrice.query.all()

        # Analyser les actrices
        with_scenes = []
        without_scenes = []
        duplicates = []

        # Détecter les doublons potentiels
        names_seen = {}
        for actrice in actrices:
            name_lower = actrice.nom.lower().strip()
            if name_lower in names_seen:
                duplicates.append({
                    'name': actrice.nom,
                    'id': actrice.id,
                    'duplicate_of': names_seen[name_lower]
                })
            else:
                names_seen[name_lower] = {'id': actrice.id, 'name': actrice.nom}

            # Compter les scènes
            scene_count = len(actrice.scenes) if actrice.scenes else 0
            actrice_data = {
                'id': actrice.id,
                'nom': actrice.nom,
                'scene_count': scene_count,
                'note_moyenne': actrice.note_moyenne,
                'nationalite': actrice.nationalite
            }

            if scene_count > 0:
                with_scenes.append(actrice_data)
            else:
                without_scenes.append(actrice_data)

        # Trier par nombre de scènes
        with_scenes.sort(key=lambda x: x['scene_count'], reverse=True)

        return jsonify({
            'total_actresses': len(actrices),
            'with_scenes': len(with_scenes),
            'without_scenes': len(without_scenes),
            'duplicates_count': len(duplicates),
            'top_actresses': with_scenes[:10],
            'actresses_without_scenes': without_scenes[:20],
            'potential_duplicates': duplicates[:10]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/analyze-actresses', methods=['GET'])
def analyze_actresses():
    """Analyser les statistiques des actrices"""
    try:
        actrices = Actrice.query.all()
        scenes = Scene.query.all()

        print(f"🔍 DEBUG: {len(actrices)} actrices trouvées")
        print(f"🔍 DEBUG: {len(scenes)} scènes trouvées")

        actresses_with_scenes = 0
        actresses_without_scenes = 0
        top_actresses = []

        for actrice in actrices:
            scene_count = len([s for s in scenes if s.actrices and any(a.id == actrice.id for a in s.actrices)])
            print(f"🔍 DEBUG: {actrice.nom} = {scene_count} scènes")

            if scene_count > 0:
                actresses_with_scenes += 1
                top_actresses.append({
                    "name": actrice.nom,
                    "scene_count": scene_count,
                    "note_moyenne": actrice.note_moyenne or 0
                })
            else:
                actresses_without_scenes += 1

        # Trier par nombre de scènes
        top_actresses.sort(key=lambda x: x["scene_count"], reverse=True)

        result = {
            "success": True,
            "total_actresses": len(actrices),
            "actresses_with_scenes": actresses_with_scenes,
            "actresses_without_scenes": actresses_without_scenes,
            "top_actresses": top_actresses[:10],
            "recommendations": [
                f"{actresses_without_scenes} actrices sans scènes à nettoyer",
                f"Top actrice: {top_actresses[0]['name'] if top_actresses else 'Aucune'}"
            ]
        }

        print(f"🔍 DEBUG: Résultat final = {result}")
        return jsonify(result)

    except Exception as e:
        print(f"❌ Erreur analyze_actresses: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/admin/delete-video', methods=['POST'])
def delete_video():
    """Supprimer une vidéo du disque dur"""
    try:
        data = request.get_json()
        video_path = data.get('video_path')

        if not video_path or not os.path.exists(video_path):
            return jsonify({"error": "Fichier non trouvé"}), 404

        # Envoyer dans la corbeille au lieu de supprimer définitivement
        if platform.system() == "Darwin":  # macOS
            subprocess.run(["osascript", "-e", f'tell application "Finder" to delete POSIX file "{video_path}"'],
                           check=True)
        elif platform.system() == "Windows":
            import winshell
            winshell.delete_file(video_path)
        elif platform.system() == "Linux":
            subprocess.run(["gio", "trash", video_path], check=True)
        else:
            # Fallback: suppression définitive si OS non supporté
            os.remove(video_path)
        return jsonify({
            "success": True,
            "message": f"Vidéo supprimée: {os.path.basename(video_path)}"
        })

    except Exception as e:
        print(f"❌ Erreur delete_video: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée toutes les tables si elles n'existent pas
    app.run(debug=True)