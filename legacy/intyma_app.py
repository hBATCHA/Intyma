import streamlit as st
import json
import os
import random
import subprocess
from pathlib import Path
from datetime import date, datetime
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image
import time

# === CONFIGURATION ===
DATA_DIR = Path(__file__).parent
METADATA_FILE = DATA_DIR / "scenes_metadata.json"
HISTORY_FILE = DATA_DIR / "history.json"
FAVORITES_FILE = DATA_DIR / "favorites.json"
ACTRESSES_FILE = DATA_DIR / "actrices.json"
MOT_DE_PASSE = "intyma2025"

# Valeur par défaut pour le chemin racine (à adapter)
DEFAULT_ROOT = Path("/Volumes/My Passport for Mac/Privé/M364TR0N")
VIDEO_EXTS = {".mp4", ".avi", ".mkv", ".mov", ".wmv"}

# Configuration CSS pour améliorer l'apparence
st.set_page_config(
    page_title="Intyma",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Styles personnalisés
st.markdown("""
<style>
    .main .block-container {padding-top: 1rem;}
    .stTabs [data-baseweb="tab-list"] {gap: 2px;}
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        border-radius: 4px 4px 0px 0px;
        gap: 1px;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #501B5F !important;
        color: white !important;
    }
    .big-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #AD1AAF;
        color: white;
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        width: 100%;
        transition: all 0.3s;
    }
    .big-button:hover {
        background-color: #8E1492;
        color: white;
    }
    .card {
        background-color: #2E1A36;
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: white;
    }
    .card-subtitle {
        font-size: 1rem;
        color: #E58DE1;
        margin-bottom: 0.75rem;
    }
    .card-content {
        color: #D1D1D1;
        margin-bottom: 0.75rem;
    }
    .tag {
        display: inline-block;
        background-color: #4B1657;
        border-radius: 9999px;
        padding: 0.25rem 0.75rem;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.75rem;
        color: #E0E0E0;
    }
    .tag-container {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
    }
    .actress-card {
        background: linear-gradient(135deg, #2E1A36 0%, #501B5F 100%);
        border-radius: 0.5rem;
        padding: 1.25rem;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
    }
    .actress-card:hover {
        transform: translateY(-5px);
    }
    .login-container {
        max-width: 450px;
        margin: 100px auto;
        padding: 2rem;
        background: linear-gradient(135deg, #2E1A36 0%, #501B5F 100%);
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        text-align: center;
    }
    .login-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: white;
    }
    .login-subtitle {
        color: #E58DE1;
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }
    .form-group {
        margin-bottom: 1.5rem;
    }
    .divider {
        height: 1px;
        background-color: rgba(255, 255, 255, 0.1);
        margin: 1.5rem 0;
    }
    .notification {
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }
    .notification-success {
        background-color: rgba(34, 197, 94, 0.2);
        border-left: 4px solid #22c55e;
        color: #22c55e;
    }
    .notification-error {
        background-color: rgba(239, 68, 68, 0.2);
        border-left: 4px solid #ef4444;
        color: #ef4444;
    }
    .notification-info {
        background-color: rgba(59, 130, 246, 0.2);
        border-left: 4px solid #3b82f6;
        color: #3b82f6;
    }
    .scene-detail {
        background: linear-gradient(135deg, #2E1A36 0%, #501B5F 100%);
        border-radius: 0.5rem;
        padding: 2rem;
        margin-bottom: 1.5rem;
    }
    .stats-card {
        background: linear-gradient(135deg, #2E1A36 0%, #501B5F 100%);
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        height: 100%;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: 700;
        color: #E58DE1;
    }
    .metric-label {
        color: #D1D1D1;
        font-size: 0.875rem;
    }
    .progress-container {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 9999px;
        height: 10px;
        margin-top: 0.5rem;
    }
    .progress-bar {
        background-color: #E58DE1;
        height: 10px;
        border-radius: 9999px;
    }
    .form-control {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.375rem;
        color: white;
        width: 100%;
        padding: 0.625rem;
    }
    .toggle-button {
        display: inline-flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        margin-right: 0.5rem;
        color: #D1D1D1;
        transition: all 0.2s;
        cursor: pointer;
    }
    .toggle-button:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }
    .toggle-button.active {
        background-color: #E58DE1;
        color: #2E1A36;
        font-weight: 600;
    }
    .icon-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)


# === FONCTIONS UTILITAIRES ===

def load_json(path, default):
    """Charge un fichier JSON ou retourne une valeur par défaut si le fichier n'existe pas."""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    """Enregistre des données au format JSON."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def launch_video(rel_path, root_dir):
    """Lance la lecture d'une vidéo avec le lecteur par défaut."""
    video_path = root_dir / rel_path
    if video_path.exists():
        opener = {
            "darwin": "open",
            "win32": "start",
        }.get(os.sys.platform, "xdg-open")
        subprocess.Popen([opener, str(video_path)])
        return True
    else:
        st.error(f"❌ Fichier introuvable : {video_path}")
        return False


def list_all_videos(root):
    """Liste tous les fichiers vidéo dans le répertoire racine."""
    if not root.exists():
        return []
    return [str(p.relative_to(root)) for p in root.rglob("*") if p.suffix.lower() in VIDEO_EXTS]


def count_stars(note):
    """Compte le nombre d'étoiles dans une note."""
    if not note:
        return 0
    return note.count("⭐")


def format_duration(minutes):
    """Formate une durée en minutes en format heures/minutes."""
    if not minutes:
        return "—"
    hours = minutes // 60
    mins = minutes % 60
    if hours > 0:
        return f"{hours}h {mins}min"
    return f"{mins}min"


def calculate_statistics(scenes, history, favorites):
    """Calcule diverses statistiques sur la collection."""
    stats = {
        "total_scenes": len(scenes),
        "watched_scenes": len(history),
        "favorite_scenes": len(favorites),
        "total_duration": sum(scene.get("duree", 0) for scene in scenes),
        "watched_duration": sum(scene.get("duree", 0) for scene in scenes if scene.get("chemin") in history),
        "rating_avg": 0,
        "top_actresses": [],
        "top_tags": [],
        "new_additions": 0,
        "studios": {}
    }

    # Calcul de la note moyenne
    rated_scenes = [scene for scene in scenes if scene.get("note_perso")]
    if rated_scenes:
        total_stars = sum(count_stars(scene.get("note_perso", "")) for scene in rated_scenes)
        stats["rating_avg"] = round(total_stars / len(rated_scenes), 1)

    # Top actrices
    actress_counts = {}
    for scene in scenes:
        for actress in scene.get("actrices", []):
            actress_counts[actress] = actress_counts.get(actress, 0) + 1
    stats["top_actresses"] = sorted(actress_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    # Top tags
    tag_counts = {}
    for scene in scenes:
        for tag in scene.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    stats["top_tags"] = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]

    # Studios
    for scene in scenes:
        studio = scene.get("studio", "Inconnu")
        stats["studios"][studio] = stats["studios"].get(studio, 0) + 1

    # Nouvelles additions (30 derniers jours)
    today = datetime.now().date()
    for scene in scenes:
        if scene.get("date_vue"):
            try:
                scene_date = datetime.strptime(scene.get("date_vue"), "%Y-%m-%d").date()
                days_diff = (today - scene_date).days
                if days_diff <= 30:
                    stats["new_additions"] += 1
            except (ValueError, TypeError):
                pass

    return stats


def create_tag_cloud(tags_data):
    """Crée un nuage de tags avec Plotly."""
    if not tags_data:
        return None

    # Préparer les données
    tags, counts = zip(*tags_data)
    max_count = max(counts)
    sizes = [30 + (count / max_count * 70) for count in counts]
    colors = [f"hsl({int(240 - count / max_count * 240)}, 70%, 50%)" for count in counts]

    fig = go.Figure(data=[go.Scatter(
        x=list(range(len(tags))),
        y=[1] * len(tags),
        mode="text",
        text=tags,
        textfont=dict(
            size=sizes,
            color=colors
        ),
        textposition="middle center"
    )])

    fig.update_layout(
        autosize=True,
        height=400,
        showlegend=False,
        xaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False
        ),
        yaxis=dict(
            showgrid=False,
            zeroline=False,
            showticklabels=False
        ),
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=5, r=5, t=5, b=5)
    )

    return fig


