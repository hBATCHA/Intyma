
import json
import os

metadata_file = "scenes_metadata.json"
actrices_file = "actrices.json"

def charger_metadata():
    if not os.path.exists(metadata_file):
        return []
    with open(metadata_file, "r", encoding="utf-8") as f:
        return json.load(f)

def charger_actrices_existantes():
    if not os.path.exists(actrices_file):
        return {}
    with open(actrices_file, "r", encoding="utf-8") as f:
        fiches = json.load(f)
        return {fiche["nom"]: fiche for fiche in fiches}


def calculer_actrices(metadatas):
    actrices_dict = {}
    anciennes_fiches = charger_actrices_existantes()

    for scene in metadatas:
        actrices = scene.get("actrices", [])
        note = scene.get("note_perso", "")
        date_vue = scene.get("date_vue", None)
        tags = scene.get("tags", [])

        for nom in actrices:
            nom = nom.strip()

            # Récupère ancienne fiche si elle existe
            ancienne = anciennes_fiches.get(nom, {})

            if nom not in actrices_dict:
                actrices_dict[nom] = {
                    "nom": nom,
                    "nombre_de_scenes": 0,
                    "note_totale": 0,
                    "nb_notes": 0,
                    "derniere_vue": date_vue,
                    "tags_typiques": [],
                    "commentaire": ancienne.get("commentaire", ""),
                    "photo": ancienne.get("photo", "")
                }

            actrices_dict[nom]["nombre_de_scenes"] += 1

            etoiles = note.count("⭐")
            if etoiles > 0:
                actrices_dict[nom]["note_totale"] += etoiles
                actrices_dict[nom]["nb_notes"] += 1

            actuelle = actrices_dict[nom]["derniere_vue"]
            if date_vue and (actuelle is None or date_vue > actuelle):
                actrices_dict[nom]["derniere_vue"] = date_vue

            actrices_dict[nom]["tags_typiques"].extend(tags)

    fiches = []
    for nom, data in actrices_dict.items():
        moyenne = round(data["note_totale"] / data["nb_notes"], 2) if data["nb_notes"] > 0 else None
        tags_uniques = list(sorted(set(data["tags_typiques"])))
        fiches.append({
            "nom": nom,
            "nombre_de_scenes": data["nombre_de_scenes"],
            "note_moyenne": moyenne,
            "derniere_vue": data["derniere_vue"],
            "tags_typiques": tags_uniques,
            "commentaire": data["commentaire"],
            "photo": data["photo"]
        })

    return fiches


def enregistrer_actrices(fiches):
    with open(actrices_file, "w", encoding="utf-8") as f:
        json.dump(fiches, f, indent=2, ensure_ascii=False)

def main():
    metadatas = charger_metadata()
    fiches = calculer_actrices(metadatas)
    enregistrer_actrices(fiches)
    print(f"✅ {len(fiches)} fiches actrices générées dans {actrices_file}")

if __name__ == "__main__":
    main()
