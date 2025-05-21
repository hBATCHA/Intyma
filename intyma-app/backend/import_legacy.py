import json
from datetime import datetime
from app import app, db
from models import Scene, Actrice, Acteur, Tag, Favorite, History

# --------- OUTIL ---------
def parse_date_safe(val):
    if not val:
        return None
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y"):
        try:
            return datetime.strptime(val, fmt).date()
        except:
            pass
    return None

with app.app_context():
    # ----- Import des actrices -----
    with open('../../legacy/actrices.json', 'r', encoding='utf-8') as f:
        actrices_json = json.load(f)
    actrice_map = {}
    for actrice in actrices_json:
        exist = Actrice.query.filter_by(nom=actrice["nom"]).first()
        if not exist:
            a = Actrice(
                nom=actrice.get("nom"),
                biographie=None,
                photo=actrice.get("photo"),
                tags_typiques=",".join(actrice.get("tags_typiques", [])),
                note_moyenne=actrice.get("note_moyenne"),
                derniere_vue=parse_date_safe(actrice.get("derniere_vue")),
                commentaire=actrice.get("commentaire")
            )
            db.session.add(a)
            db.session.flush()
            actrice_map[a.nom] = a
        else:
            actrice_map[exist.nom] = exist
    db.session.commit()

    # ----- Import des scènes, tags et relations -----
    with open('../../legacy/scenes_metadata.json', 'r', encoding='utf-8') as f:
        scenes_json = json.load(f)
    scene_map = {}
    for scene in scenes_json:
        exist = Scene.query.filter_by(chemin=scene["chemin"]).first()
        if not exist:
            s = Scene(
                chemin=scene.get("chemin"),
                titre=scene.get("titre"),
                synopsis=scene.get("synopsis"),
                duree=scene.get("duree"),
                qualite=scene.get("qualite"),
                site=scene.get("site"),
                studio=scene.get("studio"),
                date_ajout=parse_date_safe(scene.get("date_ajout")),
                date_scene=parse_date_safe(scene.get("date_scene")),
                note_perso=scene.get("note_perso")
            )
            # Actrices (relation many-to-many)
            for nom in scene.get("actrices", []):
                if nom in actrice_map:
                    s.actrices.append(actrice_map[nom])
            # Acteurs (optionnel, même logique)
            # Pour l'instant, non implémenté par défaut, ajoute si tu as la table Acteur remplie

            # Tags
            tag_objs = []
            for tag_name in scene.get("tags", []):
                tag = Tag.query.filter_by(nom=tag_name).first()
                if not tag:
                    tag = Tag(nom=tag_name)
                    db.session.add(tag)
                    db.session.flush()
                tag_objs.append(tag)
            s.tags = tag_objs

            db.session.add(s)
            db.session.flush()
            scene_map[s.chemin] = s
        else:
            scene_map[exist.chemin] = exist
    db.session.commit()

    # ----- Import des favoris -----
    try:
        with open('../../legacy/favorites.json', 'r', encoding='utf-8') as f:
            favorites_json = json.load(f)
        count = 0
        for chemin in favorites_json:
            scene = scene_map.get(chemin)
            if scene and not Favorite.query.filter_by(scene_id=scene.id).first():
                fav = Favorite(scene_id=scene.id, date_ajout=datetime.today().date())
                db.session.add(fav)
                count += 1
        db.session.commit()
        print(f"Importé {count} favoris.")
    except Exception as e:
        print("Erreur import favoris :", e)

    # ----- Import de l'historique -----
    try:
        with open('../../legacy/history.json', 'r', encoding='utf-8') as f:
            history_json = json.load(f)
        count = 0
        for chemin in history_json:
            scene = scene_map.get(chemin)
            if scene and not History.query.filter_by(scene_id=scene.id).first():
                hist = History(scene_id=scene.id, date_vue=datetime.today().date())
                db.session.add(hist)
                count += 1
        db.session.commit()
        print(f"Importé {count} éléments dans l'historique.")
    except Exception as e:
        print("Erreur import historique :", e)

    print("Import complet terminé.")