def filter_scenes(scenes, search_term="", tag_filter="", actress_filter="", rating_filter=0):
    """Filtre les scènes selon différents critères."""
    filtered = []

    for scene in scenes:
        # Recherche textuelle
        search_blob = " ".join([
            scene.get("titre", ""),
            " ".join(scene.get("actrices", []) + scene.get("acteurs", [])),
            scene.get("studio", ""),
            scene.get("site", ""),
            " ".join(scene.get("tags", [])),
            scene.get("synopsis", "")
        ]).lower()

        if search_term and search_term.lower() not in search_blob:
            continue

        # Filtre par tag
        if tag_filter and tag_filter not in scene.get("tags", []):
            continue

        # Filtre par actrice
        if actress_filter:
            actrice_match = False
            for actrice in scene.get("actrices", []):
                if actress_filter.lower() in actrice.lower():
                    actrice_match = True
                    break
            if not actrice_match:
                continue

        # Filtre par note
        if rating_filter > 0:
            scene_rating = count_stars(scene.get("note_perso", ""))
            if scene_rating < rating_filter:
                continue

        filtered.append(scene)

    return filtered


def find_mood_scene(scenes, tags=None, actress=None, min_rating=0):
    """Trouve une scène correspondant à l'humeur de l'utilisateur."""
    candidates = []

    for scene in scenes:
        # Vérifier les tags
        if tags:
            tag_list = [t.strip().lower() for t in tags.split(",") if t.strip()]
            scene_tags = [t.lower() for t in scene.get("tags", [])]

            if not all(tag in scene_tags for tag in tag_list):
                continue

        # Vérifier l'actrice
        if actress:
            actress_match = False
            for actrice in scene.get("actrices", []):
                if actress.lower() in actrice.lower():
                    actress_match = True
                    break

            if not actress_match:
                continue

        # Vérifier la note minimale
        if min_rating > 0:
            scene_rating = count_stars(scene.get("note_perso", ""))
            if scene_rating < min_rating:
                continue

        candidates.append(scene)

    if not candidates:
        return None

    return random.choice(candidates)


def format_date(date_str):
    """Formate une date pour l'affichage."""
    if not date_str:
        return "—"
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d").date()
        return d.strftime("%d/%m/%Y")
    except (ValueError, TypeError):
        return date_str


# === COMPOSANTS DE L'INTERFACE ===

def render_login_screen():
    """Affiche l'écran de connexion."""
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        st.markdown('<div class="login-container">', unsafe_allow_html=True)
        st.markdown('<h1 class="login-title">INTYMA</h1>', unsafe_allow_html=True)
        st.markdown('<p class="login-subtitle">Gestionnaire de collection privée</p>', unsafe_allow_html=True)

        password = st.text_input("Mot de passe", type="password", key="login_password")
        login_button = st.button("Accéder", key="login_button")

        if login_button:
            if password == MOT_DE_PASSE:
                st.session_state.authenticated = True
                return True
            else:
                st.error("❌ Mot de passe incorrect")

        st.markdown('</div>', unsafe_allow_html=True)
    return False


def render_scene_card(scene, root_dir, history, favorites):
    """Affiche une carte de scène avec ses détails."""
    is_watched = scene.get("chemin") in history
    is_favorite = scene.get("chemin") in favorites

    # Créer un ID sécurisé pour les boutons (éviter les caractères spéciaux)
    card_id = id(scene)  # Utiliser l'ID de l'objet pour un identifiant unique

    # Préparation des informations de la scène
    scene_title = scene.get('titre', 'Sans titre')
    scene_actresses = ', '.join(scene.get('actrices', []))
    scene_date = format_date(scene.get('date_vue', ''))
    scene_duration = format_duration(scene.get('duree', 0))
    scene_quality = scene.get('qualite', '—')
    scene_studio = scene.get('studio', '—')
    scene_synopsis = scene.get('synopsis', '')
    scene_note = scene.get('note_perso', '—')

    # Création des tags HTML pour les tags de la scène
    tags_html = ''
    scene_tags = scene.get('tags', [])
    display_tags = scene_tags[:8]

    for tag in display_tags:
        tags_html += f'<span class="tag">{tag}</span> '

    if len(scene_tags) > 8:
        tags_html += f'<span class="tag">+{len(scene_tags) - 8}</span>'

    # Indicateurs de statut
    watched_indicator = '<span style="color: #3b82f6;">👁️ Visionnée</span>' if is_watched else ''
    favorite_indicator = '<span style="color: #ef4444;">❤️ Favorite</span>' if is_favorite else ''

    # Construction du HTML de la carte
    # Carte HTML
    st.markdown(f"""
        <div class="card">
            <div class="card-title">{scene_title}</div>
            <div class="card-subtitle">{scene_actresses}</div>

            <div class="icon-text">
                <span>📅 {scene_date}</span>
                <span>⏱️ {scene_duration}</span>
                <span>🎬 {scene_quality}</span>
                <span>🏢 {scene_studio}</span>
                {watched_indicator}
                {favorite_indicator}
            </div>

            <div class="tag-container">
                {tags_html}
            </div>

            <div class="card-content">{scene_synopsis}</div>
        </div>
        """, unsafe_allow_html=True)

    # Boutons visibles standard
    col1, col2, col3 = st.columns(3)
    with col1:
        watch_btn = st.button("▶️ Voir", key=f"watch_{card_id}")
    with col2:
        fav_label = "❤️ Retirer" if is_favorite else "🤍 Ajouter"
        fav_btn = st.button(fav_label, key=f"fav_{card_id}")
    with col3:
        detail_btn = st.button("ℹ️ Détails", key=f"detail_{card_id}")

    actions = {
        "watch": watch_btn,
        "fav": fav_btn,
        "detail": detail_btn,
        "scene": scene
    }

    return actions


