#!/usr/bin/env python3
"""
Script de migration pour ajouter le système de comptage des vues
Exécuter avec: python migration_views.py
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import History
from sqlalchemy import text
from datetime import datetime

def migrate_history_views():
    """Ajoute les nouvelles colonnes et migre les données existantes"""

    with app.app_context():
        try:
            print("🔄 Début de la migration du système de vues...")

            # Vérifier la structure actuelle
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('history')]
            print(f"📋 Colonnes actuelles: {columns}")

            # Vérifier si les nouvelles colonnes existent déjà
            needs_migration = 'nb_vues' not in columns

            if needs_migration:
                print("➕ Ajout des nouvelles colonnes...")

                # Utiliser une connexion pour exécuter les requêtes
                with db.engine.connect() as connection:
                    # Ajouter les colonnes une par une pour éviter les erreurs
                    try:
                        connection.execute(text("ALTER TABLE history ADD COLUMN nb_vues INTEGER DEFAULT 1"))
                        connection.commit()
                        print("   ✅ Colonne 'nb_vues' ajoutée")
                    except Exception as e:
                        print(f"   ⚠️ nb_vues: {e}")

                    try:
                        connection.execute(text("ALTER TABLE history ADD COLUMN date_premiere_vue DATE"))
                        connection.commit()
                        print("   ✅ Colonne 'date_premiere_vue' ajoutée")
                    except Exception as e:
                        print(f"   ⚠️ date_premiere_vue: {e}")

                    try:
                        connection.execute(text("ALTER TABLE history ADD COLUMN derniere_vue DATE"))
                        connection.commit()
                        print("   ✅ Colonne 'derniere_vue' ajoutée")
                    except Exception as e:
                        print(f"   ⚠️ derniere_vue: {e}")

                    # Mettre à jour les données existantes
                    print("📊 Migration des données existantes...")

                    # Compter les entrées existantes
                    result = connection.execute(text("SELECT COUNT(*) FROM history"))
                    existing_count = result.scalar()
                    print(f"   📈 {existing_count} entrée(s) d'historique à migrer")

                    if existing_count > 0:
                        # Mettre à jour toutes les entrées existantes
                        connection.execute(text("""
                            UPDATE history SET
                                               nb_vues           = 1,
                                               date_premiere_vue = date_vue,
                                               derniere_vue      = date_vue
                            WHERE nb_vues IS NULL OR nb_vues = 0
                        """))
                        connection.commit()
                        print("   ✅ Données existantes migrées (toutes initialisées à 1 vue)")

                    print("🎉 Migration terminée avec succès!")

                    # Vérification finale
                    print("\n🔍 Vérification post-migration:")
                    result = connection.execute(text("""
                        SELECT scene_id, nb_vues, date_premiere_vue, derniere_vue 
                        FROM history 
                        LIMIT 3
                    """))

                    rows = result.fetchall()
                    for row in rows:
                        print(f"   📊 Scène {row[0]}: {row[1]} vue(s), première: {row[2]}, dernière: {row[3]}")

            else:
                print("✅ Les colonnes existent déjà, migration non nécessaire.")

        except Exception as e:
            print(f"❌ Erreur lors de la migration: {e}")
            print("💡 Conseil: Vérifiez que l'application Flask n'est pas en cours d'exécution")
            return False

    return True

if __name__ == "__main__":
    print("🚀 Migration du système de comptage des vues")
    print("=" * 50)

    success = migrate_history_views()

    if success:
        print("\n✅ Migration réussie!")
        print("🔥 Vous pouvez maintenant redémarrer votre application Flask")
        print("📊 Le système de comptage des vues est maintenant actif!")
    else:
        print("\n❌ Migration échouée")
        print("🔧 Vérifiez les erreurs ci-dessus et réessayez")