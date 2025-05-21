import os
import json
import random
import subprocess
import sys
from datetime import date

# === PARAMÈTRES ===
racine = "/Volumes/My Passport for Mac/Privé/M364TR0N/"
extensions_vidéo = ('.mp4', '.avi', '.mkv')
history_file = "history.json"
favorites_file = "favorites.json"
metadata_file = "scenes_metadata.json"
MOT_DE_PASSE = "intyma2025"


def verifier_mot_de_passe():
    tentative = input("🔐 Entrez le mot de passe : ").strip()
    if tentative != MOT_DE_PASSE:
        print("⛔ Mot de passe incorrect. Accès refusé.")
        sys.exit(1)

# === OUTILS DE BASE ===
def charger_liste(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def enregistrer_liste(path, liste):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(liste, f, indent=2, ensure_ascii=False)

# === AFFICHAGE ===
def afficher_liste(nom, liste):
    print(f"\n📂 {nom} ({len(liste)} éléments)\n")
    for i, item in enumerate(liste, 1):
        print(f"{i}. {item}")
    print("")


# === FONCTIONS PRINCIPALES ===
def proposer_scene(history, favorites):
    videos_trouvees = []
    for dossier_actuel, sous_dossiers, fichiers in os.walk(racine):
        for fichier in fichiers:
            if fichier.lower().endswith(extensions_vidéo):
                chemin_complet = os.path.join(dossier_actuel, fichier)
                videos_trouvees.append(chemin_complet)

    videos_non_vues = [v for v in videos_trouvees if v not in history]

    if not videos_non_vues:
        print("🔁 Toutes les vidéos ont été vues.")
        choix_fav = input("Souhaites-tu revoir une vidéo favorite ? (o/n) : ").strip().lower()
        if choix_fav == "o":
            if favorites:
                favori_choisi = random.choice(favorites)
                print("🎬 Favori du jour :\n", favori_choisi)
                subprocess.run(["open", favori_choisi])
            else:
                print("⚠️ Aucun favori enregistré.")
        else:
            print("À bientôt ✨")
        return history, favorites

    video_choisie = random.choice(videos_non_vues)
    print("🎬 Vidéo du jour :\n", video_choisie)
    afficher_fiche_scene(video_choisie)
    subprocess.run(["open", video_choisie])

    reponse = input("As-tu vraiment regardé cette vidéo ? (o/n) : ").strip().lower()
    if reponse == "o":
        history.append(video_choisie)
        enregistrer_liste(history_file, history)
        print("✅ Vidéo ajoutée à l’historique.")
    else:
        print("❌ Non ajoutée à l’historique.")

    reponse_fav = input("Veux-tu ajouter cette vidéo aux favoris ? (o/n) : ").strip().lower()
    if reponse_fav == "o":
        if video_choisie not in favorites:
            favorites.append(video_choisie)
            enregistrer_liste(favorites_file, favorites)
            print("⭐ Vidéo ajoutée aux favoris.")
        else:
            print("⚠️ Déjà présente dans les favoris.")

    # === AJOUTER UNE NOTE PERSO ===
    noter = input("📝 Veux-tu ajouter une note personnelle à cette scène ? (o/n) : ").strip().lower()
    if noter == "o":
        ajouter_ou_mettre_a_jour_note(video_choisie)

    return history, favorites


def charger_metadata():
    if os.path.exists(metadata_file):
        with open(metadata_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def enregistrer_metadata(metadatas):
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadatas, f, indent=2, ensure_ascii=False)

def ajouter_metadata():
    print("\n📝 Ajouter une fiche scène manuellement")
    print("💡 Exemple chemin : Angela White/Babes - Angela.mp4")
    chemin = input("Chemin relatif vers la vidéo : ").strip()

    print("💡 Exemple titre : Angela & Cherry dans Babes")
    titre = input("Titre de la vidéo : ").strip()

    print("💡 Exemple actrices : Reagan Foxx")
    actrices = input("Actrice(s) principale(s) (séparées par virgule) : ").strip().split(",")

    print("💡 Exemple acteurs : Lucas Frost")
    acteurs = input("Acteur(s) (séparés par virgule) : ").strip().split(",")

    print("💡 Exemple site : My Sister's Hot Friend")
    site = input("Nom du site / collection : ").strip()

    print("💡 Exemple studio : Naughty America")
    studio = input("Nom du studio : ").strip()

    print("💡 Exemple : Une MILF vient calmer les envies d’un jeune gars impatient...")
    synopsis = input("Synopsis : ").strip()

    print("💡 Exemple : milf, blowjob, facial, doggystyle")
    tags = input("Tags (séparés par virgule, en minuscule) : ").strip().lower().split(",")

    print("💡 Exemple : 23 (en minutes)")
    try:
        duree = int(input("Durée (en minutes) : ").strip())
    except ValueError:
        duree = None

    print("💡 Exemple qualité : 4K / 1080p / 720p")
    qualite = input("Qualité : ").strip()

    print("💡 Exemple note : ⭐️⭐️⭐️⭐️ - très excitante")
    note = input("Note personnelle : ").strip()

    date_vue = str(date.today())  # 📅 date du jour automatique

    fiche = {
        "chemin": chemin,
        "titre": titre,
        "actrices": [a.strip() for a in actrices if a.strip()],
        "acteurs": [a.strip() for a in acteurs if a.strip()],
        "site": site,
        "studio": studio,
        "synopsis": synopsis,
        "tags": [t.strip() for t in tags],
        "duree": duree,
        "qualite": qualite,
        "note_perso": note,
        "date_vue": date_vue
    }

    metadatas = charger_metadata()
    metadatas.append(fiche)
    enregistrer_metadata(metadatas)

    print("✅ Fiche ajoutée à scenes_metadata.json ✅")


def ajouter_ou_mettre_a_jour_note(chemin_video):
    metadatas = charger_metadata()

    # Cherche la fiche existante
    fiche = next((f for f in metadatas if f["chemin"] == chemin_video), None)

    if fiche:
        print("📝 Veux-tu mettre à jour la note personnelle de cette scène ? (o/n) : ", end="")
        if input().strip().lower() == "o":
            note = input("💬 Entre ta note perso (ex : ⭐️⭐️⭐️⭐️ - intense) : ").strip()
            fiche["note_perso"] = note
            enregistrer_metadata(metadatas)
            print("✅ Note mise à jour.")
    else:
        print("⚠️ Aucun metadata trouvé pour cette scène.")
        print("Souhaites-tu créer une fiche minimale avec juste la note ? (o/n) : ", end="")
        if input().strip().lower() == "o":
            titre = input("🎬 Donne un titre à cette scène : ").strip()
            note = input("💬 Ta note perso : ").strip()
            nouvelle_fiche = {
                "chemin": chemin_video,
                "titre": titre,
                "actrices": [],
                "acteurs": [],
                "site": "",
                "studio": "",
                "synopsis": "",
                "tags": [],
                "duree": None,
                "qualite": "",
                "note_perso": note,
                "date_vue": str(date.today())
            }
            metadatas.append(nouvelle_fiche)
            enregistrer_metadata(metadatas)
            print("✅ Fiche créée avec ta note.")


def afficher_fiche_scene(chemin_video):
    metadatas = charger_metadata()
    fiche = next((f for f in metadatas if f["chemin"] == chemin_video), None)

    if not fiche:
        print("ℹ️ Aucune fiche enrichie trouvée pour cette vidéo.")
        return

    print("\n📄 FICHE SCÈNE")
    print("────────────────────────────────────────────")
    print(f"🎬 Titre      : {fiche.get('titre', 'Inconnu')}")
    print(f"🎭 Acteurs    : {', '.join(fiche.get('actrices', []) + fiche.get('acteurs', []))}")
    print(f"🏷️  Tags       : {', '.join(fiche.get('tags', []))}")
    print(f"📺 Qualité    : {fiche.get('qualite', '—')} - Durée : {fiche.get('duree', '—')} min")
    print(f"🌐 Site       : {fiche.get('site', '—')} | Studio : {fiche.get('studio', '—')}")
    print(f"📅 Vue le     : {fiche.get('date_vue', '—')}")
    print(f"⭐ Note perso : {fiche.get('note_perso', '—')}")
    print("📖 Synopsis   :")
    print(fiche.get("synopsis", "—"))
    print("────────────────────────────────────────────\n")


def rechercher_scene():
    metadatas = charger_metadata()
    if not metadatas:
        print("❌ Aucune fiche dans scenes_metadata.json")
        return

    mot_cle = input("\n🔍 Entre un mot-clé à rechercher (actrices, tag, site...) : ").strip().lower()
    resultats = []

    for fiche in metadatas:
        texte_total = " ".join([
            fiche.get("titre", ""),
            " ".join(fiche.get("actrices", []) + fiche.get("acteurs", [])),
            fiche.get("site", ""),
            fiche.get("studio", ""),
            fiche.get("note_perso", ""),
            " ".join(fiche.get("tags", []))
        ]).lower()

        if mot_cle in texte_total:
            resultats.append(fiche)

    if not resultats:
        print(f"🔍 Aucun résultat trouvé pour : {mot_cle}")
        return

    print(f"\n🔎 {len(resultats)} résultat(s) pour : {mot_cle}")
    print("────────────────────────────────────────────")
    for i, fiche in enumerate(resultats, 1):
        print(f"{i}. 🎬 {fiche.get('titre', 'Sans titre')}")
        print(f"   📁 {fiche.get('chemin', '')}")
        print(f"   👥 {', '.join(fiche.get('actrices', []) + fiche.get('acteurs', []))} | 🏷️  {', '.join(fiche.get('tags', []))}")
        print(f"   🌐 {fiche.get('site', '')} | ⭐ {fiche.get('note_perso', '')}")
        print("────────────────────────────────────────────")

    # Interaction
    try:
        choix = int(input("\n📌 Veux-tu afficher une fiche ? (entre le numéro ou 0 pour annuler) : ").strip())
        if choix == 0:
            return
        fiche = resultats[choix - 1]
        print("\n📄 Détail complet de la scène :")
        print("────────────────────────────────────────────")
        print(f"🎬 Titre      : {fiche.get('titre', 'Inconnu')}")
        print(f"🎭 Acteurs    : {', '.join(fiche.get('actrices', []) + fiche.get('acteurs', []))}")
        print(f"🏷️  Tags       : {', '.join(fiche.get('tags', []))}")
        print(f"📺 Qualité    : {fiche.get('qualite', '—')} - Durée : {fiche.get('duree', '—')} min")
        print(f"🌐 Site       : {fiche.get('site', '—')} | Studio : {fiche.get('studio', '—')}")
        print(f"📅 Vue le     : {fiche.get('date_vue', '—')}")
        print(f"⭐ Note perso : {fiche.get('note_perso', '—')}")
        print("📖 Synopsis   :")
        print(fiche.get("synopsis", "—"))
        print("────────────────────────────────────────────\n")

        lancer = input("🎬 Veux-tu lancer cette vidéo ? (o/n) : ").strip().lower()
        if lancer == "o":
            chemin_complet = os.path.join(racine, fiche["chemin"])
            subprocess.run(["open", chemin_complet])

            # === TRAITEMENT COMME DANS proposer_scene() ===
            # Charger historique et favoris
            history = charger_liste(history_file)
            favorites = charger_liste(favorites_file)

            # Ajout à historique
            reponse = input("As-tu vraiment regardé cette vidéo ? (o/n) : ").strip().lower()
            if reponse == "o" and fiche["chemin"] not in history:
                history.append(fiche["chemin"])
                enregistrer_liste(history_file, history)
                print("✅ Vidéo ajoutée à l’historique.")
            else:
                print("❌ Non ajoutée à l’historique.")

            # Ajout aux favoris
            reponse_fav = input("Veux-tu ajouter cette vidéo aux favoris ? (o/n) : ").strip().lower()
            if reponse_fav == "o":
                if fiche["chemin"] not in favorites:
                    favorites.append(fiche["chemin"])
                    enregistrer_liste(favorites_file, favorites)
                    print("⭐ Vidéo ajoutée aux favoris.")
                else:
                    print("⚠️ Déjà présente dans les favoris.")

            # Note personnelle
            noter = input("📝 Veux-tu ajouter une note personnelle ? (o/n) : ").strip().lower()
            if noter == "o":
                ajouter_ou_mettre_a_jour_note(fiche["chemin"])

    except (ValueError, IndexError):
        print("❌ Entrée invalide.")

def afficher_statistiques():
    metadatas = charger_metadata()
    history = charger_liste(history_file)

    if not metadatas:
        print("❌ Aucune fiche de scène trouvée.")
        return

    total = len(metadatas)
    vues = [fiche for fiche in metadatas if fiche["chemin"] in history]
    nb_vues = len(vues)

    notes = [fiche["note_perso"] for fiche in metadatas if fiche.get("note_perso")]
    nb_notes = len(notes)

    # Calcul moyenne de notes (si ⭐️⭐️⭐️⭐️ - etc.)
    total_etoiles = 0
    for note in notes:
        stars = note.count("⭐")
        total_etoiles += stars
    moyenne = round(total_etoiles / nb_notes, 2) if nb_notes > 0 else 0

    # Actrice la plus fréquente
    compteur_actrices = {}
    for fiche in metadatas:
        for actrice in fiche.get("actrices", []):
            compteur_actrices[actrice] = compteur_actrices.get(actrice, 0) + 1

    top_3 = sorted(compteur_actrices.items(), key=lambda x: x[1], reverse=True)[:3]

    # Durée totale des vues
    total_minutes = sum(fiche.get("duree", 0) for fiche in vues if fiche.get("duree"))
    heures = total_minutes // 60
    minutes = total_minutes % 60

    print("\n📊 STATISTIQUES INTYMA")
    print("────────────────────────────────────────────")
    print(f"🎞️  Total de scènes enregistrées : {total}")
    print(f"👁️  Scènes visionnées           : {nb_vues}")
    print(f"📝 Fiches avec une note perso    : {nb_notes}")
    print(f"⭐ Note moyenne                  : {moyenne}/5")
    print(f"⏱️  Durée totale regardée        : {heures}h {minutes}min")
    print(f"🔥 Top 3 actrices fréquentes     :")
    for actrice, count in top_3:
        print(f"   - {actrice} ({count} scène{'s' if count > 1 else ''})")
    print("────────────────────────────────────────────\n")

def mode_humeur():
    metadatas = charger_metadata()
    if not metadatas:
        print("❌ Aucune fiche de scène trouvée.")
        return

    print("\n💫 MODE HUMEUR — Dis-moi ce que tu veux aujourd’hui 😏")

    tags_input = input("🏷️  Tags (séparés par virgule, ex: milf, blowjob) : ").strip().lower()
    actrice_input = input("👩 Actrice spécifique (ou vide pour ignorer) : ").strip().lower()
    note_min = input("⭐ Note minimum ? (de 1 à 5, ou vide pour ignorer) : ").strip()

    tags_recherches = [t.strip() for t in tags_input.split(",") if t.strip()]
    note_minimum = int(note_min) if note_min.isdigit() else None

    candidats = []

    for fiche in metadatas:
        # Filtre tags
        fiche_tags = [t.lower() for t in fiche.get("tags", [])]
        if not all(tag in fiche_tags for tag in tags_recherches):
            continue

        # Filtre actrice
        if actrice_input:
            if not any(actrice_input in a.lower() for a in fiche.get("acteurs", [])):
                continue

        # Filtre note perso
        if note_minimum:
            note = fiche.get("note_perso", "")
            if note.count("⭐") < note_minimum:
                continue

        candidats.append(fiche)

    if not candidats:
        print("❌ Aucun résultat trouvé avec ces critères.")
        return

    fiche = random.choice(candidats)

    print("\n🎯 Scène trouvée pour ton humeur :")
    print("────────────────────────────────────────────")
    print(f"🎬 {fiche.get('titre', 'Sans titre')}")
    print(f"📁 {fiche.get('chemin', '')}")
    print(f"👥 {', '.join(fiche.get('acteurs', []))}")
    print(f"🏷️  {', '.join(fiche.get('tags', []))}")
    print(f"📺 {fiche.get('qualite', '')} - {fiche.get('duree', '—')} min")
    print(f"⭐ {fiche.get('note_perso', '—')}")
    print(f"🌐 {fiche.get('site', '')} | {fiche.get('studio', '')}")
    print("📖", fiche.get("synopsis", "—"))
    print("────────────────────────────────────────────")

    lancer = input("🎬 Veux-tu lancer cette scène ? (o/n) : ").strip().lower()
    if lancer == "o":
        chemin_complet = os.path.join(racine, fiche["chemin"])
        subprocess.run(["open", chemin_complet])

        # Suivi post-visionnage
        history = charger_liste(history_file)
        favorites = charger_liste(favorites_file)

        reponse = input("As-tu vraiment regardé cette vidéo ? (o/n) : ").strip().lower()
        if reponse == "o" and fiche["chemin"] not in history:
            history.append(fiche["chemin"])
            enregistrer_liste(history_file, history)
            print("✅ Vidéo ajoutée à l’historique.")

        reponse_fav = input("Veux-tu ajouter cette vidéo aux favoris ? (o/n) : ").strip().lower()
        if reponse_fav == "o":
            if fiche["chemin"] not in favorites:
                favorites.append(fiche["chemin"])
                enregistrer_liste(favorites_file, favorites)
                print("⭐ Vidéo ajoutée aux favoris.")

        noter = input("📝 Veux-tu ajouter une note perso ? (o/n) : ").strip().lower()
        if noter == "o":
            ajouter_ou_mettre_a_jour_note(fiche["chemin"])


def voir_fiche_actrice():
    if not os.path.exists("actrices.json"):
        print("❌ Fichier actrices.json introuvable. Génère-le d’abord.")
        return

    with open("actrices.json", "r", encoding="utf-8") as f:
        actrices = json.load(f)

    nom_recherche = input("🔍 Entre le nom de l’actrice à afficher : ").strip().lower()

    fiche = next((a for a in actrices if a["nom"].lower() == nom_recherche), None)

    if not fiche:
        print("❌ Actrice non trouvée.")
        return

    print(f"\n🎭 Actrice : {fiche['nom']}")
    print(f"📸 Photo      : {fiche.get('photo', '(non définie)')}")
    print(f"🎞️  Scènes    : {fiche['nombre_de_scenes']}")
    print(f"⭐ Moyenne    : {fiche.get('note_moyenne', '—')} / 5")
    print(f"📅 Vue le     : {fiche.get('derniere_vue', '—')}")
    print(f"🏷️  Tags       : {', '.join(fiche.get('tags_typiques', []))}")
    print(f"💬 Commentaire : {fiche.get('commentaire', '—')}\n")

    voir_scenes = input("👁️ Voir les scènes associées ? (o/n) : ").strip().lower()
    if voir_scenes == "o":
        metadatas = charger_metadata()
        scenes = [s for s in metadatas if fiche["nom"] in s.get("actrices", [])]

        if not scenes:
            print("❌ Aucune scène trouvée dans ta base.")
            return

        print(f"\n🎬 Scènes avec {fiche['nom']}")
        print("────────────────────────────────────────────")
        for i, scene in enumerate(scenes, 1):
            print(f"{i}. 🎬 {scene.get('titre', 'Sans titre')}")
            print(f"   📁 {scene.get('chemin', '')}")
            print(f"   ⭐ {scene.get('note_perso', '')}")
        print("────────────────────────────────────────────\n")

    ouvrir = input("🖼️ Ouvrir la photo ? (o/n) : ").strip().lower()
    if ouvrir == "o":
        photo = fiche.get("photo", "")
        if photo.startswith("http"):
            print("🌐 C’est une URL — ouverture non supportée directement.")
        elif os.path.exists(photo):
            ascii = input("👁️ Voir l’aperçu ASCII ? (o/n) : ").strip().lower()
            if ascii == "o":
                afficher_ascii_image(photo)
            subprocess.run(["open", photo])
        else:
            print("❌ Fichier introuvable :", photo)


def modifier_fiche_actrice():
    actrices_file = "actrices.json"
    dossier_images = "images"

    if not os.path.exists(actrices_file):
        print("❌ Fichier actrices.json introuvable.")
        return

    with open(actrices_file, "r", encoding="utf-8") as f:
        actrices = json.load(f)

    nom = input("🎭 Nom de l’actrice à modifier : ").strip().lower()
    index = next((i for i, a in enumerate(actrices) if a["nom"].lower() == nom), None)

    if index is None:
        print("❌ Actrice non trouvée.")
        return

    actrice = actrices[index]

    print(f"\n🎭 Modification de : {actrice['nom']}")
    print("(Appuie sur Entrée pour conserver l’actuelle valeur)\n")

    nouveau_nom = input(f"🔤 Nom [{actrice['nom']}] : ").strip()
    if nouveau_nom:
        actrice["nom"] = nouveau_nom

    tags = input(f"🏷️ Tags typiques (actuels : {', '.join(actrice.get('tags_typiques', []))}) : ").strip()
    if tags:
        actrice["tags_typiques"] = [t.strip() for t in tags.split(",") if t.strip()]

    commentaire = input(f"💬 Commentaire [{actrice.get('commentaire', '')}] : ").strip()
    if commentaire:
        actrice["commentaire"] = commentaire

    chemin_photo = input("🖼️ Nouveau chemin photo (ou vide pour ne pas changer) : ").strip()
    if chemin_photo:
        if chemin_photo.startswith("http"):
            actrice["photo"] = chemin_photo
        elif os.path.exists(chemin_photo):
            if not os.path.exists(dossier_images):
                os.makedirs(dossier_images)
            ext = os.path.splitext(chemin_photo)[1]
            nom_fichier = actrice["nom"].replace(" ", "_").lower() + ext
            destination = os.path.join(dossier_images, nom_fichier)
            try:
                with open(chemin_photo, "rb") as src, open(destination, "wb") as dst:
                    dst.write(src.read())
                actrice["photo"] = destination
                print(f"✅ Image copiée dans {destination}")
            except Exception as e:
                print("❌ Erreur lors de la copie :", e)
        else:
            print("❌ Fichier image introuvable.")

    actrices[index] = actrice

    with open(actrices_file, "w", encoding="utf-8") as f:
        json.dump(actrices, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Fiche mise à jour pour {actrice['nom']}")



from PIL import Image

def afficher_ascii_image(path):
    try:
        img = Image.open(path).convert("L")
        img = img.resize((60, 30))  # Taille adaptée au terminal
        pixels = img.getdata()
        chars = "@%#*+=-:. "  # Du plus sombre au plus clair
        ascii_str = "".join(chars[pixel // 25] for pixel in pixels)
        ascii_lines = [ascii_str[i:i+60] for i in range(0, len(ascii_str), 60)]
        print("\n🎨 Aperçu ASCII :\n")
        for line in ascii_lines:
            print(line)
    except Exception as e:
        print("❌ Impossible d’afficher l’image en ASCII :", e)


# === MENU PRINCIPAL ===
def menu():
    history = charger_liste(history_file)
    favorites = charger_liste(favorites_file)

    while True:
        print("\n=== Intyma — Menu Principal ===")
        print("1. 🎲 Proposer une scène du jour")
        print("2. 📜 Voir l’historique")
        print("3. ⭐ Voir les favoris")
        print("4. 🗑 Réinitialiser l’historique")
        print("5. 💔 Réinitialiser les favoris")
        print("6. ❌ Quitter")
        print("7. 📝 Ajouter une fiche scène manuellement")
        print("8. 🔍 Rechercher une scène par mot-clé")
        print("9. 📊 Voir mes statistiques")
        print("10. 💫 Mode Humeur (scène selon ton envie)")
        print("11. 🎭 Voir les fiches actrices")
        print("12. 📝 Modifier une fiche actrice complète")
        choix = input("Ton choix (1-12) : ").strip()

        if choix == "1":
            history, favorites = proposer_scene(history, favorites)
        elif choix == "2":
            afficher_liste("Historique", history)
        elif choix == "3":
            afficher_liste("Favoris", favorites)
        elif choix == "4":
            confirm = input("❗ Tu es sûr ? Réinitialiser l’historique ? (o/n) : ").strip().lower()
            if confirm == "o":
                history = []
                enregistrer_liste(history_file, history)
                print("🗑 Historique réinitialisé.")
        elif choix == "5":
            confirm = input("❗ Tu es sûr ? Réinitialiser les favoris ? (o/n) : ").strip().lower()
            if confirm == "o":
                favorites = []
                enregistrer_liste(favorites_file, favorites)
                print("💔 Favoris réinitialisés.")
        elif choix == "6":
            print("👋 À bientôt dans Intyma.")
            break
        elif choix == "7":
            ajouter_metadata()
        elif choix == "8":
            rechercher_scene()
        elif choix == "9":
            afficher_statistiques()
        elif choix == "10":
            mode_humeur()
        elif choix == "11":
            voir_fiche_actrice()
        elif choix == "12":
            modifier_fiche_actrice()
        else:
            print("⛔ Entrée invalide. Choisis entre 1 et 12.")

# === LANCEMENT ===
if __name__ == "__main__":
    verifier_mot_de_passe()
    menu()
