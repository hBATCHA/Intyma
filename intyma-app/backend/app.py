from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db, Scene, Actrice, Acteur, Tag, Favorite, History
from datetime import datetime, date, timedelta
import random
import re
import os
from urllib.parse import quote

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


# Exemple : route qui liste toutes les scènes (vide pour l'instant)
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
            "synopsis": s.synopsis,
            "duree": s.duree,
            "qualite": s.qualite,
            "site": s.site,
            "studio": s.studio,
            "date_scene": s.date_scene.isoformat() if s.date_scene else None,
            "image": s.image,
            "niveau_plaisirs": s.niveau_plaisir,
            # Ajoute d'autres champs au besoin
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


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée toutes les tables si elles n'existent pas
    app.run(debug=True)