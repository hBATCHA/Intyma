from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Table de jointure scène <-> actrice
scene_actrice = db.Table(
    'scene_actrice',
    db.Column('scene_id', db.Integer, db.ForeignKey('scenes.id'), primary_key=True),
    db.Column('actrice_id', db.Integer, db.ForeignKey('actrices.id'), primary_key=True)
)

# Table de jointure scène <-> acteur
scene_acteur = db.Table(
    'scene_acteur',
    db.Column('scene_id', db.Integer, db.ForeignKey('scenes.id'), primary_key=True),
    db.Column('acteur_id', db.Integer, db.ForeignKey('acteurs.id'), primary_key=True)
)

# Table de jointure scène <-> tag
scene_tag = db.Table(
    'scene_tag',
    db.Column('scene_id', db.Integer, db.ForeignKey('scenes.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)


class Scene(db.Model):
    __tablename__ = 'scenes'
    id = db.Column(db.Integer, primary_key=True)
    chemin = db.Column(db.String, unique=True, nullable=False)
    titre = db.Column(db.String)
    synopsis = db.Column(db.Text)
    duree = db.Column(db.Integer)  # en minutes ou secondes selon ton choix
    qualite = db.Column(db.String)
    site = db.Column(db.String)
    studio = db.Column(db.String)
    date_ajout = db.Column(db.Date)
    date_scene = db.Column(db.Date)
    note_perso = db.Column(db.String)
    image = db.Column(db.String)  # chemin miniature/cover
    niveau_plaisir = db.Column(db.Integer)  # Pour de l’IA/reco plus tard
    statut = db.Column(db.String)  # ex : "à trier", "gardé", "supprimé"

    actrices = db.relationship('Actrice', secondary=scene_actrice, backref='scenes')
    acteurs = db.relationship('Acteur', secondary=scene_acteur, backref='scenes')
    tags = db.relationship('Tag', secondary=scene_tag, backref='scenes')
    histories = db.relationship('History', backref='scene', lazy=True)
    favorites = db.relationship('Favorite', backref='scene', lazy=True)


class Actrice(db.Model):
    __tablename__ = 'actrices'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String, unique=True, nullable=False)
    biographie = db.Column(db.Text)
    photo = db.Column(db.String)  # chemin image
    tags_typiques = db.Column(db.String)  # ex : 'milf,big tits,american'
    note_moyenne = db.Column(db.Float)
    derniere_vue = db.Column(db.Date)
    commentaire = db.Column(db.Text)
    date_naissance = db.Column(db.Date)  # optionnel
    nationalite = db.Column(db.String)  # optionnel


class Acteur(db.Model):
    __tablename__ = 'acteurs'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String, unique=True, nullable=False)
    biographie = db.Column(db.Text)
    photo = db.Column(db.String)
    date_naissance = db.Column(db.Date)
    nationalite = db.Column(db.String)


class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String, unique=True, nullable=False)


class Favorite(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    scene_id = db.Column(db.Integer, db.ForeignKey('scenes.id'), nullable=False)
    date_ajout = db.Column(db.Date)


class History(db.Model):
    __tablename__ = 'history'
    id = db.Column(db.Integer, primary_key=True)
    scene_id = db.Column(db.Integer, db.ForeignKey('scenes.id'), nullable=False)
    date_vue = db.Column(db.Date)  # Garder pour compatibilité (= dernière vue)
    date_premiere_vue = db.Column(db.Date)  # ✅ NOUVEAU : Première fois vue
    nb_vues = db.Column(db.Integer, default=1)  # ✅ NOUVEAU : Compteur de vues
    derniere_vue = db.Column(db.Date)  # ✅ NOUVEAU : Dernière fois vue
    note_session = db.Column(db.Float)
    commentaire_session = db.Column(db.Text)


# (Optionnel) Table Users si besoin multi-profils plus tard
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True)
    password_hash = db.Column(db.String)
    # ... profils, préférences, etc.
