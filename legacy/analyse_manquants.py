import os
import json

# === PARAMÈTRES ===
racine = "/Volumes/My Passport for Mac/Privé/M364TR0N/"
extensions_vidéo = ('.mp4', '.avi', '.mkv')
metadata_file = "scenes_metadata.json"
actrices_file = "actrices.json"


def lister_videos():
    chemins = []
    for dossier_actuel, sous_dossiers, fichiers in os.walk(racine):
        for fichier in fichiers:
            if fichier.lower().endswith(extensions_vidéo):
                chemin_complet = os.path.join(dossier_actuel, fichier)
                chemin_relatif = os.path.relpath(chemin_complet, racine)
                chemins.append(chemin_relatif)
    return chemins

def charger_json(path):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def lister_actrices_dossiers():
    # On prend tous les répertoires directement dans le dossier racine
    return [nom for nom in os.listdir(racine) if os.path.isdir(os.path.join(racine, nom))]

def lister_actrices_json(actrices):
    return [a["nom"] for a in actrices]


# === ANALYSE ===
print("📊 ANALYSE DES FICHES MANQUANTES\n")

# 1. Vidéos
videos = lister_videos()
metadata = charger_json(metadata_file)
fiches_existantes = [fiche["chemin"] for fiche in metadata]

manquantes = [v for v in videos if v not in fiches_existantes]

print(f"🎞️ Total vidéos détectées     : {len(videos)}")
print(f"📄 Fiches scènes existantes   : {len(fiches_existantes)}")
print(f"📝 Scènes à enrichir          : {len(manquantes)}\n")

# 2. Actrices
dossiers = lister_actrices_dossiers()
actrices = charger_json(actrices_file)
noms_fichés = lister_actrices_json(actrices)

manquantes_actrices = [nom for nom in dossiers if nom not in noms_fichés]

print(f"🎭 Total actrices (dossiers)  : {len(dossiers)}")
print(f"📋 Fiches actrices existantes : {len(noms_fichés)}")
print(f"🧑‍🎤 Actrices à enrichir       : {len(manquantes_actrices)}")

# Optionnel : liste des manquantes
if manquantes:
    print("\n📝 Scènes manquantes (extraits) :")
    for v in manquantes[:5]:
        print(" -", v)
    if len(manquantes) > 5:
        print(f"... +{len(manquantes) - 5} autres")

if manquantes_actrices:
    print("\n🧑‍🎤 Actrices manquantes :")
    print(", ".join(manquantes_actrices))