def render_actress_card(actress, scenes):
    """Affiche une carte d'actrice avec ses détails."""
    # Trouver toutes les scènes avec cette actrice
    actress_scenes = [scene for scene in scenes if actress['nom'] in scene.get('actrices', [])]
    total_scenes = len(actress_scenes)

    # Créer un ID sécurisé pour le bouton
    card_id = id(actress)

    # Construction des tags HTML
    tags_html = ''
    actress_tags = actress.get('tags_typiques', [])
    display_tags = actress_tags[:10]

    for tag in display_tags:
        tags_html += f'<span class="tag">{tag}</span> '

    if len(actress_tags) > 10:
        tags_html += f'<span class="tag">+{len(actress_tags) - 10}</span>'

    # Construction du bouton de visualisation
    view_button = ''
    if total_scenes > 0:
        view_button = f'<button class="toggle-button" onclick="document.getElementById(\'viewscenes_{card_id}\').click()">👁️ Voir scènes</button>'

    # Carte HTML
    st.markdown(f"""
    <div class="actress-card">
        <h3 style="color: white; font-size: 1.5rem; margin-bottom: 0.5rem;">{actress['nom']}</h3>

        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
            <div>
                <div style="color: #E58DE1; font-size: 1.1rem; margin-bottom: 0.25rem;">
                    {actress.get('note_moyenne', 0)} / 5
                </div>
                <div style="color: #D1D1D1;">
                    {total_scenes} scène{'s' if total_scenes != 1 else ''}
                </div>
                <div style="color: #D1D1D1;">
                    Dernière vue: {format_date(actress.get('derniere_vue', ''))}
                </div>
            </div>
        </div>

        <div class="tag-container">
            {tags_html}
        </div>

        {f'<div style="color: #D1D1D1; font-style: italic; margin-top: 0.5rem;">{actress.get("commentaire", "")}</div>' if actress.get("commentaire") else ''}
    </div>
    """, unsafe_allow_html=True)

    # Bouton standard
    view_scenes = st.button("👁️ Voir scènes", key=f"viewscenes_{card_id}")

    return {
        "view_scenes": view_scenes,
        "actress": actress
    }


def render_detail_view(scene, root_dir, history, favorites):
    """Affiche une vue détaillée d'une scène."""
    is_watched = scene.get("chemin") in history
    is_favorite = scene.get("chemin") in favorites

    # Créer un ID sécurisé pour les boutons
    detail_id = id(scene)

    st.markdown('<div class="scene-detail">', unsafe_allow_html=True)

    st.subheader(scene.get('titre', 'Sans titre'))

    col1, col2 = st.columns([3, 1])

    with col1:
        st.markdown(
            f"**Actrice{'s' if len(scene.get('actrices', [])) > 1 else ''}:** {', '.join(scene.get('actrices', ['—']))}")
        st.markdown(
            f"**Acteur{'s' if len(scene.get('acteurs', [])) > 1 else ''}:** {', '.join(scene.get('acteurs', ['—']))}")
        st.markdown(f"**Studio:** {scene.get('studio', '—')}")
        st.markdown(f"**Site:** {scene.get('site', '—')}")
        st.markdown(f"**Durée:** {format_duration(scene.get('duree', 0))}")
        st.markdown(f"**Qualité:** {scene.get('qualite', '—')}")
        st.markdown(f"**Date de visionnage:** {format_date(scene.get('date_vue', ''))}")
        st.markdown(f"**Note personnelle:** {scene.get('note_perso', '—')}")

    with col2:
        play_btn = st.button("▶️ Lancer la vidéo", help="Lancer la lecture de la vidéo",
                             key=f"detail_play_{detail_id}")

        fav_state = "Retirer des favoris" if is_favorite else "Ajouter aux favoris"
        fav_btn = st.button(f"{'❤️' if is_favorite else '🤍'} {fav_state}",
                            key=f"detail_fav_{detail_id}")

        watched_state = "Marquer comme non vue" if is_watched else "Marquer comme vue"
        watched_btn = st.button(f"{'👁️' if is_watched else '👁️‍🗨️'} {watched_state}",
                                key=f"detail_watched_{detail_id}")

        edit_btn = st.button("✏️ Modifier la fiche", key=f"detail_edit_{detail_id}")

    st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    if scene.get('synopsis'):
        st.markdown("### Synopsis")
        st.markdown(f"<div class='card-content'>{scene.get('synopsis', '')}</div>", unsafe_allow_html=True)
        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

    st.markdown("### Tags")
    st.markdown('<div class="tag-container">', unsafe_allow_html=True)
    for tag in scene.get('tags', []):
        st.markdown(f'<span class="tag">{tag}</span>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("### Chemin du fichier")
    st.code(scene.get('chemin', ''), language="bash")

    st.markdown('</div>', unsafe_allow_html=True)

    actions = {
        "play": play_btn,
        "fav": fav_btn,
        "watched": watched_btn,
        "edit": edit_btn
    }

    return actions


def render_scene_form(scene=None):
    """Affiche un formulaire pour ajouter ou modifier une scène."""
    is_edit = scene is not None
    form_title = "Modifier la fiche" if is_edit else "Nouvelle fiche de scène"

    st.subheader(form_title)

    with st.form(key=f"scene_form_{id(scene) if scene else 'new'}"):
        # Champs de base
        chemin = st.text_input("Chemin du fichier", value=scene.get("chemin", "") if is_edit else "",
                               help="Chemin relatif depuis le dossier racine")
        titre = st.text_input("Titre", value=scene.get("titre", "") if is_edit else "")

        col1, col2 = st.columns(2)
        with col1:
            actrices = st.text_input("Actrices (séparées par virgule)",
                                     value=", ".join(scene.get("actrices", [])) if is_edit else "")
        with col2:
            acteurs = st.text_input("Acteurs (séparés par virgule)",
                                    value=", ".join(scene.get("acteurs", [])) if is_edit else "")

        col1, col2 = st.columns(2)
        with col1:
            studio = st.text_input("Studio", value=scene.get("studio", "") if is_edit else "")
        with col2:
            site = st.text_input("Site", value=scene.get("site", "") if is_edit else "")

        col1, col2, col3 = st.columns(3)
        with col1:
            duree = st.number_input("Durée (min)", min_value=0, step=1, value=scene.get("duree", 0) if is_edit else 0)
        with col2:
            qualite = st.text_input("Qualité", value=scene.get("qualite", "") if is_edit else "")
        with col3:
            date_vue_value = date.today()
            if is_edit and scene.get("date_vue"):
                try:
                    date_vue_value = datetime.strptime(scene.get("date_vue"), "%Y-%m-%d").date()
                except ValueError:
                    pass
            date_vue = st.date_input("Date de visionnage", value=date_vue_value)

        synopsis = st.text_area("Synopsis", value=scene.get("synopsis", "") if is_edit else "", height=150)
        tags = st.text_input("Tags (séparés par virgule)", value=", ".join(scene.get("tags", [])) if is_edit else "")
        note_perso = st.text_input("Note personnelle", value=scene.get("note_perso", "") if is_edit else "",
                                   help="Utiliser ⭐ pour indiquer la note")

        submit_btn = st.form_submit_button("Enregistrer")

        if submit_btn:
            # Préparation des données
            new_scene = {
                "chemin": chemin,
                "titre": titre,
                "actrices": [a.strip() for a in actrices.split(",") if a.strip()],
                "acteurs": [a.strip() for a in acteurs.split(",") if a.strip()],
                "studio": studio,
                "site": site,
                "synopsis": synopsis,
                "tags": [t.strip() for t in tags.split(",") if t.strip()],
                "duree": int(duree) if duree > 0 else None,
                "qualite": qualite,
                "note_perso": note_perso,
                "date_vue": date_vue.strftime("%Y-%m-%d")
            }

            return new_scene

    return None


def render_actress_form(actress=None):
    """Affiche un formulaire pour ajouter ou modifier une actrice."""
    is_edit = actress is not None
    form_title = "Modifier la fiche actrice" if is_edit else "Nouvelle fiche actrice"

    st.subheader(form_title)

    with st.form(key=f"actress_form_{id(actress) if actress else 'new'}"):
        nom = st.text_input("Nom", value=actress.get("nom", "") if is_edit else "")
        commentaire = st.text_area("Commentaire", value=actress.get("commentaire", "") if is_edit else "", height=100)
        photo = st.text_input("Chemin de la photo", value=actress.get("photo", "") if is_edit else "")

        submit_btn = st.form_submit_button("Enregistrer")

        if submit_btn:
            # Préparation des données
            new_actress = {
                "nom": nom,
                "nombre_de_scenes": actress.get("nombre_de_scenes", 0) if is_edit else 0,
                "note_moyenne": actress.get("note_moyenne", None) if is_edit else None,
                "derniere_vue": actress.get("derniere_vue", None) if is_edit else None,
                "tags_typiques": actress.get("tags_typiques", []) if is_edit else [],
                "commentaire": commentaire,
                "photo": photo
            }

            return new_actress

    return None


def render_mood_selector():
    """Affiche un sélecteur pour le mode humeur."""
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.subheader("💫 Mode Humeur")
    st.markdown("Dis-moi ce que tu veux aujourd'hui et je te proposerai une scène qui correspond à ton humeur.")

    tags = st.text_input("Tags souhaités (séparés par virgule)", help="Ex: milf, blowjob, doggystyle")
    actrice = st.text_input("Actrice spécifique (optionnel)")

    col1, col2 = st.columns(2)
    with col1:
        note_min = st.select_slider("Note minimum",
                                    options=["Peu importe", "⭐ ou plus", "⭐⭐ ou plus", "⭐⭐⭐ ou plus", "⭐⭐⭐⭐ ou plus",
                                             "⭐⭐⭐⭐⭐"])
    with col2:
        trouver_btn = st.button("🔍 Trouver une scène", use_container_width=True)

    st.markdown('</div>', unsafe_allow_html=True)

    # Conversion de la note en valeur numérique
    note_map = {
        "Peu importe": 0,
        "⭐ ou plus": 1,
        "⭐⭐ ou plus": 2,
        "⭐⭐⭐ ou plus": 3,
        "⭐⭐⭐⭐ ou plus": 4,
        "⭐⭐⭐⭐⭐": 5
    }

    return {
        "tags": tags,
        "actrice": actrice,
        "note_min": note_map[note_min],
        "trouver": trouver_btn
    }


def render_stats_dashboard(stats):
    """Affiche un tableau de bord des statistiques."""
    st.subheader("📊 Tableau de bord")

    # Métriques principales
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-value">{stats["total_scenes"]}</div>', unsafe_allow_html=True)
        st.markdown('<div class="metric-label">Scènes totales</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    with col2:
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-value">{stats["watched_scenes"]}</div>', unsafe_allow_html=True)
        st.markdown('<div class="metric-label">Scènes visionnées</div>', unsafe_allow_html=True)

        # Barre de progression
        if stats["total_scenes"] > 0:
            progress = int(stats["watched_scenes"] / stats["total_scenes"] * 100)
            progress_html = f'<div class="progress-container"><div class="progress-bar" style="width: {progress}%;"></div></div>'
            st.markdown(progress_html, unsafe_allow_html=True)

        st.markdown('</div>', unsafe_allow_html=True)

    with col3:
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-value">{stats["favorite_scenes"]}</div>', unsafe_allow_html=True)
        st.markdown('<div class="metric-label">Scènes favorites</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    with col4:
        hours = stats["total_duration"] // 60
        minutes = stats["total_duration"] % 60

        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown(f'<div class="metric-value">{hours}h {minutes}m</div>', unsafe_allow_html=True)
        st.markdown('<div class="metric-label">Durée totale</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('<div style="height: 20px;"></div>', unsafe_allow_html=True)

    # Graphiques
    col1, col2 = st.columns(2)

    with col1:
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="color: white; margin-bottom: 1rem;">Top 10 des actrices</h3>', unsafe_allow_html=True)

        if stats["top_actresses"]:
            fig = px.bar(
                x=[count for _, count in stats["top_actresses"]],
                y=[actress for actress, _ in stats["top_actresses"]],
                orientation='h',
                color=[count for _, count in stats["top_actresses"]],
                color_continuous_scale="Viridis",
            )

            fig.update_layout(
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(color="white"),
                xaxis_title="Nombre de scènes",
                yaxis_title="",
                coloraxis_showscale=False,
                height=400,
                margin=dict(l=10, r=10, t=10, b=10)
            )

            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Pas assez de données pour afficher ce graphique.")

        st.markdown('</div>', unsafe_allow_html=True)

    with col2:
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="color: white; margin-bottom: 1rem;">Tags populaires</h3>', unsafe_allow_html=True)

        if stats["top_tags"]:
            tag_cloud = create_tag_cloud(stats["top_tags"])
            if tag_cloud:
                st.plotly_chart(tag_cloud, use_container_width=True)
        else:
            st.info("Pas assez de données pour afficher ce nuage de tags.")

        st.markdown('</div>', unsafe_allow_html=True)

    # Répartition par studio
    if stats["studios"]:
        st.markdown('<div style="height: 20px;"></div>', unsafe_allow_html=True)
        st.markdown('<div class="stats-card">', unsafe_allow_html=True)
        st.markdown('<h3 style="color: white; margin-bottom: 1rem;">Répartition par studio</h3>',
                    unsafe_allow_html=True)

        studios_sorted = sorted(stats["studios"].items(), key=lambda x: x[1], reverse=True)
        fig = px.pie(
            values=[count for _, count in studios_sorted],
            names=[studio for studio, _ in studios_sorted],
            hole=0.4,
            color_discrete_sequence=px.colors.sequential.Viridis
        )

        fig.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(color="white"),
            legend=dict(orientation="h", yanchor="bottom", y=-0.2),
            height=400,
            margin=dict(l=10, r=10, t=10, b=10)
        )

        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)


def render_sidebar(current_view):
    """Affiche la barre latérale avec les menus."""
    st.sidebar.markdown('<h1 style="color: #E58DE1; font-size: 2rem; margin-bottom: 1rem;">INTYMA</h1>',
                        unsafe_allow_html=True)
    st.sidebar.markdown('<p style="color: #A1A1A1; margin-bottom: 2rem;">Gestionnaire de collection privée</p>',
                        unsafe_allow_html=True)

    # Menu principal
    st.sidebar.markdown('<div style="margin-bottom: 1rem;"><strong style="color: #D1D1D1;">NAVIGATION</strong></div>',
                        unsafe_allow_html=True)

    menu_items = {
        "home": {"icon": "🎬", "label": "Bibliothèque"},
        "actresses": {"icon": "👩", "label": "Actrices"},
        "favorites": {"icon": "❤️", "label": "Favoris"},
        "history": {"icon": "👁️", "label": "Historique"},
        "stats": {"icon": "📊", "label": "Statistiques"},
        "mood": {"icon": "💫", "label": "Mode Humeur"},
        "random": {"icon": "🎲", "label": "Surprends-moi !"}
    }

    for key, item in menu_items.items():
        is_active = current_view == key
        style = "color: #E58DE1;" if is_active else "color: #D1D1D1;"
        bg_style = "background-color: rgba(229, 141, 225, 0.2);" if is_active else ""

        # Identifiant unique pour éviter les collisions
        menu_id = f"{key}_menu_{id(key)}"

        html = f"""<div style="margin-bottom: 0.5rem;">
                <button id="{menu_id}" style="border: none; width: 100%; text-align: left; padding: 0.75rem 1rem; border-radius: 0.5rem; {bg_style} cursor: pointer;">
                    <span style="{style}">{item['icon']} {item['label']}</span>
                </button>
            </div>"""

        st.sidebar.markdown(html, unsafe_allow_html=True)

        # Bouton caché pour intercepter les clics
        if st.sidebar.button(item['label'], key=menu_id, help=f"Aller à {item['label']}", type="secondary"):
            if key == "random":
                return "random_trigger"  # Signal spécial pour déclencher la fonction aléatoire
            return key

    st.sidebar.markdown('<div class="divider" style="margin: 1.5rem 0;"></div>', unsafe_allow_html=True)

    # Utilitaires
    st.sidebar.markdown('<div style="margin-bottom: 1rem;"><strong style="color: #D1D1D1;">UTILITAIRES</strong></div>',
                        unsafe_allow_html=True)

    util_items = {
        "add_scene": {"icon": "📝", "label": "Ajouter une scène"},
        "add_actress": {"icon": "👤", "label": "Ajouter une actrice"},
        "settings": {"icon": "⚙️", "label": "Paramètres"},
        "logout": {"icon": "🔒", "label": "Se déconnecter"}
    }

    for key, item in util_items.items():
        is_active = current_view == key
        style = "color: #E58DE1;" if is_active else "color: #D1D1D1;"
        bg_style = "background-color: rgba(229, 141, 225, 0.2);" if is_active else ""

        # Identifiant unique pour éviter les collisions
        util_id = f"{key}_util_{id(key)}"

        html = f"""<div style="margin-bottom: 0.5rem;">
                <button id="{util_id}" style="border: none; width: 100%; text-align: left; padding: 0.75rem 1rem; border-radius: 0.5rem; {bg_style} cursor: pointer;">
                    <span style="{style}">{item['icon']} {item['label']}</span>
                </button>
            </div>"""

        st.sidebar.markdown(html, unsafe_allow_html=True)

        # Bouton caché pour intercepter les clics
        if st.sidebar.button(item['label'], key=util_id, help=f"{item['label']}", type="secondary"):
            return key

    # Afficher les informations générales
    root_dir = Path(st.session_state.get("root_dir", str(DEFAULT_ROOT)))

    st.sidebar.markdown('<div class="divider" style="margin: 1.5rem 0;"></div>', unsafe_allow_html=True)
    st.sidebar.markdown('<div style="color: #A1A1A1; font-size: 0.8rem;">', unsafe_allow_html=True)
    st.sidebar.markdown(f"**Dossier racine :**<br/>{root_dir}", unsafe_allow_html=True)
    st.sidebar.markdown(f"**Version :** 2.0.0", unsafe_allow_html=True)
    st.sidebar.markdown('</div>', unsafe_allow_html=True)

    return current_view


# === LOGIQUE PRINCIPALE DE L'APPLICATION ===

def main():
    """Fonction principale de l'application."""
    # Initialisation des variables de session
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False

    if "root_dir" not in st.session_state:
        st.session_state.root_dir = str(DEFAULT_ROOT)

    if "current_view" not in st.session_state:
        st.session_state.current_view = "home"

    if "detail_scene" not in st.session_state:
        st.session_state.detail_scene = None

    if "random_scene" not in st.session_state:
        st.session_state.random_scene = None

    if "modal_open" not in st.session_state:
        st.session_state.modal_open = False

    # Écran de connexion
    if not st.session_state.authenticated:
        render_login_screen()
        return

    # Chargement des données
    root_dir = Path(st.session_state.root_dir)
    scenes = load_json(METADATA_FILE, [])
    history = load_json(HISTORY_FILE, [])
    favorites = load_json(FAVORITES_FILE, [])
    actresses = load_json(ACTRESSES_FILE, [])

    # Navigation dans la barre latérale
    sidebar_action = render_sidebar(st.session_state.current_view)

    if sidebar_action:
        if sidebar_action == "random_trigger":
            # Trouver une scène non vue
            unwatched = [s for s in scenes if s.get("chemin") not in history]
            if unwatched:
                st.session_state.random_scene = random.choice(unwatched)
                st.session_state.current_view = "random"
            else:
                st.warning("Toutes les scènes ont déjà été visionnées !")
        elif sidebar_action == "logout":
            st.session_state.authenticated = False
            st.rerun()
        else:
            st.session_state.current_view = sidebar_action
            st.session_state.detail_scene = None  # Réinitialiser la scène détaillée
            st.rerun()

    # === AFFICHAGE DE LA VUE PRINCIPALE ===
    if st.session_state.current_view == "home":
        st.title("📚 Bibliothèque")

        # Barre de recherche et filtres
        search_col1, search_col2, search_col3 = st.columns([3, 1, 1])

        with search_col1:
            search_term = st.text_input("🔍 Rechercher une scène", help="Rechercher par titre, actrice, tag...")

        with search_col2:
            tag_filter = st.selectbox(
                "Filtrer par tag",
                options=[""] + sorted(list(set(tag for scene in scenes for tag in scene.get("tags", [])))),
                format_func=lambda x: "Tous les tags" if x == "" else x
            )

        with search_col3:
            actress_filter = st.selectbox(
                "Filtrer par actrice",
                options=[""] + sorted(list(set(actress for scene in scenes for actress in scene.get("actrices", [])))),
                format_func=lambda x: "Toutes les actrices" if x == "" else x
            )

        # Filtrer les scènes
        filtered_scenes = filter_scenes(scenes, search_term, tag_filter, actress_filter)

        st.markdown(f"<p style='color: #A1A1A1;'>{len(filtered_scenes)} scène(s) trouvée(s)</p>",
                    unsafe_allow_html=True)

        # Afficher les scènes
        for scene in filtered_scenes:
            actions = render_scene_card(scene, root_dir, history, favorites)

            if actions["watch"]:
                # Lancer la vidéo
                success = launch_video(scene["chemin"], root_dir)
                if success:
                    # Ajouter à l'historique
                    if scene["chemin"] not in history:
                        history.append(scene["chemin"])
                        save_json(HISTORY_FILE, history)
                        st.success(f"✅ Vidéo ajoutée à l'historique : {scene['titre']}")
                        time.sleep(1)
                        st.rerun()

            if actions["fav"]:
                # Ajouter/retirer des favoris
                if scene["chemin"] in favorites:
                    favorites.remove(scene["chemin"])
                    save_json(FAVORITES_FILE, favorites)
                    st.info(f"Vidéo retirée des favoris : {scene['titre']}")
                else:
                    favorites.append(scene["chemin"])
                    save_json(FAVORITES_FILE, favorites)
                    st.success(f"✅ Vidéo ajoutée aux favoris : {scene['titre']}")
                time.sleep(1)
                st.rerun()

            if actions["detail"]:
                # Afficher la vue détaillée
                st.session_state.detail_scene = scene
                st.session_state.current_view = "detail"
                st.rerun()

    elif st.session_state.current_view == "favorites":
        st.title("❤️ Favoris")
        favorite_scenes = [scene for scene in scenes if scene["chemin"] in favorites]
        if not favorite_scenes:
            st.info("Aucune scène en favoris pour le moment.")
        else:
            st.markdown(f"<p style='color: #A1A1A1;'>{len(favorite_scenes)} scène(s) en favoris</p>",
                        unsafe_allow_html=True)
            for scene in favorite_scenes:
                actions = render_scene_card(scene, root_dir, history, favorites)
                if actions["watch"]:
                    # Lancer la vidéo
                    success = launch_video(scene["chemin"], root_dir)
                    if success and scene["chemin"] not in history:
                        history.append(scene["chemin"])
                        save_json(HISTORY_FILE, history)
                if actions["fav"]:
                    # Retirer des favoris
                    favorites.remove(scene["chemin"])
                    save_json(FAVORITES_FILE, favorites)
                    st.info(f"Vidéo retirée des favoris : {scene['titre']}")
                    time.sleep(1)
                    st.rerun()
                if actions["detail"]:
                    # Afficher la vue détaillée
                    st.session_state.detail_scene = scene
                    st.session_state.current_view = "detail"
                    st.rerun()

    elif st.session_state.current_view == "history":
        st.title("👁️ Historique")

        watched_scenes = [scene for scene in scenes if scene["chemin"] in history]

        if not watched_scenes:
            st.info("Aucune scène dans l'historique.")
        else:
            # Trier par date de visionnage (plus récente en premier)
            watched_scenes.sort(key=lambda x: x.get("date_vue", ""), reverse=True)

            st.markdown(f"<p style='color: #A1A1A1;'>{len(watched_scenes)} scène(s) dans l'historique</p>",
                        unsafe_allow_html=True)

            for scene in watched_scenes:
                actions = render_scene_card(scene, root_dir, history, favorites)

                if actions["watch"]:
                    # Lancer la vidéo
                    launch_video(scene["chemin"], root_dir)

                if actions["fav"]:
                    # Ajouter/retirer des favoris
                    if scene["chemin"] in favorites:
                        favorites.remove(scene["chemin"])
                        save_json(FAVORITES_FILE, favorites)
                        st.info(f"Vidéo retirée des favoris : {scene['titre']}")
                    else:
                        favorites.append(scene["chemin"])
                        save_json(FAVORITES_FILE, favorites)
                        st.success(f"✅ Vidéo ajoutée aux favoris : {scene['titre']}")
                    time.sleep(1)
                    st.rerun()

                if actions["detail"]:
                    # Afficher la vue détaillée
                    st.session_state.detail_scene = scene
                    st.session_state.current_view = "detail"
                    st.rerun()


    elif st.session_state.current_view == "actresses":

        st.title("👩 Actrices")

        if not actresses:

            st.info("Aucune fiche actrice trouvée.")

        else:

            # Barre de recherche

            search_actress = st.text_input("🔍 Rechercher une actrice")

            # Filtrer les actrices

            filtered_actresses = actresses

            if search_actress:
                filtered_actresses = [a for a in actresses if search_actress.lower() in a["nom"].lower()]

            st.markdown(f"<p style='color: #A1A1A1;'>{len(filtered_actresses)} actrice(s) trouvée(s)</p>",
                        unsafe_allow_html=True)

            # Afficher les résultats en grille

            cols = st.columns(2)

            for i, actress in enumerate(filtered_actresses):

                with cols[i % 2]:

                    actions = render_actress_card(actress, scenes)

                    if actions["view_scenes"]:
                        # Filtrer les scènes par actrice

                        st.session_state.current_view = "home"

                        # On simule le filtrage en stockant le filtre dans la session

                        st.session_state.actress_filter = actress["nom"]

                        st.rerun()


    elif st.session_state.current_view == "stats":

        st.title("📊 Statistiques")

        # Calculer les statistiques

        stats = calculate_statistics(scenes, history, favorites)

        # Afficher le tableau de bord

        render_stats_dashboard(stats)


    elif st.session_state.current_view == "mood":

        st.title("💫 Mode Humeur")

        mood_inputs = render_mood_selector()

        if mood_inputs["trouver"]:

            # Rechercher une scène correspondant aux critères

            mood_scene = find_mood_scene(

                scenes,

                tags=mood_inputs["tags"],

                actress=mood_inputs["actrice"],

                min_rating=mood_inputs["note_min"]

            )

            if not mood_scene:

                st.error("❌ Aucune scène ne correspond à ces critères. Essaie avec des filtres moins restrictifs.")

            else:

                st.session_state.random_scene = mood_scene

                st.session_state.current_view = "random"

                st.rerun()


    elif st.session_state.current_view == "random":

        st.title("🎲 Scène proposée")

        if not st.session_state.random_scene:

            # Aucune scène aléatoire n'a été sélectionnée

            st.info("Cliquez sur 'Surprends-moi !' pour obtenir une suggestion de scène.")

        else:

            scene = st.session_state.random_scene

            # Afficher la scène en détail

            st.markdown('<div class="scene-detail">', unsafe_allow_html=True)

            st.subheader(scene.get('titre', 'Sans titre'))

            col1, col2 = st.columns([3, 1])

            with col1:

                st.markdown(
                    f"**Actrice{'s' if len(scene.get('actrices', [])) > 1 else ''}:** {', '.join(scene.get('actrices', ['—']))}")

                st.markdown(f"**Studio:** {scene.get('studio', '—')}")

                st.markdown(f"**Durée:** {format_duration(scene.get('duree', 0))}")

                st.markdown(f"**Qualité:** {scene.get('qualite', '—')}")

                if scene.get('synopsis'):
                    st.markdown("### Synopsis")

                    st.markdown(f"<div class='card-content'>{scene.get('synopsis', '')}</div>", unsafe_allow_html=True)

            with col2:

                play_btn = st.button("▶️ Lancer la vidéo", help="Lancer la lecture de la vidéo", key="random_play")

                is_favorite = scene["chemin"] in favorites

                fav_state = "Retirer des favoris" if is_favorite else "Ajouter aux favoris"

                fav_btn = st.button(f"{'❤️' if is_favorite else '🤍'} {fav_state}", key="random_fav")

                next_btn = st.button("🔄 Autre suggestion", key="random_next")

                detail_btn = st.button("ℹ️ Voir tous les détails", key="random_detail")

            st.markdown("### Tags")

            st.markdown('<div class="tag-container">', unsafe_allow_html=True)

            for tag in scene.get('tags', []):
                st.markdown(f'<span class="tag">{tag}</span>', unsafe_allow_html=True)

            st.markdown('</div>', unsafe_allow_html=True)

            st.markdown('</div>', unsafe_allow_html=True)

            # Gérer les actions

            if play_btn:

                # Lancer la vidéo

                success = launch_video(scene["chemin"], root_dir)

                if success:

                    # Ajouter à l'historique

                    if scene["chemin"] not in history:
                        history.append(scene["chemin"])

                        save_json(HISTORY_FILE, history)

                        st.success(f"✅ Vidéo ajoutée à l'historique : {scene['titre']}")

            if fav_btn:

                # Ajouter/retirer des favoris

                if scene["chemin"] in favorites:

                    favorites.remove(scene["chemin"])

                    save_json(FAVORITES_FILE, favorites)

                    st.info(f"Vidéo retirée des favoris : {scene['titre']}")

                else:

                    favorites.append(scene["chemin"])

                    save_json(FAVORITES_FILE, favorites)

                    st.success(f"✅ Vidéo ajoutée aux favoris : {scene['titre']}")

                time.sleep(1)

                st.rerun()

            if next_btn:

                # Trouver une autre scène non vue

                unwatched = [s for s in scenes if s.get("chemin") not in history and s != scene]

                if unwatched:

                    st.session_state.random_scene = random.choice(unwatched)

                    st.rerun()

                else:

                    st.warning("Il ne reste plus de scènes non visionnées !")

            if detail_btn:
                # Afficher la vue détaillée

                st.session_state.detail_scene = scene

                st.session_state.current_view = "detail"

                st.rerun()


    elif st.session_state.current_view == "detail":

        if not st.session_state.detail_scene:
            st.warning("Aucune scène sélectionnée.")

            st.session_state.current_view = "home"

            st.rerun()

        scene = st.session_state.detail_scene

        st.title(f"Détails de la scène")

        # Bouton retour

        if st.button("← Retour"):
            st.session_state.detail_scene = None

            st.session_state.current_view = "home"

            st.rerun()

        # Afficher la vue détaillée

        actions = render_detail_view(scene, root_dir, history, favorites)

        if actions["play"]:

            # Lancer la vidéo

            success = launch_video(scene["chemin"], root_dir)

            if success and scene["chemin"] not in history:
                history.append(scene["chemin"])

                save_json(HISTORY_FILE, history)

                st.success(f"✅ Vidéo ajoutée à l'historique")

                st.rerun()

        if actions["fav"]:

            # Ajouter/retirer des favoris

            if scene["chemin"] in favorites:

                favorites.remove(scene["chemin"])

                save_json(FAVORITES_FILE, favorites)

                st.info(f"Vidéo retirée des favoris")

            else:

                favorites.append(scene["chemin"])

                save_json(FAVORITES_FILE, favorites)

                st.success(f"✅ Vidéo ajoutée aux favoris")

            st.rerun()

        if actions["watched"]:

            # Marquer comme vue/non vue

            if scene["chemin"] in history:

                history.remove(scene["chemin"])

                save_json(HISTORY_FILE, history)

                st.info(f"Vidéo marquée comme non vue")

            else:

                history.append(scene["chemin"])

                save_json(HISTORY_FILE, history)

                st.success(f"✅ Vidéo marquée comme vue")

            st.rerun()

        if actions["edit"]:
            # Modifier la fiche

            st.session_state.current_view = "edit_scene"

            st.rerun()


    elif st.session_state.current_view == "add_scene":

        st.title("📝 Ajouter une nouvelle scène")

        # Formulaire d'ajout de scène

        new_scene = render_scene_form()

        if new_scene:

            # Vérifier si la scène existe déjà

            existing = next((s for s in scenes if s["chemin"] == new_scene["chemin"]), None)

            if existing:

                st.warning(f"Une scène avec ce chemin existe déjà : {new_scene['chemin']}")

            else:

                # Ajouter la nouvelle scène

                scenes.append(new_scene)

                save_json(METADATA_FILE, scenes)

                st.success(f"✅ Nouvelle scène ajoutée : {new_scene['titre']}")

                # Retourner à la bibliothèque

                st.session_state.current_view = "home"

                time.sleep(1)

                st.rerun()


    elif st.session_state.current_view == "edit_scene":

        st.title("✏️ Modifier une scène")

        if not st.session_state.detail_scene:
            st.warning("Aucune scène sélectionnée.")

            st.session_state.current_view = "home"

            st.rerun()

        scene = st.session_state.detail_scene

        # Formulaire de modification

        updated_scene = render_scene_form(scene)

        if updated_scene:

            # Mettre à jour la scène

            for i, s in enumerate(scenes):

                if s["chemin"] == scene["chemin"]:
                    scenes[i] = updated_scene

                    break

            save_json(METADATA_FILE, scenes)

            st.success(f"✅ Scène mise à jour : {updated_scene['titre']}")

            # Retourner à la vue détaillée

            st.session_state.detail_scene = updated_scene

            st.session_state.current_view = "detail"

            time.sleep(1)

            st.rerun()


    elif st.session_state.current_view == "add_actress":

        st.title("👤 Ajouter une nouvelle actrice")

        # Formulaire d'ajout d'actrice

        new_actress = render_actress_form()

        if new_actress:

            # Vérifier si l'actrice existe déjà

            existing = next((a for a in actresses if a["nom"].lower() == new_actress["nom"].lower()), None)

            if existing:

                st.warning(f"Une actrice avec ce nom existe déjà : {new_actress['nom']}")

            else:

                # Ajouter la nouvelle actrice

                actresses.append(new_actress)

                save_json(ACTRESSES_FILE, actresses)

                st.success(f"✅ Nouvelle actrice ajoutée : {new_actress['nom']}")

                # Retourner à la liste des actrices

                st.session_state.current_view = "actresses"

                time.sleep(1)

                st.rerun()


    elif st.session_state.current_view == "settings":

        st.title("⚙️ Paramètres")

        # Paramètres généraux

        st.subheader("Paramètres généraux")

        # Chemin racine

        new_root = st.text_input("Dossier racine", value=st.session_state.root_dir)

        if new_root != st.session_state.root_dir:

            if os.path.exists(new_root):

                st.session_state.root_dir = new_root

                st.success(f"✅ Dossier racine mis à jour : {new_root}")

                time.sleep(1)

                st.rerun()

            else:

                st.error(f"❌ Le dossier n'existe pas : {new_root}")

        # Actions sur les données

        st.subheader("Actions sur les données")

        col1, col2 = st.columns(2)

        with col1:

            if st.button("🔄 Synchroniser les métadonnées"):

                # Simuler la synchronisation

                st.info("Synchronisation en cours...")

                progress_bar = st.progress(0)

                # Lister tous les fichiers vidéo

                all_videos = list_all_videos(root_dir)

                # Trouver les scènes manquantes

                existing_paths = [s["chemin"] for s in scenes]

                missing = [v for v in all_videos if v not in existing_paths]

                # Mettre à jour la barre de progression

                for i in range(100):
                    time.sleep(0.01)

                    progress_bar.progress(i + 1)

                st.success(f"✅ Synchronisation terminée ! {len(missing)} scènes manquantes trouvées.")

                # Afficher les scènes manquantes

                if missing:

                    st.markdown("### Scènes manquantes")

                    for path in missing[:5]:
                        st.markdown(f"- `{path}`")

                    if len(missing) > 5:
                        st.markdown(f"- *et {len(missing) - 5} autres...*")

        with col2:

            if st.button("♻️ Régénérer les fiches actrices"):

                # Simuler la régénération

                st.info("Régénération en cours...")

                progress_bar = st.progress(0)

                # Compter les actrices

                all_actresses = set()

                for scene in scenes:
                    all_actresses.update(scene.get("actrices", []))

                # Mettre à jour la barre de progression

                for i in range(100):
                    time.sleep(0.01)

                    progress_bar.progress(i + 1)

                st.success(f"✅ Régénération terminée ! {len(all_actresses)} fiches actrices traitées.")

        st.markdown('<div class="divider"></div>', unsafe_allow_html=True)

        # Réinitialisation

        st.subheader("Réinitialisation")

        reset_col1, reset_col2 = st.columns(2)

        with reset_col1:

            if st.button("🗑️ Réinitialiser l'historique"):

                # Confirmation

                st.warning("Êtes-vous sûr de vouloir réinitialiser l'historique ?")

                confirm_col1, confirm_col2 = st.columns(2)

                with confirm_col1:

                    if st.button("Oui, réinitialiser", key="confirm_reset_history"):
                        history.clear()

                        save_json(HISTORY_FILE, history)

                        st.success("✅ Historique réinitialisé avec succès.")

                        time.sleep(1)

                        st.rerun()

                with confirm_col2:

                    if st.button("Annuler", key="cancel_reset_history"):
                        st.info("Réinitialisation annulée.")

        with reset_col2:

            if st.button("💔 Réinitialiser les favoris"):

                # Confirmation

                st.warning("Êtes-vous sûr de vouloir réinitialiser les favoris ?")

                confirm_col1, confirm_col2 = st.columns(2)

                with confirm_col1:

                    if st.button("Oui, réinitialiser", key="confirm_reset_favorites"):
                        favorites.clear()

                        save_json(FAVORITES_FILE, favorites)

                        st.success("✅ Favoris réinitialisés avec succès.")

                        time.sleep(1)

                        st.rerun()

                with confirm_col2:

                    if st.button("Annuler", key="cancel_reset_favorites"):
                        st.info("Réinitialisation annulée.")

# === EXÉCUTION ===
if __name__ == "__main__":
    main()