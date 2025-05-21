import sys
import os
import json
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                               QPushButton, QLabel, QLineEdit, QListWidget, QFrame,
                               QStackedWidget, QMessageBox, QFileDialog, QTabWidget,
                               QGridLayout, QScrollArea, QSplitter, QDialog, QTextEdit, QComboBox, QSpacerItem,
                               QCheckBox)
from PySide6.QtCore import Qt, QSize
from PySide6.QtGui import QIcon, QPixmap, QFont, QColor, QAction

# Constantes de l'application (vous pourrez les déplacer dans un fichier de configuration)
RACINE = "/Volumes/My Passport for Mac/Privé/M364TR0N/"
HISTORY_FILE = "history.json"
FAVORITES_FILE = "favorites.json"
METADATA_FILE = "scenes_metadata.json"
ACTRICES_FILE = "actrices.json"
MOT_DE_PASSE = "intyma2025"


class IntymaApp(QMainWindow):

    # === 1. INITIALISATION ET CONFIGURATION ===
    def __init__(self):
        super().__init__()

        # Configuration de la fenêtre principale
        self.setWindowTitle("Intyma")
        self.setMinimumSize(1280, 800)

        # Créer la barre de menu
        self.create_menu_bar()

        # Chargement des données
        self.load_data()

        # Configuration de l'UI
        self.setup_ui()

        # Écran de connexion
        self.show_login_screen()

    def load_data(self):
        """Charge toutes les données nécessaires à l'application"""
        self.history = self.load_json(HISTORY_FILE, [])
        self.favorites = self.load_json(FAVORITES_FILE, [])
        self.metadata = self.load_json(METADATA_FILE, [])
        self.actrices = self.load_json(ACTRICES_FILE, [])

    def load_json(self, filename, default=None):
        """Charge un fichier JSON ou retourne la valeur par défaut"""
        if default is None:
            default = []

        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                QMessageBox.warning(self, "Erreur de chargement",
                                    f"Impossible de charger {filename}: {str(e)}")
                return default
        return default

    def save_json(self, filename, data):
        """Enregistre des données dans un fichier JSON"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            QMessageBox.warning(self, "Erreur d'enregistrement",
                                f"Impossible d'enregistrer {filename}: {str(e)}")
            return False

    def setup_ui(self):
        """Initialise l'interface utilisateur principale"""
        # Widget central qui contiendra tous les écrans
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        # Layout principal
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)

        # Widget empilé pour gérer différents écrans
        self.stacked_widget = QStackedWidget()
        self.main_layout.addWidget(self.stacked_widget)

        # Création des différents écrans
        self.create_login_screen()
        self.create_main_screen()

    def create_menu_bar(self):
        """Crée la barre de menu de l'application"""
        menu_bar = self.menuBar()

        # Style du menu
        menu_bar.setStyleSheet("""
            QMenuBar {
                background-color: #161626;
                color: #e6e6e6;
            }
            QMenuBar::item {
                background-color: transparent;
                padding: 8px 12px;
            }
            QMenuBar::item:selected {
                background-color: #252540;
            }
            QMenu {
                background-color: #252540;
                color: #e6e6e6;
                border: 1px solid #333355;
            }
            QMenu::item {
                padding: 8px 20px;
            }
            QMenu::item:selected {
                background-color: #353570;
            }
        """)

        # Menu Fichier
        file_menu = menu_bar.addMenu("Fichier")

        # Actions du menu Fichier
        refresh_action = QAction("Actualiser les données", self)
        refresh_action.triggered.connect(self.load_data)
        file_menu.addAction(refresh_action)

        file_menu.addSeparator()

        exit_action = QAction("Quitter", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # Menu Outils
        tools_menu = menu_bar.addMenu("Outils")

        # Actions du menu Outils
        generate_actresses_action = QAction("Générer les fiches actrices", self)
        generate_actresses_action.triggered.connect(self.generate_actresses_data)
        tools_menu.addAction(generate_actresses_action)

        clear_history_action = QAction("Réinitialiser l'historique", self)
        clear_history_action.triggered.connect(self.clear_history)
        tools_menu.addAction(clear_history_action)

        clear_favorites_action = QAction("Réinitialiser les favoris", self)
        clear_favorites_action.triggered.connect(self.clear_favorites)
        tools_menu.addAction(clear_favorites_action)

        # Menu Aide
        help_menu = menu_bar.addMenu("Aide")

        about_action = QAction("À propos", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    # === 2. CRÉATION DES ÉCRANS PRINCIPAUX ===
    def create_login_screen(self):
        """Crée l'écran de connexion"""
        login_widget = QWidget()
        login_layout = QVBoxLayout(login_widget)

        # Style pour l'écran de connexion
        login_widget.setStyleSheet("""
            QWidget {
                background-color: #1a1a2e;
                color: #e6e6e6;
            }
            QLineEdit {
                padding: 12px;
                border-radius: 6px;
                background-color: #252540;
                color: white;
                font-size: 14px;
                border: 1px solid #333355;
            }
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 6px;
                padding: 12px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)

        # Ajouter de l'espace au sommet
        login_layout.addStretch(1)

        # Logo / Titre
        title = QLabel("INTYMA")
        title.setStyleSheet("font-size: 48px; font-weight: bold; color: #ff9d00; margin: 30px;")
        title.setAlignment(Qt.AlignCenter)
        login_layout.addWidget(title)

        subtitle = QLabel("Votre collection intime")
        subtitle.setStyleSheet("font-size: 18px; color: #a0a0a0; margin-bottom: 50px;")
        subtitle.setAlignment(Qt.AlignCenter)
        login_layout.addWidget(subtitle)

        # Mot de passe
        password_container = QWidget()
        password_layout = QHBoxLayout(password_container)
        password_layout.setContentsMargins(250, 0, 250, 0)  # Marges pour centrer

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Entrez votre mot de passe")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.returnPressed.connect(self.verify_password)
        password_layout.addWidget(self.password_input)

        login_layout.addWidget(password_container)

        # Bouton de connexion
        button_container = QWidget()
        button_layout = QHBoxLayout(button_container)
        button_layout.setContentsMargins(350, 20, 350, 0)

        login_button = QPushButton("Accéder")
        login_button.clicked.connect(self.verify_password)
        button_layout.addWidget(login_button)

        login_layout.addWidget(button_container)

        # Ajouter de l'espace au bas
        login_layout.addStretch(1)

        # Ajouter à l'empileur
        self.stacked_widget.addWidget(login_widget)
        self.login_screen = login_widget

    def create_main_screen(self):
        """Crée l'écran principal de l'application"""
        main_widget = QWidget()
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Style pour l'écran principal
        main_widget.setStyleSheet("""
            QWidget {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
            }
        """)

        # Barre latérale
        self.sidebar = self.create_sidebar()
        main_layout.addWidget(self.sidebar, 1)

        # Zone de contenu principal
        self.content_area = QStackedWidget()
        main_layout.addWidget(self.content_area, 5)

        # Créer les différentes pages de contenu
        self.create_home_page()
        self.create_discover_page()
        self.create_favorites_page()
        self.create_search_page()
        self.create_actress_page()
        self.create_stats_page()

        # Ajouter à l'empileur
        self.stacked_widget.addWidget(main_widget)
        self.main_screen = main_widget

    def create_sidebar(self):
        """Crée la barre latérale avec navigation"""
        sidebar = QWidget()
        sidebar.setStyleSheet("""
            QWidget {
                background-color: #161626;
            }
            QPushButton {
                background-color: transparent;
                color: #e6e6e6;
                text-align: left;
                padding: 15px;
                border: none;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #252540;
                border-left: 3px solid #ff9d00;
            }
            QLabel {
                color: #e6e6e6;
            }
        """)

        # Fixer la largeur
        sidebar.setFixedWidth(200)

        layout = QVBoxLayout(sidebar)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Logo/Titre
        title_container = QWidget()
        title_container.setStyleSheet("background-color: #111120; padding: 20px 0;")
        title_layout = QVBoxLayout(title_container)

        title = QLabel("INTYMA")
        title.setStyleSheet("font-size: 24px; font-weight: bold; color: #ff9d00;")
        title.setAlignment(Qt.AlignCenter)
        title_layout.addWidget(title)

        layout.addWidget(title_container)

        # Navigation
        nav_buttons = [
            ("Accueil", lambda: self.content_area.setCurrentIndex(0)),
            ("Découvrir", lambda: self.content_area.setCurrentIndex(1)),
            ("Favoris", lambda: self.content_area.setCurrentIndex(2)),
            ("Recherche", lambda: self.content_area.setCurrentIndex(3)),
            ("Actrices", lambda: self.content_area.setCurrentIndex(4)),
            ("Statistiques", lambda: self.content_area.setCurrentIndex(5))
        ]

        for text, func in nav_buttons:
            btn = QPushButton(text)
            btn.clicked.connect(func)
            layout.addWidget(btn)

        layout.addStretch()

        # Bouton déconnexion au bas
        logout_btn = QPushButton("Déconnexion")
        logout_btn.setStyleSheet("""
            QPushButton {
                color: #aaaaaa;
                font-size: 14px;
            }
            QPushButton:hover {
                color: #ff9d00;
                background-color: #252540;
            }
        """)
        logout_btn.clicked.connect(self.show_login_screen)
        layout.addWidget(logout_btn)

        return sidebar

    def create_home_page(self):
        """Crée la page d'accueil"""
        home_widget = QWidget()
        layout = QVBoxLayout(home_widget)

        # En-tête
        header = QLabel("Bienvenue sur Intyma")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Statistiques rapides
        stats_widget = QWidget()
        stats_layout = QHBoxLayout(stats_widget)

        # Calculer les statistiques
        total_videos = len(self.metadata)
        videos_vues = len(self.history)
        favoris = len(self.favorites)

        for title, value in [
            ("Collection", str(total_videos)),
            ("Vues", str(videos_vues)),
            ("Favoris", str(favoris))
        ]:
            stat_box = QFrame()
            stat_box.setStyleSheet("""
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 20px;
                margin: 10px;
            """)
            box_layout = QVBoxLayout(stat_box)

            value_label = QLabel(value)
            value_label.setStyleSheet("font-size: 36px; font-weight: bold; color: #ff9d00;")
            value_label.setAlignment(Qt.AlignCenter)

            title_label = QLabel(title)
            title_label.setStyleSheet("font-size: 14px; color: #a0a0a0;")
            title_label.setAlignment(Qt.AlignCenter)

            box_layout.addWidget(value_label)
            box_layout.addWidget(title_label)

            stats_layout.addWidget(stat_box)

        layout.addWidget(stats_widget)

        # Actions rapides
        quick_actions = QWidget()
        actions_layout = QHBoxLayout(quick_actions)

        action_buttons = [
            ("Découvrir", lambda: self.content_area.setCurrentIndex(1)),
            ("Mode Humeur", self.show_mood_mode),
            ("Dernière vidéo", self.play_last_video)
        ]

        for text, func in action_buttons:
            btn = QPushButton(text)
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #6c5ce7;
                    color: white;
                    border-radius: 8px;
                    padding: 15px 20px;
                    font-size: 16px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #a29bfe;
                }
            """)
            btn.clicked.connect(func)
            actions_layout.addWidget(btn)

        layout.addWidget(quick_actions)

        # Dernières vues (si disponibles)
        if self.history:
            recent_label = QLabel("Vues récemment")
            recent_label.setStyleSheet("font-size: 18px; font-weight: bold; margin-top: 30px;")
            layout.addWidget(recent_label)

            recent_container = QWidget()
            recent_layout = QHBoxLayout(recent_container)

            # Prendre les 5 dernières entrées
            recent_history = self.history[-5:]

            for path in reversed(recent_history):
                # Trouver les métadonnées correspondantes
                scene = next((s for s in self.metadata if s.get("chemin") == path), None)

                if scene:
                    scene_widget = QFrame()
                    scene_widget.setStyleSheet("""
                        background-color: #2d2d5a;
                        border-radius: 8px;
                        padding: 10px;
                        margin: 5px;
                    """)
                    scene_widget.setFixedWidth(200)

                    scene_layout = QVBoxLayout(scene_widget)

                    # Image de la vignette (à implémenter)
                    # thumbnail = QLabel()
                    # pixmap = QPixmap("thumbnail_placeholder.jpg")
                    # thumbnail.setPixmap(pixmap.scaled(180, 120, Qt.KeepAspectRatio))
                    # scene_layout.addWidget(thumbnail)

                    # Titre
                    title = QLabel(scene.get("titre", "Sans titre"))
                    title.setStyleSheet("font-weight: bold;")
                    title.setWordWrap(True)
                    scene_layout.addWidget(title)

                    # Actrice principale
                    if scene.get("actrices"):
                        actrice = QLabel(scene["actrices"][0])
                        actrice.setStyleSheet("color: #a0a0a0;")
                        scene_layout.addWidget(actrice)

                    scene_layout.addStretch()

                    recent_layout.addWidget(scene_widget)

            layout.addWidget(recent_container)

        layout.addStretch()

        self.content_area.addWidget(home_widget)

    def create_discover_page(self):
        """Crée la page de découverte"""
        discover_widget = QWidget()
        layout = QVBoxLayout(discover_widget)

        # En-tête
        header = QLabel("Découvrir")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Bouton de découverte aléatoire
        discover_btn = QPushButton("🎲 Proposer une scène aléatoire")
        discover_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 10px;
                padding: 20px;
                font-size: 20px;
                font-weight: bold;
                margin: 20px 100px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        discover_btn.clicked.connect(self.propose_random_scene)
        layout.addWidget(discover_btn)

        # Zone de résultats (vide par défaut)
        self.discover_result = QFrame()
        self.discover_result.setStyleSheet("""
            background-color: #2d2d5a;
            border-radius: 15px;
            padding: 20px;
            margin: 10px 50px;
        """)
        self.discover_result.setVisible(False)
        discover_result_layout = QVBoxLayout(self.discover_result)

        self.scene_title = QLabel()
        self.scene_title.setStyleSheet("font-size: 24px; font-weight: bold;")
        discover_result_layout.addWidget(self.scene_title)

        self.scene_details = QLabel()
        self.scene_details.setStyleSheet("font-size: 16px; margin-top: 10px;")
        self.scene_details.setWordWrap(True)
        discover_result_layout.addWidget(self.scene_details)

        self.scene_synopsis = QLabel()
        self.scene_synopsis.setStyleSheet("font-size: 14px; color: #a0a0a0; margin-top: 20px;")
        self.scene_synopsis.setWordWrap(True)
        discover_result_layout.addWidget(self.scene_synopsis)

        # Boutons d'action pour la scène
        buttons_widget = QWidget()
        buttons_layout = QHBoxLayout(buttons_widget)

        self.play_btn = QPushButton("▶️ Regarder")
        self.play_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border-radius: 5px;
                padding: 10px 20px;
            }
            QPushButton:hover {
                background-color: #66BB6A;
            }
        """)
        self.play_btn.clicked.connect(self.play_current_scene)
        buttons_layout.addWidget(self.play_btn)

        self.favorite_btn = QPushButton("⭐ Ajouter aux favoris")
        self.favorite_btn.setStyleSheet("""
            QPushButton {
                background-color: #FFC107;
                color: white;
                border-radius: 5px;
                padding: 10px 20px;
            }
            QPushButton:hover {
                background-color: #FFCA28;
            }
        """)
        self.favorite_btn.clicked.connect(self.add_to_favorites)
        buttons_layout.addWidget(self.favorite_btn)

        self.note_btn = QPushButton("📝 Ajouter une note")
        self.note_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                border-radius: 5px;
                padding: 10px 20px;
            }
            QPushButton:hover {
                background-color: #42A5F5;
            }
        """)
        self.note_btn.clicked.connect(self.add_note)
        buttons_layout.addWidget(self.note_btn)

        discover_result_layout.addWidget(buttons_widget)
        layout.addWidget(self.discover_result)

        layout.addStretch()

        self.content_area.addWidget(discover_widget)

    def create_favorites_page(self):
        """Crée la page des favoris"""
        favorites_widget = QWidget()
        layout = QVBoxLayout(favorites_widget)

        # En-tête
        header = QLabel("Favoris")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Options de tri
        sort_container = QWidget()
        sort_layout = QHBoxLayout(sort_container)
        sort_layout.setContentsMargins(50, 0, 50, 10)

        sort_label = QLabel("Trier par:")
        sort_label.setStyleSheet("color: #a0a0a0;")
        sort_layout.addWidget(sort_label)

        self.favorites_sort_combo = QComboBox()
        self.favorites_sort_combo.addItems(["Date d'ajout (récent)", "Date d'ajout (ancien)",
                                            "Titre (A-Z)", "Titre (Z-A)",
                                            "Actrice (A-Z)", "Studio (A-Z)",
                                            "Note (↑)", "Note (↓)"])
        self.favorites_sort_combo.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #252540;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        self.favorites_sort_combo.currentIndexChanged.connect(self.sort_favorites)
        sort_layout.addWidget(self.favorites_sort_combo)

        sort_layout.addStretch()

        # Bouton pour vider les favoris
        clear_btn = QPushButton("🗑️ Vider les favoris")
        clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #F44336;
                color: white;
                border-radius: 4px;
                padding: 8px;
            }
            QPushButton:hover {
                background-color: #EF5350;
            }
        """)
        clear_btn.clicked.connect(self.clear_favorites)
        sort_layout.addWidget(clear_btn)

        layout.addWidget(sort_container)

        # Zone de contenu pour les favoris
        self.favorites_scroll_area = QScrollArea()
        self.favorites_scroll_area.setWidgetResizable(True)
        self.favorites_scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Le contenu sera ajouté dans complete_favorites_page
        self.favorites_content = QWidget()
        self.favorites_layout = QVBoxLayout(self.favorites_content)

        # Message initial (sera remplacé dans complete_favorites_page)
        initial_msg = QLabel("Chargement des favoris...")
        initial_msg.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
        initial_msg.setAlignment(Qt.AlignCenter)
        self.favorites_layout.addWidget(initial_msg)

        self.favorites_scroll_area.setWidget(self.favorites_content)
        layout.addWidget(self.favorites_scroll_area)

        # Section pour lecture aléatoire des favoris
        random_section = QFrame()
        random_section.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 50px;
            }
        """)
        random_layout = QVBoxLayout(random_section)

        random_title = QLabel("Lecture aléatoire")
        random_title.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 10px;")
        random_title.setAlignment(Qt.AlignCenter)
        random_layout.addWidget(random_title)

        random_desc = QLabel("Lancez une vidéo aléatoire parmi vos favoris")
        random_desc.setStyleSheet("color: #a0a0a0; margin-bottom: 15px;")
        random_desc.setAlignment(Qt.AlignCenter)
        random_layout.addWidget(random_desc)

        random_btn = QPushButton("🎲 Lire un favori aléatoire")
        random_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 8px;
                padding: 12px;
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        random_btn.clicked.connect(self.play_random_favorite)
        random_layout.addWidget(random_btn)

        layout.addWidget(random_section)

        layout.addStretch()

        self.content_area.addWidget(favorites_widget)

    def create_search_page(self):
        """Crée la page de recherche"""
        search_widget = QWidget()
        layout = QVBoxLayout(search_widget)

        # En-tête
        header = QLabel("Recherche")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Barre de recherche
        search_bar_container = QWidget()
        search_bar_layout = QHBoxLayout(search_bar_container)
        search_bar_layout.setContentsMargins(50, 10, 50, 10)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Rechercher par actrice, tag, site, studio...")
        self.search_input.setStyleSheet("""
            QLineEdit {
                padding: 12px;
                border-radius: 8px;
                background-color: #252540;
                color: white;
                font-size: 16px;
                border: 1px solid #333355;
            }
        """)
        self.search_input.returnPressed.connect(self.perform_search)
        search_bar_layout.addWidget(self.search_input)

        search_btn = QPushButton("🔍 Rechercher")
        search_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 8px;
                padding: 12px;
                font-weight: bold;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        search_btn.clicked.connect(self.perform_search)
        search_bar_layout.addWidget(search_btn)

        layout.addWidget(search_bar_container)

        # Zone de résultats
        self.search_results = QScrollArea()
        self.search_results.setWidgetResizable(True)
        self.search_results.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Contenu initial (vide)
        search_results_content = QWidget()
        self.search_results_layout = QVBoxLayout(search_results_content)

        initial_msg = QLabel("Entrez un terme de recherche pour commencer.")
        initial_msg.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
        initial_msg.setAlignment(Qt.AlignCenter)
        self.search_results_layout.addWidget(initial_msg)

        # Options de filtrage avancé
        filter_container = QFrame()
        filter_container.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 8px;
                margin: 10px 50px;
                padding: 15px;
            }
        """)
        filter_layout = QVBoxLayout(filter_container)

        filter_title = QLabel("Filtrage avancé")
        filter_title.setStyleSheet("font-size: 16px; font-weight: bold; margin-bottom: 10px;")
        filter_layout.addWidget(filter_title)

        filters_grid = QGridLayout()

        # Filtre par actrice
        filters_grid.addWidget(QLabel("Actrice:"), 0, 0)
        self.filter_actress = QComboBox()
        self.filter_actress.addItem("Toutes les actrices")

        # Ajouter les actrices de la collection
        actresses = set()
        for scene in self.metadata:
            if scene.get("actrices"):
                actresses.update(scene["actrices"])

        for actress in sorted(actresses):
            self.filter_actress.addItem(actress)

        self.filter_actress.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #2d2d5a;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        filters_grid.addWidget(self.filter_actress, 0, 1)

        # Filtre par studio
        filters_grid.addWidget(QLabel("Studio:"), 0, 2)
        self.filter_studio = QComboBox()
        self.filter_studio.addItem("Tous les studios")

        # Ajouter les studios de la collection
        studios = set()
        for scene in self.metadata:
            if scene.get("studio"):
                studios.add(scene["studio"])

        for studio in sorted(studios):
            self.filter_studio.addItem(studio)

        self.filter_studio.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #2d2d5a;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        filters_grid.addWidget(self.filter_studio, 0, 3)

        # Filtre par note
        filters_grid.addWidget(QLabel("Note minimum:"), 1, 0)
        self.filter_rating = QComboBox()
        for i in range(6):
            self.filter_rating.addItem(f"{i} ⭐" if i > 0 else "Toutes les notes")

        self.filter_rating.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #2d2d5a;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        filters_grid.addWidget(self.filter_rating, 1, 1)

        # Filtre par durée
        filters_grid.addWidget(QLabel("Durée minimum:"), 1, 2)
        self.filter_duration = QComboBox()
        durations = ["Toutes durées", "15 min+", "30 min+", "45 min+", "60 min+"]
        for duration in durations:
            self.filter_duration.addItem(duration)

        self.filter_duration.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #2d2d5a;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        filters_grid.addWidget(self.filter_duration, 1, 3)

        filter_layout.addLayout(filters_grid)

        # Boutons de filtrage
        filter_buttons = QWidget()
        filter_buttons_layout = QHBoxLayout(filter_buttons)
        filter_buttons_layout.setContentsMargins(50, 10, 50, 0)

        reset_btn = QPushButton("Réinitialiser les filtres")
        reset_btn.setStyleSheet("""
            QPushButton {
                background-color: #6c5ce7;
                color: white;
                border-radius: 4px;
                padding: 8px;
            }
            QPushButton:hover {
                background-color: #7b7bf7;
            }
        """)
        reset_btn.clicked.connect(self.reset_search_filters)
        filter_buttons_layout.addWidget(reset_btn)

        apply_btn = QPushButton("Appliquer les filtres")
        apply_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 4px;
                padding: 8px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        apply_btn.clicked.connect(self.apply_search_filters)
        filter_buttons_layout.addWidget(apply_btn)

        filter_layout.addWidget(filter_buttons)
        layout.addWidget(filter_container)

        self.search_results.setWidget(search_results_content)
        layout.addWidget(self.search_results)

        layout.addStretch()

        self.content_area.addWidget(search_widget)

    def create_actress_page(self):
        """Crée la page des actrices"""
        actress_widget = QWidget()
        layout = QVBoxLayout(actress_widget)

        # En-tête
        header = QLabel("Actrices")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Barre de recherche pour les actrices
        search_bar_container = QWidget()
        search_bar_layout = QHBoxLayout(search_bar_container)
        search_bar_layout.setContentsMargins(50, 10, 50, 10)

        self.actress_search_input = QLineEdit()
        self.actress_search_input.setPlaceholderText("Rechercher par nom d'actrice...")
        self.actress_search_input.setStyleSheet("""
            QLineEdit {
                padding: 10px;
                border-radius: 6px;
                background-color: #252540;
                color: white;
                font-size: 14px;
                border: 1px solid #333355;
            }
        """)
        self.actress_search_input.textChanged.connect(self.filter_actresses)
        search_bar_layout.addWidget(self.actress_search_input)

        layout.addWidget(search_bar_container)

        # Tri des actrices
        sort_container = QWidget()
        sort_layout = QHBoxLayout(sort_container)
        sort_layout.setContentsMargins(50, 0, 50, 10)

        sort_label = QLabel("Trier par:")
        sort_label.setStyleSheet("color: #a0a0a0;")
        sort_layout.addWidget(sort_label)

        self.actress_sort_combo = QComboBox()
        self.actress_sort_combo.addItems(
            ["Nom (A-Z)", "Nom (Z-A)", "Nombre de scènes (↑)", "Nombre de scènes (↓)", "Note moyenne (↑)",
             "Note moyenne (↓)", "Dernière vue"])
        self.actress_sort_combo.setStyleSheet("""
            QComboBox {
                padding: 6px;
                border-radius: 4px;
                background-color: #252540;
                color: white;
                border: 1px solid #333355;
            }
            QComboBox::drop-down {
                border: none;
            }
        """)
        self.actress_sort_combo.currentIndexChanged.connect(self.sort_actresses)
        sort_layout.addWidget(self.actress_sort_combo)

        sort_layout.addStretch()

        # Bouton pour générer les fiches actrices
        generate_btn = QPushButton("🔄 Regénérer les fiches actrices")
        generate_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 4px;
                padding: 8px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        generate_btn.clicked.connect(self.generate_actresses_data)
        sort_layout.addWidget(generate_btn)

        layout.addWidget(sort_container)

        # Zone de contenu pour les actrices
        self.actresses_scroll_area = QScrollArea()
        self.actresses_scroll_area.setWidgetResizable(True)
        self.actresses_scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Contenu (sera rempli dans complete_actress_page)
        actresses_content = QWidget()
        self.actresses_grid_layout = QGridLayout(actresses_content)
        self.actresses_grid_layout.setContentsMargins(20, 20, 20, 20)
        self.actresses_grid_layout.setSpacing(20)

        self.actresses_scroll_area.setWidget(actresses_content)
        layout.addWidget(self.actresses_scroll_area)

        layout.addStretch()

        self.content_area.addWidget(actress_widget)

    def create_stats_page(self):
        """Crée la page des statistiques"""
        stats_widget = QWidget()
        layout = QVBoxLayout(stats_widget)

        # En-tête
        header = QLabel("Statistiques")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        layout.addWidget(header)

        # Créer une zone de défilement
        stats_scroll = QScrollArea()
        stats_scroll.setWidgetResizable(True)
        stats_scroll.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Contenu des statistiques
        stats_content = QWidget()
        stats_content_layout = QVBoxLayout(stats_content)

        # === Section 1: Vue d'ensemble ===
        overview_section = QFrame()
        overview_section.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 20px;
            }
        """)

        overview_layout = QVBoxLayout(overview_section)

        overview_title = QLabel("Vue d'ensemble")
        overview_title.setStyleSheet("font-size: 22px; font-weight: bold; margin-bottom: 15px;")
        overview_layout.addWidget(overview_title)

        # Graphiques de répartition
        overview_charts = QWidget()
        charts_layout = QHBoxLayout(overview_charts)

        # Statistiques générales (colonne gauche)
        self.stats_general = QFrame()
        self.stats_general.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        general_layout = QVBoxLayout(self.stats_general)
        general_layout.setAlignment(Qt.AlignCenter)

        general_title = QLabel("Statistiques générales")
        general_title.setStyleSheet("font-weight: bold; font-size: 16px; margin-bottom: 10px;")
        general_title.setAlignment(Qt.AlignCenter)
        general_layout.addWidget(general_title)

        # Les statistiques générales seront ajoutées dans complete_stats_page()
        charts_layout.addWidget(self.stats_general)

        # Distribution des notes (colonne droite)
        self.stats_rating_dist = QFrame()
        self.stats_rating_dist.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        rating_layout = QVBoxLayout(self.stats_rating_dist)
        rating_layout.setAlignment(Qt.AlignCenter)

        rating_title = QLabel("Distribution des notes")
        rating_title.setStyleSheet("font-weight: bold; font-size: 16px; margin-bottom: 10px;")
        rating_title.setAlignment(Qt.AlignCenter)
        rating_layout.addWidget(rating_title)

        # Le graphique de distribution sera ajouté dans complete_stats_page()
        charts_layout.addWidget(self.stats_rating_dist)

        overview_layout.addWidget(overview_charts)
        stats_content_layout.addWidget(overview_section)

        # === Section 2: Top actrices et studios ===
        tops_section = QFrame()
        tops_section.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 20px;
            }
        """)

        tops_layout = QVBoxLayout(tops_section)

        tops_title = QLabel("Top actrices et studios")
        tops_title.setStyleSheet("font-size: 22px; font-weight: bold; margin-bottom: 15px;")
        tops_layout.addWidget(tops_title)

        tops_charts = QWidget()
        tops_charts_layout = QHBoxLayout(tops_charts)

        # Top actrices (colonne gauche)
        self.stats_top_actresses = QFrame()
        self.stats_top_actresses.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        top_actresses_layout = QVBoxLayout(self.stats_top_actresses)

        top_actresses_title = QLabel("Top actrices")
        top_actresses_title.setStyleSheet("font-weight: bold; font-size: 16px; margin-bottom: 10px;")
        top_actresses_title.setAlignment(Qt.AlignCenter)
        top_actresses_layout.addWidget(top_actresses_title)

        # La liste des meilleures actrices sera ajoutée dans complete_stats_page()
        tops_charts_layout.addWidget(self.stats_top_actresses)

        # Top studios (colonne droite)
        self.stats_top_studios = QFrame()
        self.stats_top_studios.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 15px;
            }
        """)
        top_studios_layout = QVBoxLayout(self.stats_top_studios)

        top_studios_title = QLabel("Top studios")
        top_studios_title.setStyleSheet("font-weight: bold; font-size: 16px; margin-bottom: 10px;")
        top_studios_title.setAlignment(Qt.AlignCenter)
        top_studios_layout.addWidget(top_studios_title)

        # La liste des meilleurs studios sera ajoutée dans complete_stats_page()
        tops_charts_layout.addWidget(self.stats_top_studios)

        tops_layout.addWidget(tops_charts)
        stats_content_layout.addWidget(tops_section)

        # === Section 3: Tags populaires ===
        tags_section = QFrame()
        tags_section.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 20px;
            }
        """)

        tags_layout = QVBoxLayout(tags_section)

        tags_title = QLabel("Tags populaires")
        tags_title.setStyleSheet("font-size: 22px; font-weight: bold; margin-bottom: 15px;")
        tags_layout.addWidget(tags_title)

        # Le contenu sera ajouté dans complete_stats_page()
        self.tags_container = QWidget()
        self.tags_grid = QGridLayout(self.tags_container)
        self.tags_grid.setContentsMargins(0, 0, 0, 0)
        self.tags_grid.setSpacing(10)

        tags_layout.addWidget(self.tags_container)
        stats_content_layout.addWidget(tags_section)

        # === Section 4: Évolution dans le temps ===
        timeline_section = QFrame()
        timeline_section.setStyleSheet("""
            QFrame {
                background-color: #252540;
                border-radius: 15px;
                padding: 20px;
                margin: 10px 20px;
            }
        """)

        timeline_layout = QVBoxLayout(timeline_section)

        timeline_title = QLabel("Évolution dans le temps")
        timeline_title.setStyleSheet("font-size: 22px; font-weight: bold; margin-bottom: 15px;")
        timeline_layout.addWidget(timeline_title)

        # Le contenu sera ajouté dans complete_stats_page()
        self.timeline_container = QWidget()
        timeline_container_layout = QVBoxLayout(self.timeline_container)

        timeline_layout.addWidget(self.timeline_container)
        stats_content_layout.addWidget(timeline_section)

        stats_scroll.setWidget(stats_content)
        layout.addWidget(stats_scroll)

        self.content_area.addWidget(stats_widget)

    # === 3. FONCTIONS DE NAVIGATION ===
    def show_login_screen(self):
        """Affiche l'écran de connexion"""
        self.stacked_widget.setCurrentWidget(self.login_screen)
        self.password_input.setFocus()
        self.password_input.clear()

    def show_main_screen(self):
        """Affiche l'écran principal"""
        # Compléter les pages avec le contenu réel
        self.complete_favorites_page()
        self.complete_search_page()
        self.complete_actress_page()
        self.complete_stats_page()
        self.stacked_widget.setCurrentWidget(self.main_screen)
        self.content_area.setCurrentIndex(0)  # Afficher la page d'accueil

    def verify_password(self):
        """Vérifie le mot de passe entré"""
        entered_password = self.password_input.text()

        if entered_password == MOT_DE_PASSE:
            # Compléter les pages avec le contenu réel
            self.complete_favorites_page()
            self.complete_search_page()
            self.complete_actress_page()
            self.complete_stats_page()

            # Afficher l'écran principal
            self.show_main_screen()
        else:
            QMessageBox.warning(self, "Erreur", "Mot de passe incorrect")
            self.password_input.clear()
            self.password_input.setFocus()

    # === 4. COMPLÉTION DES PAGES ===
    def complete_favorites_page(self):
        """Complète la page des favoris avec le contenu réel"""
        # Obtenir les scènes favorites
        favorite_scenes = []
        for path in self.favorites:
            scene = next((s for s in self.metadata if s["chemin"] == path), None)
            if scene:
                favorite_scenes.append(scene)

        # Appliquer le tri actuel
        sort_index = self.favorites_sort_combo.currentIndex()
        if sort_index > 0:  # Si un tri est sélectionné
            self.sort_favorites()
        else:
            # Afficher les favoris dans l'ordre actuel
            self.update_favorites_display(favorite_scenes)

    def complete_search_page(self):
        """Complète la page de recherche avec le contenu réel"""
        # Obtenir le widget de recherche
        search_widget = self.content_area.widget(3)

        # Supprimer les anciens widgets
        for i in reversed(range(search_widget.layout().count())):
            widget = search_widget.layout().itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Réajouter l'en-tête
        header = QLabel("Recherche")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        search_widget.layout().addWidget(header)

        # Barre de recherche
        search_bar_container = QWidget()
        search_bar_layout = QHBoxLayout(search_bar_container)
        search_bar_layout.setContentsMargins(50, 10, 50, 10)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Rechercher par actrice, tag, site, studio...")
        self.search_input.setStyleSheet("""
            QLineEdit {
                padding: 12px;
                border-radius: 8px;
                background-color: #252540;
                color: white;
                font-size: 16px;
                border: 1px solid #333355;
            }
        """)
        self.search_input.returnPressed.connect(self.perform_search)
        search_bar_layout.addWidget(self.search_input)

        search_btn = QPushButton("🔍 Rechercher")
        search_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 8px;
                padding: 12px;
                font-weight: bold;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        search_btn.clicked.connect(self.perform_search)
        search_bar_layout.addWidget(search_btn)

        search_widget.layout().addWidget(search_bar_container)

        # Zone de résultats
        self.search_results = QScrollArea()
        self.search_results.setWidgetResizable(True)
        self.search_results.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Contenu initial (vide)
        search_results_content = QWidget()
        self.search_results_layout = QVBoxLayout(search_results_content)

        initial_msg = QLabel("Entrez un terme de recherche pour commencer.")
        initial_msg.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
        initial_msg.setAlignment(Qt.AlignCenter)
        self.search_results_layout.addWidget(initial_msg)

        self.search_results.setWidget(search_results_content)
        search_widget.layout().addWidget(self.search_results)

        search_widget.layout().addStretch()

    def complete_actress_page(self):
        """Complète la page des actrices avec le contenu réel"""
        # Obtenir le widget de la page actrices
        actress_widget = self.content_area.widget(4)

        # Supprimer les anciens widgets
        for i in reversed(range(actress_widget.layout().count())):
            widget = actress_widget.layout().itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Réajouter l'en-tête
        header = QLabel("Actrices")
        header.setStyleSheet("font-size: 32px; font-weight: bold; margin: 20px 0;")
        header.setAlignment(Qt.AlignCenter)
        actress_widget.layout().addWidget(header)

        # Créer une zone de défilement
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: transparent;
            }
        """)

        # Créer une grille pour les actrices
        scroll_content = QWidget()
        grid_layout = QGridLayout(scroll_content)
        grid_layout.setContentsMargins(20, 20, 20, 20)
        grid_layout.setSpacing(20)

        # Déterminer le nombre de colonnes (ajustable)
        num_columns = 4

        # Remplir avec les actrices
        for i, actress in enumerate(self.actrices):
            actress_card = self.create_actress_card(actress)

            row = i // num_columns
            col = i % num_columns

            grid_layout.addWidget(actress_card, row, col)

        scroll_area.setWidget(scroll_content)
        actress_widget.layout().addWidget(scroll_area)

        actress_widget.layout().addStretch()

    def complete_stats_page(self):
        """Complète la page des statistiques avec le contenu réel"""
        # 1. Statistiques générales
        self.update_general_stats()

        # 2. Distribution des notes
        self.update_rating_distribution()

        # 3. Top actrices
        self.update_top_actresses()

        # 4. Top studios
        self.update_top_studios()

        # 5. Tags populaires
        self.update_popular_tags()

        # 6. Évolution dans le temps
        self.update_timeline_stats()

    # === 5. FONCTIONS POUR LES STATISTIQUES ===
    def update_general_stats(self):
        """Met à jour les statistiques générales"""
        # Supprimer les anciens widgets
        for i in reversed(range(self.stats_general.layout().count())):
            widget = self.stats_general.layout().itemAt(i).widget()
            if widget and widget != self.stats_general.layout().itemAt(0).widget():  # Conserver le titre
                widget.deleteLater()

        # Calculer les statistiques
        total_scenes = len(self.metadata)
        viewed_scenes = len(self.history)
        favorite_scenes = len(self.favorites)
        total_actresses = len(self.actrices)

        # Temps total de visionnage
        total_duration = sum(scene.get("duree", 0) for scene in self.metadata
                             if scene["chemin"] in self.history and scene.get("duree"))
        hours = total_duration // 60
        minutes = total_duration % 60

        # Statistiques à afficher
        stats_data = [
            ("Collection totale", f"{total_scenes} scènes"),
            ("Scènes visionnées",
             f"{viewed_scenes} ({viewed_scenes / total_scenes * 100:.1f}% de la collection)" if total_scenes else "0"),
            ("Scènes favorites",
             f"{favorite_scenes} ({favorite_scenes / total_scenes * 100:.1f}% de la collection)" if total_scenes else "0"),
            ("Actrices", f"{total_actresses}"),
            ("Temps de visionnage", f"{hours}h {minutes}min")
        ]

        # Widget pour contenir les stats
        stats_widget = QWidget()
        stats_layout = QVBoxLayout(stats_widget)

        # Ajouter chaque statistique
        for label, value in stats_data:
            stat_container = QWidget()
            stat_layout = QHBoxLayout(stat_container)
            stat_layout.setContentsMargins(0, 5, 0, 5)

            stat_label = QLabel(label + ":")
            stat_label.setStyleSheet("color: #a0a0a0;")
            stat_layout.addWidget(stat_label)

            stat_value = QLabel(value)
            stat_value.setStyleSheet("font-weight: bold;")
            stat_layout.addWidget(stat_value)

            stats_layout.addWidget(stat_container)

        self.stats_general.layout().addWidget(stats_widget)

    def update_rating_distribution(self):
        """Met à jour le graphique de distribution des notes"""
        # Supprimer les anciens widgets
        for i in reversed(range(self.stats_rating_dist.layout().count())):
            widget = self.stats_rating_dist.layout().itemAt(i).widget()
            if widget and widget != self.stats_rating_dist.layout().itemAt(0).widget():  # Conserver le titre
                widget.deleteLater()

        # Compter les notes
        ratings = [0, 0, 0, 0, 0, 0]  # 0, 1, 2, 3, 4, 5 étoiles

        for scene in self.metadata:
            note = scene.get("note_perso", "")
            etoiles = note.count("⭐")

            if etoiles > 5:
                etoiles = 5  # Limiter à 5 étoiles maximum

            ratings[etoiles] += 1

        # Créer un graphique visuel simple
        chart_widget = QWidget()
        chart_layout = QVBoxLayout(chart_widget)

        max_count = max(ratings)

        for i in range(5, -1, -1):  # De 5 à 0 étoiles
            if i == 0:
                label_text = "Sans note"
            else:
                label_text = f"{i} ⭐"

            bar_container = QWidget()
            bar_layout = QHBoxLayout(bar_container)
            bar_layout.setContentsMargins(0, 2, 0, 2)

            rating_label = QLabel(label_text)
            rating_label.setFixedWidth(70)
            rating_label.setStyleSheet("color: #a0a0a0;")
            bar_layout.addWidget(rating_label)

            count = ratings[i]

            # Barre de visualisation
            if max_count > 0:
                bar_width = int(200 * count / max_count)
            else:
                bar_width = 0

            if bar_width < 20 and count > 0:
                bar_width = 20  # Largeur minimale si au moins un élément

            bar = QFrame()
            bar.setFixedSize(bar_width, 20)
            bar.setStyleSheet(f"""
                background-color: {"#ff9d00" if i > 0 else "#6c5ce7"};
                border-radius: 3px;
            """)
            bar_layout.addWidget(bar)

            # Nombre
            count_label = QLabel(str(count))
            count_label.setStyleSheet("color: #a0a0a0; margin-left: 5px;")
            bar_layout.addWidget(count_label)

            bar_layout.addStretch()

            chart_layout.addWidget(bar_container)

        self.stats_rating_dist.layout().addWidget(chart_widget)

    def update_top_actresses(self):
        """Met à jour la liste des meilleures actrices"""
        # Supprimer les anciens widgets
        for i in reversed(range(self.stats_top_actresses.layout().count())):
            widget = self.stats_top_actresses.layout().itemAt(i).widget()
            if widget and widget != self.stats_top_actresses.layout().itemAt(0).widget():  # Conserver le titre
                widget.deleteLater()

        # Trouver les top actrices par nombre de scènes
        sorted_by_scenes = sorted(self.actrices,
                                  key=lambda a: a.get("nombre_de_scenes", 0),
                                  reverse=True)[:8]  # Limiter à 8 actrices

        # Créer le widget de la liste
        list_widget = QWidget()
        list_layout = QVBoxLayout(list_widget)
        list_layout.setSpacing(5)

        # Ajouter chaque actrice
        for i, actress in enumerate(sorted_by_scenes):
            item = QFrame()
            item.setStyleSheet(f"""
                QFrame {{
                    background-color: #353570;
                    border-radius: 5px;
                    padding: 5px 10px;
                }}
            """)

            item_layout = QHBoxLayout(item)
            item_layout.setContentsMargins(10, 5, 10, 5)

            # Position
            position = QLabel(f"{i + 1}.")
            position.setFixedWidth(20)
            position.setStyleSheet(f"""
                font-weight: bold;
                color: {"#ff9d00" if i < 3 else "#a0a0a0"};
            """)
            item_layout.addWidget(position)

            # Nom
            name = QLabel(actress.get("nom", ""))
            name.setStyleSheet("font-weight: bold;")
            item_layout.addWidget(name, 3)

            # Nombre de scènes
            scenes = QLabel(f"{actress.get('nombre_de_scenes', 0)}")
            scenes.setStyleSheet("color: #a0a0a0;")
            scenes.setAlignment(Qt.AlignRight)
            item_layout.addWidget(scenes, 1)

            list_layout.addWidget(item)

        self.stats_top_actresses.layout().addWidget(list_widget)

    def update_top_studios(self):
        """Met à jour la liste des meilleurs studios"""
        # Supprimer les anciens widgets
        for i in reversed(range(self.stats_top_studios.layout().count())):
            widget = self.stats_top_studios.layout().itemAt(i).widget()
            if widget and widget != self.stats_top_studios.layout().itemAt(0).widget():  # Conserver le titre
                widget.deleteLater()

        # Compter les studios
        from collections import Counter

        studios = []
        for scene in self.metadata:
            if scene.get("studio"):
                studios.append(scene["studio"])

        studio_counter = Counter(studios)

        # Trouver les studios les plus populaires
        top_studios = studio_counter.most_common(8)  # Limiter à 8 studios

        # Créer le widget de la liste
        list_widget = QWidget()
        list_layout = QVBoxLayout(list_widget)
        list_layout.setSpacing(5)

        # Ajouter chaque studio
        for i, (studio, count) in enumerate(top_studios):
            item = QFrame()
            item.setStyleSheet(f"""
                QFrame {{
                    background-color: #353570;
                    border-radius: 5px;
                    padding: 5px 10px;
                }}
            """)

            item_layout = QHBoxLayout(item)
            item_layout.setContentsMargins(10, 5, 10, 5)

            # Position
            position = QLabel(f"{i + 1}.")
            position.setFixedWidth(20)
            position.setStyleSheet(f"""
                font-weight: bold;
                color: {"#ff9d00" if i < 3 else "#a0a0a0"};
            """)
            item_layout.addWidget(position)

            # Nom
            name = QLabel(studio)
            name.setStyleSheet("font-weight: bold;")
            item_layout.addWidget(name, 3)

            # Nombre de scènes
            scenes = QLabel(str(count))
            scenes.setStyleSheet("color: #a0a0a0;")
            scenes.setAlignment(Qt.AlignRight)
            item_layout.addWidget(scenes, 1)

            list_layout.addWidget(item)

        self.stats_top_studios.layout().addWidget(list_widget)

    def update_popular_tags(self):
        """Met à jour la section des tags populaires"""
        # Nettoyer la grille des tags
        for i in reversed(range(self.tags_grid.count())):
            widget = self.tags_grid.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Compter les occurrences de tags
        from collections import Counter

        all_tags = []
        for scene in self.metadata:
            if scene.get("tags"):
                all_tags.extend(scene["tags"])

        tag_counter = Counter(all_tags)

        # Prendre les 24 tags les plus populaires
        top_tags = tag_counter.most_common(24)

        # Nombre de colonnes dans la grille
        num_columns = 4

        # Ajouter chaque tag à la grille
        for i, (tag, count) in enumerate(top_tags):
            tag_widget = QFrame()
            tag_widget.setStyleSheet("""
                QFrame {
                    background-color: #353570;
                    border-radius: 5px;
                    padding: 8px;
                }
            """)

            tag_layout = QHBoxLayout(tag_widget)
            tag_layout.setContentsMargins(10, 5, 10, 5)

            name = QLabel(tag)
            name.setStyleSheet("font-weight: bold;")
            tag_layout.addWidget(name, 3)

            count_label = QLabel(str(count))
            count_label.setStyleSheet("color: #a0a0a0;")
            count_label.setAlignment(Qt.AlignRight)
            tag_layout.addWidget(count_label, 1)

            row = i // num_columns
            col = i % num_columns

            self.tags_grid.addWidget(tag_widget, row, col)

    def update_timeline_stats(self):
        """Met à jour les statistiques d'évolution dans le temps"""
        # Supprimer les anciens widgets
        for i in reversed(range(self.timeline_container.layout().count())):
            widget = self.timeline_container.layout().itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Collecter les dates de visionnage
        dates = {}

        for scene in self.metadata:
            date_vue = scene.get("date_vue")
            if date_vue:
                if date_vue in dates:
                    dates[date_vue] += 1
                else:
                    dates[date_vue] = 1

        # Trier les dates
        sorted_dates = sorted(dates.items())

        # Si aucune date, afficher un message
        if not sorted_dates:
            no_data = QLabel("Aucune donnée temporelle disponible.")
            no_data.setStyleSheet("color: #a0a0a0; margin: 20px 0;")
            no_data.setAlignment(Qt.AlignCenter)
            self.timeline_container.layout().addWidget(no_data)
            return

        # Créer un graphique simple
        chart_widget = QWidget()
        chart_layout = QVBoxLayout(chart_widget)

        # Créer un graphique horizontal pour les 10 dernières dates
        last_dates = sorted_dates[-10:] if len(sorted_dates) > 10 else sorted_dates

        max_count = max(count for _, count in last_dates)

        # Titre du graphique
        chart_title = QLabel("Visionnage par date")
        chart_title.setStyleSheet("font-weight: bold; margin-bottom: 10px;")
        chart_layout.addWidget(chart_title)

        # Ajouter chaque barre
        for date, count in last_dates:
            bar_container = QWidget()
            bar_layout = QHBoxLayout(bar_container)
            bar_layout.setContentsMargins(0, 2, 0, 2)

            date_label = QLabel(date)
            date_label.setFixedWidth(100)
            date_label.setStyleSheet("color: #a0a0a0;")
            bar_layout.addWidget(date_label)

            # Barre de visualisation
            if max_count > 0:
                bar_width = int(300 * count / max_count)
            else:
                bar_width = 0

            if bar_width < 20 and count > 0:
                bar_width = 20  # Largeur minimale si au moins un élément

            bar = QFrame()
            bar.setFixedSize(bar_width, 20)
            bar.setStyleSheet("""
                background-color: #ff9d00;
                border-radius: 3px;
            """)
            bar_layout.addWidget(bar)

            # Nombre
            count_label = QLabel(str(count))
            count_label.setStyleSheet("color: #a0a0a0; margin-left: 5px;")
            bar_layout.addWidget(count_label)

            bar_layout.addStretch()

            chart_layout.addWidget(bar_container)

        # Statistiques résumées
        summary_container = QFrame()
        summary_container.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            }
        """)

        summary_layout = QHBoxLayout(summary_container)

        # Total de scènes vues
        total_viewed = sum(dates.values())
        total_widget = QWidget()
        total_layout = QVBoxLayout(total_widget)

        total_value = QLabel(str(total_viewed))
        total_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #ff9d00;")
        total_value.setAlignment(Qt.AlignCenter)
        total_layout.addWidget(total_value)

        total_label = QLabel("Total vues")
        total_label.setStyleSheet("color: #a0a0a0;")
        total_label.setAlignment(Qt.AlignCenter)
        total_layout.addWidget(total_label)

        summary_layout.addWidget(total_widget)

        # Moyenne par jour
        date_count = len(dates)
        avg_per_day = total_viewed / date_count if date_count > 0 else 0

        avg_widget = QWidget()
        avg_layout = QVBoxLayout(avg_widget)

        avg_value = QLabel(f"{avg_per_day:.1f}")
        avg_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #ff9d00;")
        avg_value.setAlignment(Qt.AlignCenter)
        avg_layout.addWidget(avg_value)

        avg_label = QLabel("Moyenne par jour")
        avg_label.setStyleSheet("color: #a0a0a0;")
        avg_label.setAlignment(Qt.AlignCenter)
        avg_layout.addWidget(avg_label)

        summary_layout.addWidget(avg_widget)

        # Jour le plus actif
        most_active_date = max(dates.items(), key=lambda x: x[1])

        active_widget = QWidget()
        active_layout = QVBoxLayout(active_widget)

        active_value = QLabel(most_active_date[0])
        active_value.setStyleSheet("font-size: 24px; font-weight: bold; color: #ff9d00;")
        active_value.setAlignment(Qt.AlignCenter)
        active_layout.addWidget(active_value)

        active_label = QLabel(f"Jour le plus actif ({most_active_date[1]} scènes)")
        active_label.setStyleSheet("color: #a0a0a0;")
        active_label.setAlignment(Qt.AlignCenter)
        active_layout.addWidget(active_label)

        summary_layout.addWidget(active_widget)

        chart_layout.addWidget(summary_container)
        self.timeline_container.layout().addWidget(chart_widget)

    # === 6. FONCTIONS DE DÉCOUVERTE ===
    def propose_random_scene(self):
        """Propose une scène aléatoire non visionnée"""
        import random

        # Collecter toutes les scènes non vues
        scenes_non_vues = [s for s in self.metadata if s["chemin"] not in self.history]

        if not scenes_non_vues:
            # Toutes les scènes ont été vues
            QMessageBox.information(self, "Toutes vues",
                                    "Vous avez visionné toutes les scènes disponibles. Vous pouvez revoir une scène des favoris.")
            return

        # Sélectionner une scène aléatoire
        self.current_scene = random.choice(scenes_non_vues)

        # Afficher les détails
        self.scene_title.setText(self.current_scene.get("titre", "Sans titre"))

        # Créer un texte détaillé
        details = ""
        if self.current_scene.get("actrices"):
            details += f"🎭 Actrices : {', '.join(self.current_scene['actrices'])}\n"
        if self.current_scene.get("acteurs"):
            details += f"🎭 Acteurs : {', '.join(self.current_scene['acteurs'])}\n"
        if self.current_scene.get("studio"):
            details += f"🏢 Studio : {self.current_scene['studio']}\n"
        if self.current_scene.get("site"):
            details += f"🌐 Site : {self.current_scene['site']}\n"
        if self.current_scene.get("duree"):
            details += f"⏱️ Durée : {self.current_scene['duree']} min\n"
        if self.current_scene.get("qualite"):
            details += f"📺 Qualité : {self.current_scene['qualite']}\n"
        if self.current_scene.get("tags"):
            details += f"🏷️ Tags : {', '.join(self.current_scene['tags'][:10])}"
            if len(self.current_scene['tags']) > 10:
                details += ", ..."

        self.scene_details.setText(details)

        if self.current_scene.get("synopsis"):
            self.scene_synopsis.setText(f"📖 Synopsis :\n{self.current_scene['synopsis']}")
        else:
            self.scene_synopsis.setText("")

        # Mettre à jour l'état du bouton favori
        self.update_favorite_button()

        # Afficher le cadre des résultats
        self.discover_result.setVisible(True)

    def update_favorite_button(self):
        """Met à jour le texte du bouton de favoris selon l'état"""
        if hasattr(self, 'current_scene'):
            if self.current_scene["chemin"] in self.favorites:
                self.favorite_btn.setText("💔 Retirer des favoris")
                self.favorite_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #F44336;
                        color: white;
                        border-radius: 5px;
                        padding: 10px 20px;
                    }
                    QPushButton:hover {
                        background-color: #EF5350;
                    }
                """)
            else:
                self.favorite_btn.setText("⭐ Ajouter aux favoris")
                self.favorite_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #FFC107;
                        color: white;
                        border-radius: 5px;
                        padding: 10px 20px;
                    }
                    QPushButton:hover {
                        background-color: #FFCA28;
                    }
                """)

    def play_current_scene(self):
        """Joue la scène actuelle"""
        if hasattr(self, 'current_scene'):
            import subprocess

            chemin_complet = os.path.join(RACINE, self.current_scene["chemin"])

            # Vérifier si le fichier existe
            if not os.path.exists(chemin_complet):
                QMessageBox.warning(self, "Erreur", f"Le fichier n'existe pas :\n{chemin_complet}")
                return

            # Ouvrir avec l'application par défaut
            try:
                if sys.platform == "win32":
                    os.startfile(chemin_complet)
                elif sys.platform == "darwin":  # macOS
                    subprocess.run(["open", chemin_complet])
                else:  # Linux
                    subprocess.run(["xdg-open", chemin_complet])

                # Ajouter à l'historique si pas déjà présent
                if self.current_scene["chemin"] not in self.history:
                    self.history.append(self.current_scene["chemin"])
                    self.save_json(HISTORY_FILE, self.history)
                    QMessageBox.information(self, "Historique", "Vidéo ajoutée à l'historique.")

            except Exception as e:
                QMessageBox.warning(self, "Erreur", f"Impossible d'ouvrir la vidéo :\n{str(e)}")

    def add_to_favorites(self):
        """Ajoute ou retire la scène actuelle des favoris"""
        if hasattr(self, 'current_scene'):
            if self.current_scene["chemin"] in self.favorites:
                # Retirer des favoris
                self.favorites.remove(self.current_scene["chemin"])
                self.save_json(FAVORITES_FILE, self.favorites)
                QMessageBox.information(self, "Favoris", "Vidéo retirée des favoris.")
            else:
                # Ajouter aux favoris
                self.favorites.append(self.current_scene["chemin"])
                self.save_json(FAVORITES_FILE, self.favorites)
                QMessageBox.information(self, "Favoris", "Vidéo ajoutée aux favoris.")

            # Mettre à jour l'état du bouton
            self.update_favorite_button()

    def add_note(self):
        """Ajoute ou met à jour une note pour la scène actuelle"""
        if not hasattr(self, 'current_scene'):
            return

        # Créer un dialogue pour ajouter une note
        note_dialog = QDialog(self)
        note_dialog.setWindowTitle("Ajouter une note")
        note_dialog.setMinimumWidth(500)
        note_dialog.setStyleSheet("""
            QDialog {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
            }
            QLineEdit, QTextEdit {
                padding: 8px;
                border-radius: 4px;
                background-color: #252540;
                color: white;
                border: 1px solid #333355;
            }
            QPushButton {
                background-color: #6c5ce7;
                color: white;
                border-radius: 4px;
                padding: 8px;
            }
            QPushButton:hover {
                background-color: #7b7bf7;
            }
        """)

        layout = QVBoxLayout(note_dialog)

        # Note actuelle
        current_note = self.current_scene.get("note_perso", "")

        # Instructions
        instruction = QLabel("Ajouter une note pour cette scène (ex: ⭐⭐⭐⭐ - commentaire)")
        instruction.setWordWrap(True)
        layout.addWidget(instruction)

        # Champ de note
        note_input = QLineEdit(current_note)
        note_input.setPlaceholderText("⭐⭐⭐⭐⭐ - Une excellente scène...")
        layout.addWidget(note_input)

        # Raccourcis pour les étoiles
        stars_container = QWidget()
        stars_layout = QHBoxLayout(stars_container)

        for i in range(1, 6):
            star_btn = QPushButton(f"{i} ⭐")
            star_btn.setStyleSheet("""
                QPushButton {
                    background-color: #252540;
                }
            """)

            # Utiliser une fonction lambda pour capturer la valeur i
            star_btn.clicked.connect(lambda checked=False, num=i: self.set_stars(note_input, num))
            stars_layout.addWidget(star_btn)

        layout.addWidget(stars_container)

        # Boutons d'action
        buttons_widget = QWidget()
        buttons_layout = QHBoxLayout(buttons_widget)

        cancel_btn = QPushButton("Annuler")
        cancel_btn.clicked.connect(note_dialog.reject)
        buttons_layout.addWidget(cancel_btn)

        save_btn = QPushButton("Enregistrer")
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
            }
            QPushButton:hover {
                background-color: #66BB6A;
            }
        """)
        save_btn.clicked.connect(lambda: self.save_note(note_input.text(), note_dialog))
        buttons_layout.addWidget(save_btn)

        layout.addWidget(buttons_widget)

        # Exécuter le dialogue
        note_dialog.exec()

    def set_stars(self, input_field, num_stars):
        """Définit un certain nombre d'étoiles dans le champ de note"""
        current_text = input_field.text()

        # Supprimer les étoiles existantes
        while "⭐" in current_text:
            current_text = current_text.replace("⭐", "", 1)

        # Extraire la partie textuelle (après le premier '-')
        text_part = ""
        if "-" in current_text:
            text_part = current_text.split("-", 1)[1].strip()

        # Construire la nouvelle note
        new_note = "⭐" * num_stars
        if text_part:
            new_note += f" - {text_part}"

        input_field.setText(new_note)

    def save_note(self, note_text, dialog):
        """Enregistre la note pour la scène actuelle"""
        if not hasattr(self, 'current_scene'):
            return

        # Mettre à jour les données
        for scene in self.metadata:
            if scene["chemin"] == self.current_scene["chemin"]:
                scene["note_perso"] = note_text
                # Mettre également à jour la date de visionnage
                from datetime import date
                scene["date_vue"] = str(date.today())

        # Enregistrer les modifications
        self.save_json(METADATA_FILE, self.metadata)

        # Mettre à jour l'affichage
        details = ""
        if self.current_scene.get("actrices"):
            details += f"🎭 Actrices : {', '.join(self.current_scene['actrices'])}\n"
        if self.current_scene.get("acteurs"):
            details += f"🎭 Acteurs : {', '.join(self.current_scene['acteurs'])}\n"
        if self.current_scene.get("studio"):
            details += f"🏢 Studio : {self.current_scene['studio']}\n"
        if self.current_scene.get("site"):
            details += f"🌐 Site : {self.current_scene['site']}\n"
        if self.current_scene.get("duree"):
            details += f"⏱️ Durée : {self.current_scene['duree']} min\n"
        if self.current_scene.get("qualite"):
            details += f"📺 Qualité : {self.current_scene['qualite']}\n"
        if self.current_scene.get("tags"):
            details += f"🏷️ Tags : {', '.join(self.current_scene['tags'][:10])}"
            if len(self.current_scene['tags']) > 10:
                details += ", ..."
        if note_text:
            details += f"\n⭐ Note : {note_text}"

        self.scene_details.setText(details)

        # Mettre à jour la scène courante
        self.current_scene["note_perso"] = note_text

        # Afficher un message
        QMessageBox.information(self, "Note enregistrée",
                                "La note a été enregistrée avec succès.")

        # Fermer le dialogue
        dialog.accept()

    def show_mood_mode(self):
        """Affiche l'interface du mode humeur"""

        # Créer un dialogue pour le mode humeur
        mood_dialog = QDialog(self)
        mood_dialog.setWindowTitle("Mode Humeur")
        mood_dialog.setMinimumWidth(500)
        mood_dialog.setStyleSheet("""
            QDialog {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
                font-size: 14px;
            }
            QLineEdit, QComboBox {
                padding: 8px;
                border-radius: 4px;
                background-color: #252540;
                color: white;
                border: 1px solid #333355;
            }
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 4px;
                padding: 10px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
            QCheckBox {
                color: #e6e6e6;
            }
        """)

        layout = QVBoxLayout(mood_dialog)

        title = QLabel("Mode Humeur 💫")
        title.setStyleSheet("font-size: 22px; font-weight: bold; margin-bottom: 15px;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        description = QLabel("Dis-moi ce que tu veux aujourd'hui...")
        description.setStyleSheet("font-style: italic; margin-bottom: 20px;")
        description.setAlignment(Qt.AlignCenter)
        layout.addWidget(description)

        # Recueillir tous les tags et actrices pour les options
        all_tags = set()
        for scene in self.metadata:
            if scene.get("tags"):
                all_tags.update(scene["tags"])

        # Tri alphabétique
        sorted_tags = sorted(list(all_tags))

        # Widget pour les critères
        criteria_widget = QWidget()
        criteria_layout = QGridLayout(criteria_widget)

        # Sélection de tags
        criteria_layout.addWidget(QLabel("Tags populaires:"), 0, 0)

        tags_container = QWidget()
        tags_layout = QHBoxLayout(tags_container)
        tags_layout.setContentsMargins(0, 0, 0, 0)

        # Afficher seulement les tags les plus populaires (à ajuster)
        popular_tags = sorted_tags[:10]  # On peut faire mieux avec un comptage de fréquence

        self.mood_tag_checkboxes = []
        for tag in popular_tags:
            checkbox = QCheckBox(tag)
            self.mood_tag_checkboxes.append((checkbox, tag))
            tags_layout.addWidget(checkbox)

        criteria_layout.addWidget(tags_container, 0, 1)

        # Recherche de tags spécifiques
        criteria_layout.addWidget(QLabel("Autres tags:"), 1, 0)
        self.mood_tags_input = QLineEdit()
        self.mood_tags_input.setPlaceholderText("Tags séparés par des virgules")
        criteria_layout.addWidget(self.mood_tags_input, 1, 1)

        # Sélection d'actrice
        criteria_layout.addWidget(QLabel("Actrice:"), 2, 0)
        self.mood_actress_combo = QComboBox()
        self.mood_actress_combo.addItem("Toutes les actrices")

        # Ajouter les actrices de la collection
        actresses = set()
        for scene in self.metadata:
            if scene.get("actrices"):
                actresses.update(scene["actrices"])

        for actress in sorted(actresses):
            self.mood_actress_combo.addItem(actress)

        criteria_layout.addWidget(self.mood_actress_combo, 2, 1)

        # Note minimum
        criteria_layout.addWidget(QLabel("Note minimum:"), 3, 0)
        self.mood_rating_combo = QComboBox()
        for i in range(6):
            self.mood_rating_combo.addItem(f"{i} ⭐" if i > 0 else "Toutes les notes")
        criteria_layout.addWidget(self.mood_rating_combo, 3, 1)

        layout.addWidget(criteria_widget)

        # Boutons d'action
        buttons_widget = QWidget()
        buttons_layout = QHBoxLayout(buttons_widget)

        cancel_btn = QPushButton("Annuler")
        cancel_btn.clicked.connect(mood_dialog.reject)
        buttons_layout.addWidget(cancel_btn)

        find_btn = QPushButton("Trouver une scène")
        find_btn.clicked.connect(lambda: self.find_mood_scene(mood_dialog))
        buttons_layout.addWidget(find_btn)

        layout.addWidget(buttons_widget)

        # Afficher le dialogue
        mood_dialog.exec()

    def find_mood_scene(self, dialog):
        """Trouve une scène correspondant aux critères d'humeur"""
        import random

        # Recueillir les critères sélectionnés
        selected_tags = []

        # Tags des checkboxes
        for checkbox, tag in self.mood_tag_checkboxes:
            if checkbox.isChecked():
                selected_tags.append(tag)

        # Tags additionnels du champ texte
        additional_tags = self.mood_tags_input.text().strip()
        if additional_tags:
            selected_tags.extend([t.strip().lower() for t in additional_tags.split(",") if t.strip()])

        # Actrice sélectionnée
        selected_actress = self.mood_actress_combo.currentText()
        if selected_actress == "Toutes les actrices":
            selected_actress = None

        # Note minimum
        min_rating_idx = self.mood_rating_combo.currentIndex()
        min_rating = min_rating_idx if min_rating_idx > 0 else None

        # Filtrer les scènes selon les critères
        candidates = []

        for scene in self.metadata:
            # Filtre tags
            if selected_tags:
                scene_tags = [t.lower() for t in scene.get("tags", [])]
                if not all(tag.lower() in scene_tags for tag in selected_tags):
                    continue

            # Filtre actrice
            if selected_actress:
                if not any(selected_actress == a for a in scene.get("actrices", [])):
                    continue

            # Filtre note minimum
            if min_rating:
                note = scene.get("note_perso", "")
                etoiles = note.count("⭐")
                if etoiles < min_rating:
                    continue

            candidates.append(scene)

        # Vérifier si des scènes correspondent
        if not candidates:
            QMessageBox.information(dialog, "Aucun résultat",
                                    "Aucune scène ne correspond à ces critères. Essayez d'assouplir vos filtres.")
            return

        # Sélectionner une scène aléatoire
        self.current_scene = random.choice(candidates)

        # Fermer le dialogue
        dialog.accept()

        # Mettre à jour l'interface pour afficher la scène trouvée
        self.content_area.setCurrentIndex(1)  # Aller à l'écran de découverte

        # Afficher les détails
        self.scene_title.setText(self.current_scene.get("titre", "Sans titre"))

        # Créer un texte détaillé (comme dans propose_random_scene)
        details = ""
        if self.current_scene.get("actrices"):
            details += f"🎭 Actrices : {', '.join(self.current_scene['actrices'])}\n"
        if self.current_scene.get("acteurs"):
            details += f"🎭 Acteurs : {', '.join(self.current_scene['acteurs'])}\n"
        if self.current_scene.get("studio"):
            details += f"🏢 Studio : {self.current_scene['studio']}\n"
        if self.current_scene.get("site"):
            details += f"🌐 Site : {self.current_scene['site']}\n"
        if self.current_scene.get("duree"):
            details += f"⏱️ Durée : {self.current_scene['duree']} min\n"
        if self.current_scene.get("qualite"):
            details += f"📺 Qualité : {self.current_scene['qualite']}\n"
        if self.current_scene.get("tags"):
            details += f"🏷️ Tags : {', '.join(self.current_scene['tags'][:10])}"
            if len(self.current_scene['tags']) > 10:
                details += ", ..."

        self.scene_details.setText(details)

        if self.current_scene.get("synopsis"):
            self.scene_synopsis.setText(f"📖 Synopsis :\n{self.current_scene['synopsis']}")
        else:
            self.scene_synopsis.setText("")

        # Mettre à jour l'état du bouton favori
        self.update_favorite_button()

        # Afficher le cadre des résultats
        self.discover_result.setVisible(True)

    def play_last_video(self):
        """Joue la dernière vidéo visualisée"""
        if not self.history:
            QMessageBox.information(self, "Historique vide",
                                    "Vous n'avez pas encore visionné de vidéos.")
            return

        # Récupérer la dernière entrée de l'historique
        last_path = self.history[-1]

        # Trouver les métadonnées
        scene = next((s for s in self.metadata if s["chemin"] == last_path), None)

        if not scene:
            QMessageBox.warning(self, "Erreur",
                                "Impossible de trouver les métadonnées de la dernière vidéo.")
            return

        # Définir comme scène actuelle et lire
        self.current_scene = scene
        self.play_current_scene()

    # === 7. FONCTIONS POUR LA RECHERCHE ===
    def perform_search(self):
        """Effectue une recherche dans les métadonnées"""
        # Récupérer le terme de recherche
        search_term = self.search_input.text().strip().lower()

        if not search_term:
            return

        # Supprimer les anciens résultats
        for i in reversed(range(self.search_results_layout.count())):
            widget = self.search_results_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Rechercher dans les métadonnées
        results = []

        for scene in self.metadata:
            # Texte total pour la recherche
            texte_total = " ".join([
                scene.get("titre", ""),
                " ".join(scene.get("actrices", []) + scene.get("acteurs", [])),
                scene.get("site", ""),
                scene.get("studio", ""),
                scene.get("note_perso", ""),
                " ".join(scene.get("tags", []))
            ]).lower()

            if search_term in texte_total:
                results.append(scene)

        # Afficher les résultats
        if not results:
            no_results = QLabel(f"Aucun résultat trouvé pour: {search_term}")
            no_results.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
            no_results.setAlignment(Qt.AlignCenter)
            self.search_results_layout.addWidget(no_results)
        else:
            results_header = QLabel(f"{len(results)} résultats pour: {search_term}")
            results_header.setStyleSheet("font-size: 18px; margin: 20px 0;")
            self.search_results_layout.addWidget(results_header)

            # Ajouter chaque résultat
            for scene in results:
                result_widget = QFrame()
                result_widget.setStyleSheet("""
                    QFrame {
                        background-color: #2d2d5a;
                        border-radius: 10px;
                        padding: 15px;
                        margin: 5px 10px;
                    }
                    QFrame:hover {
                        background-color: #353570;
                    }
                """)

                result_layout = QHBoxLayout(result_widget)

                # Informations de la scène
                info_widget = QWidget()
                info_layout = QVBoxLayout(info_widget)

                title = QLabel(scene.get("titre", "Sans titre"))
                title.setStyleSheet("font-size: 18px; font-weight: bold;")
                info_layout.addWidget(title)

                # Détails principaux
                details = QLabel()
                details_text = ""
                if scene.get("actrices"):
                    details_text += f"🎭 {', '.join(scene['actrices'])}"
                if scene.get("studio"):
                    details_text += f" | 🏢 {scene['studio']}"
                if scene.get("note_perso"):
                    details_text += f" | ⭐ {scene['note_perso']}"

                details.setText(details_text)
                details.setStyleSheet("color: #a0a0a0;")
                info_layout.addWidget(details)

                # Tags
                if scene.get("tags"):
                    tags_text = f"🏷️ {', '.join(scene['tags'][:10])}"
                    if len(scene['tags']) > 10:
                        tags_text += ", ..."

                    tags = QLabel(tags_text)
                    tags.setStyleSheet("color: #a0a0a0; font-size: 12px;")
                    info_layout.addWidget(tags)

                result_layout.addWidget(info_widget, 3)

                # Boutons d'action
                buttons_widget = QWidget()
                buttons_layout = QHBoxLayout(buttons_widget)

                view_btn = QPushButton("👁️ Détails")
                view_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #2196F3;
                        color: white;
                        border-radius: 5px;
                        padding: 8px 15px;
                    }
                    QPushButton:hover {
                        background-color: #42A5F5;
                    }
                """)
                view_btn.clicked.connect(lambda checked=False, s=scene: self.view_scene_details(s))
                buttons_layout.addWidget(view_btn)

                play_btn = QPushButton("▶️ Regarder")
                play_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #4CAF50;
                        color: white;
                        border-radius: 5px;
                        padding: 8px 15px;
                    }
                    QPushButton:hover {
                        background-color: #66BB6A;
                    }
                """)
                play_btn.clicked.connect(lambda checked=False, s=scene: self.play_favorite(s))
                buttons_layout.addWidget(play_btn)

                result_layout.addWidget(buttons_widget, 1)

                self.search_results_layout.addWidget(result_widget)

            # Ajouter un espace en bas
            self.search_results_layout.addStretch()

    def reset_search_filters(self):
        """Réinitialise tous les filtres de recherche"""
        self.filter_actress.setCurrentIndex(0)
        self.filter_studio.setCurrentIndex(0)
        self.filter_rating.setCurrentIndex(0)
        self.filter_duration.setCurrentIndex(0)

    def apply_search_filters(self):
        """Applique les filtres de recherche actuels"""
        # Récupérer les valeurs des filtres
        actress = self.filter_actress.currentText()
        if actress == "Toutes les actrices":
            actress = None

        studio = self.filter_studio.currentText()
        if studio == "Tous les studios":
            studio = None

        rating_idx = self.filter_rating.currentIndex()
        min_rating = rating_idx if rating_idx > 0 else None

        duration_text = self.filter_duration.currentText()
        min_duration = None
        if duration_text == "15 min+":
            min_duration = 15
        elif duration_text == "30 min+":
            min_duration = 30
        elif duration_text == "45 min+":
            min_duration = 45
        elif duration_text == "60 min+":
            min_duration = 60

        # Filtrer les résultats
        search_term = self.search_input.text().strip().lower()
        self.filter_search_results(search_term, actress, studio, min_rating, min_duration)

    def filter_search_results(self, search_term, actress=None, studio=None, min_rating=None, min_duration=None):
        """Filtre les résultats de recherche selon les critères"""
        # Supprimer les anciens résultats
        for i in reversed(range(self.search_results_layout.count())):
            widget = self.search_results_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Rechercher avec les filtres
        results = []

        for scene in self.metadata:
            # Vérifier le terme de recherche
            if search_term:
                texte_total = " ".join([
                    scene.get("titre", ""),
                    " ".join(scene.get("actrices", []) + scene.get("acteurs", [])),
                    scene.get("site", ""),
                    scene.get("studio", ""),
                    scene.get("note_perso", ""),
                    " ".join(scene.get("tags", []))
                ]).lower()

                if search_term not in texte_total:
                    continue

            # Filtre par actrice
            if actress and actress not in scene.get("actrices", []):
                continue

            # Filtre par studio
            if studio and scene.get("studio") != studio:
                continue

            # Filtre par note minimum
            if min_rating:
                note = scene.get("note_perso", "")
                etoiles = note.count("⭐")
                if etoiles < min_rating:
                    continue

            # Filtre par durée minimum
            if min_duration and (not scene.get("duree") or scene["duree"] < min_duration):
                continue

            results.append(scene)

        # Afficher les résultats
        if not results:
            filter_text = ""
            if actress or studio or min_rating or min_duration:
                filter_text = " avec les filtres appliqués"

            no_results = QLabel(f"Aucun résultat trouvé{filter_text}.")
            no_results.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
            no_results.setAlignment(Qt.AlignCenter)
            self.search_results_layout.addWidget(no_results)
        else:
            results_header = QLabel(f"{len(results)} résultats trouvés.")
            results_header.setStyleSheet("font-size: 18px; margin: 20px 0;")
            self.search_results_layout.addWidget(results_header)

            # Ajouter chaque résultat
            for scene in results:
                result_widget = QFrame()
                result_widget.setStyleSheet("""
                    QFrame {
                        background-color: #2d2d5a;
                        border-radius: 10px;
                        padding: 15px;
                        margin: 5px 10px;
                    }
                    QFrame:hover {
                        background-color: #353570;
                    }
                """)

                result_layout = QHBoxLayout(result_widget)

                # Informations de la scène
                info_widget = QWidget()
                info_layout = QVBoxLayout(info_widget)

                title = QLabel(scene.get("titre", "Sans titre"))
                title.setStyleSheet("font-size: 18px; font-weight: bold;")
                info_layout.addWidget(title)

                # Détails principaux
                details = QLabel()
                details_text = ""
                if scene.get("actrices"):
                    details_text += f"🎭 {', '.join(scene['actrices'])}"
                if scene.get("studio"):
                    details_text += f" | 🏢 {scene['studio']}"
                if scene.get("note_perso"):
                    details_text += f" | ⭐ {scene['note_perso']}"

                details.setText(details_text)
                details.setStyleSheet("color: #a0a0a0;")
                info_layout.addWidget(details)

                # Tags
                if scene.get("tags"):
                    tags_text = f"🏷️ {', '.join(scene['tags'][:10])}"
                    if len(scene['tags']) > 10:
                        tags_text += ", ..."

                    tags = QLabel(tags_text)
                    tags.setStyleSheet("color: #a0a0a0; font-size: 12px;")
                    info_layout.addWidget(tags)

                result_layout.addWidget(info_widget, 3)

                # Boutons d'action
                buttons_widget = QWidget()
                buttons_layout = QHBoxLayout(buttons_widget)

                view_btn = QPushButton("👁️ Détails")
                view_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #2196F3;
                        color: white;
                        border-radius: 5px;
                        padding: 8px 15px;
                    }
                    QPushButton:hover {
                        background-color: #42A5F5;
                    }
                """)
                view_btn.clicked.connect(lambda checked=False, s=scene: self.view_scene_details(s))
                buttons_layout.addWidget(view_btn)

                play_btn = QPushButton("▶️ Regarder")
                play_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #4CAF50;
                        color: white;
                        border-radius: 5px;
                        padding: 8px 15px;
                    }
                    QPushButton:hover {
                        background-color: #66BB6A;
                    }
                """)
                play_btn.clicked.connect(lambda checked=False, s=scene: self.play_favorite(s))
                buttons_layout.addWidget(play_btn)

                result_layout.addWidget(buttons_widget, 1)

                self.search_results_layout.addWidget(result_widget)

            # Ajouter un espace en bas
            self.search_results_layout.addStretch()

    def view_scene_details(self, scene):
        """Affiche les détails complets d'une scène"""
        self.current_scene = scene

        # Aller à l'écran de découverte
        self.content_area.setCurrentIndex(1)

        # Afficher les détails (comme dans propose_random_scene)
        self.scene_title.setText(self.current_scene.get("titre", "Sans titre"))

        details = ""
        if self.current_scene.get("actrices"):
            details += f"🎭 Actrices : {', '.join(self.current_scene['actrices'])}\n"
        if self.current_scene.get("acteurs"):
            details += f"🎭 Acteurs : {', '.join(self.current_scene['acteurs'])}\n"
        if self.current_scene.get("studio"):
            details += f"🏢 Studio : {self.current_scene['studio']}\n"
        if self.current_scene.get("site"):
            details += f"🌐 Site : {self.current_scene['site']}\n"
        if self.current_scene.get("duree"):
            details += f"⏱️ Durée : {self.current_scene['duree']} min\n"
        if self.current_scene.get("qualite"):
            details += f"📺 Qualité : {self.current_scene['qualite']}\n"
        if self.current_scene.get("tags"):
            details += f"🏷️ Tags : {', '.join(self.current_scene['tags'][:10])}"
            if len(self.current_scene['tags']) > 10:
                details += ", ..."

        self.scene_details.setText(details)

        if self.current_scene.get("synopsis"):
            self.scene_synopsis.setText(f"📖 Synopsis :\n{self.current_scene['synopsis']}")
        else:
            self.scene_synopsis.setText("")

        # Mettre à jour l'état du bouton favori
        self.update_favorite_button()

        # Afficher le cadre des résultats
        self.discover_result.setVisible(True)

    # === 8. FONCTIONS DES FAVORIS ===
    def play_favorite(self, scene):
        """Joue une scène favorite"""
        self.current_scene = scene
        self.play_current_scene()

    def remove_favorite(self, path):
        """Retire un élément des favoris"""
        if path in self.favorites:
            self.favorites.remove(path)
            self.save_json(FAVORITES_FILE, self.favorites)

            # Mettre à jour l'interface
            self.complete_favorites_page()

            QMessageBox.information(self, "Favoris", "Vidéo retirée des favoris.")

    def sort_favorites(self):
        """Trie les favoris selon le critère sélectionné"""
        sort_index = self.favorites_sort_combo.currentIndex()

        # Obtenir les scènes favorites
        favorite_scenes = []
        for path in self.favorites:
            scene = next((s for s in self.metadata if s["chemin"] == path), None)
            if scene:
                favorite_scenes.append(scene)

        # Appliquer le tri
        if sort_index == 0:  # Date d'ajout (récent)
            # Déjà dans l'ordre, car self.favorites est ordonné par date d'ajout
            pass
        elif sort_index == 1:  # Date d'ajout (ancien)
            # Inverser l'ordre de self.favorites
            favorite_scenes.reverse()
        elif sort_index == 2:  # Titre (A-Z)
            favorite_scenes.sort(key=lambda s: s.get("titre", "").lower())
        elif sort_index == 3:  # Titre (Z-A)
            favorite_scenes.sort(key=lambda s: s.get("titre", "").lower(), reverse=True)
        elif sort_index == 4:  # Actrice (A-Z)
            def get_first_actress(scene):
                actrices = scene.get("actrices", [])
                if actrices:
                    return actrices[0].lower()
                return ""

            favorite_scenes.sort(key=get_first_actress)
        elif sort_index == 5:  # Studio (A-Z)
            favorite_scenes.sort(key=lambda s: s.get("studio", "").lower())
        elif sort_index == 6:  # Note (↑)
            def get_rating(scene):
                note = scene.get("note_perso", "")
                return note.count("⭐")

            favorite_scenes.sort(key=get_rating)
        elif sort_index == 7:  # Note (↓)
            def get_rating(scene):
                note = scene.get("note_perso", "")
                return note.count("⭐")

            favorite_scenes.sort(key=get_rating, reverse=True)

        # Mettre à jour l'affichage
        self.update_favorites_display(favorite_scenes)

    def update_favorites_display(self, favorite_scenes):
        """Met à jour l'affichage des favoris avec les scènes données"""
        # Supprimer les widgets existants
        for i in reversed(range(self.favorites_layout.count())):
            widget = self.favorites_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

        # Si aucun favori, afficher un message
        if not favorite_scenes:
            empty_msg = QLabel("Vous n'avez pas encore de favoris.")
            empty_msg.setStyleSheet("font-size: 16px; color: #a0a0a0; margin: 50px 0;")
            empty_msg.setAlignment(Qt.AlignCenter)
            self.favorites_layout.addWidget(empty_msg)
            return

        # Ajouter chaque scène favorite
        for scene in favorite_scenes:
            fav_widget = QFrame()
            fav_widget.setStyleSheet("""
                QFrame {
                    background-color: #2d2d5a;
                    border-radius: 10px;
                    padding: 15px;
                    margin: 5px 10px;
                }
                QFrame:hover {
                    background-color: #353570;
                }
            """)

            fav_layout = QHBoxLayout(fav_widget)

            # Informations de la scène
            info_widget = QWidget()
            info_layout = QVBoxLayout(info_widget)

            title = QLabel(scene.get("titre", "Sans titre"))
            title.setStyleSheet("font-size: 18px; font-weight: bold;")
            info_layout.addWidget(title)

            details = QLabel()

            details_text = ""
            if scene.get("actrices"):
                details_text += f"🎭 {', '.join(scene['actrices'])}"
            if scene.get("studio"):
                details_text += f" | 🏢 {scene['studio']}"
            if scene.get("note_perso"):
                details_text += f" | ⭐ {scene['note_perso']}"
            if scene.get("duree"):
                details_text += f" | ⏱️ {scene['duree']} min"

            details.setText(details_text)
            details.setStyleSheet("color: #a0a0a0;")
            info_layout.addWidget(details)

            # Tags (si disponibles)
            if scene.get("tags"):
                tags_text = f"🏷️ {', '.join(scene['tags'][:8])}"
                if len(scene['tags']) > 8:
                    tags_text += ", ..."

                tags = QLabel(tags_text)
                tags.setStyleSheet("color: #a0a0a0; font-size: 12px;")
                info_layout.addWidget(tags)

            fav_layout.addWidget(info_widget, 3)

            # Boutons d'action
            buttons_widget = QWidget()
            buttons_layout = QVBoxLayout(buttons_widget)
            buttons_layout.setSpacing(5)

            # Rangée supérieure
            top_buttons = QWidget()
            top_layout = QHBoxLayout(top_buttons)
            top_layout.setContentsMargins(0, 0, 0, 0)

            view_btn = QPushButton("👁️ Détails")
            view_btn.setStyleSheet("""
                QPushButton {
                    background-color: #2196F3;
                    color: white;
                    border-radius: 5px;
                    padding: 8px 15px;
                }
                QPushButton:hover {
                    background-color: #42A5F5;
                }
            """)
            view_btn.clicked.connect(lambda checked=False, s=scene: self.view_scene_details(s))
            top_layout.addWidget(view_btn)

            play_btn = QPushButton("▶️ Regarder")
            play_btn.setStyleSheet("""
                QPushButton {
                    background-color: #4CAF50;
                    color: white;
                    border-radius: 5px;
                    padding: 8px 15px;
                }
                QPushButton:hover {
                    background-color: #66BB6A;
                }
            """)
            play_btn.clicked.connect(lambda checked=False, s=scene: self.play_favorite(s))
            top_layout.addWidget(play_btn)

            buttons_layout.addWidget(top_buttons)

            # Rangée inférieure
            bottom_buttons = QWidget()
            bottom_layout = QHBoxLayout(bottom_buttons)
            bottom_layout.setContentsMargins(0, 0, 0, 0)

            note_btn = QPushButton("📝 Note")
            note_btn.setStyleSheet("""
                QPushButton {
                    background-color: #9C27B0;
                    color: white;
                    border-radius: 5px;
                    padding: 8px 15px;
                }
                QPushButton:hover {
                    background-color: #BA68C8;
                }
            """)
            note_btn.clicked.connect(lambda checked=False, s=scene: self.add_note_to_scene(s))
            bottom_layout.addWidget(note_btn)

            remove_btn = QPushButton("🗑️ Retirer")
            remove_btn.setStyleSheet("""
                QPushButton {
                    background-color: #F44336;
                    color: white;
                    border-radius: 5px;
                    padding: 8px 15px;
                }
                QPushButton:hover {
                    background-color: #EF5350;
                }
            """)
            remove_btn.clicked.connect(lambda checked=False, p=scene["chemin"]: self.remove_favorite(p))
            bottom_layout.addWidget(remove_btn)

            buttons_layout.addWidget(bottom_buttons)

            fav_layout.addWidget(buttons_widget, 1)

            self.favorites_layout.addWidget(fav_widget)

        # Ajouter un espace en bas
        self.favorites_layout.addStretch()

    def play_random_favorite(self):
        """Joue une vidéo aléatoire parmi les favoris"""
        import random

        if not self.favorites:
            QMessageBox.information(self, "Aucun favori",
                                    "Vous n'avez pas encore de favoris.")
            return

        # Sélectionner un chemin aléatoire
        random_path = random.choice(self.favorites)

        # Trouver la scène correspondante
        scene = next((s for s in self.metadata if s["chemin"] == random_path), None)

        if scene:
            self.current_scene = scene
            self.play_current_scene()
        else:
            QMessageBox.warning(self, "Erreur",
                                "Impossible de trouver les métadonnées pour cette vidéo.")

    def add_note_to_scene(self, scene):
        """Ajoute une note à une scène spécifique"""
        self.current_scene = scene
        self.add_note()

        # Mettre à jour l'affichage après l'ajout de la note
        sort_index = self.favorites_sort_combo.currentIndex()
        self.favorites_sort_combo.setCurrentIndex(0)  # Réinitialiser pour forcer la mise à jour
        self.favorites_sort_combo.setCurrentIndex(sort_index)

    # === 9. FONCTIONS DE GESTION DES ACTRICES ===
    def create_actress_card(self, actress):
        """Crée une carte pour afficher une actrice"""
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #2d2d5a;
                border-radius: 10px;
                padding: 15px;
            }
            QFrame:hover {
                background-color: #353570;
            }
        """)

        layout = QVBoxLayout(card)

        # Nom de l'actrice
        name = QLabel(actress.get("nom", "Inconnue"))
        name.setStyleSheet("font-size: 18px; font-weight: bold;")
        name.setAlignment(Qt.AlignCenter)
        layout.addWidget(name)

        # Photo (si disponible)
        photo_path = actress.get("photo", "")
        if photo_path and os.path.exists(photo_path):
            photo_label = QLabel()
            pixmap = QPixmap(photo_path)
            pixmap = pixmap.scaled(150, 200, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            photo_label.setPixmap(pixmap)
            photo_label.setAlignment(Qt.AlignCenter)
            layout.addWidget(photo_label)
        else:
            # Image placeholder
            placeholder = QLabel()
            placeholder.setStyleSheet("""
                background-color: #20203a;
                border-radius: 8px;
                color: #6c5ce7;
                font-size: 64px;
                min-height: 180px;
            """)
            placeholder.setText("👤")
            placeholder.setAlignment(Qt.AlignCenter)
            layout.addWidget(placeholder)

        # Statistiques
        stats = QLabel()

        stats_text = ""
        if actress.get("nombre_de_scenes"):
            stats_text += f"🎬 {actress['nombre_de_scenes']} scène(s)\n"
        if actress.get("note_moyenne"):
            stats_text += f"⭐ {actress['note_moyenne']}/5\n"
        if actress.get("derniere_vue"):
            stats_text += f"📅 {actress['derniere_vue']}"

        stats.setText(stats_text)
        stats.setStyleSheet("color: #a0a0a0; margin-top: 5px;")
        stats.setAlignment(Qt.AlignCenter)
        layout.addWidget(stats)

        # Bouton pour voir le détail
        view_btn = QPushButton("Voir le profil")
        view_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 5px;
                padding: 8px;
                margin-top: 10px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        view_btn.clicked.connect(lambda: self.show_actress_profile(actress))
        layout.addWidget(view_btn)

        return card

    def filter_actresses(self):
        """Filtre les actrices selon le texte de recherche"""
        search_text = self.actress_search_input.text().lower()

        # Nettoyer la grille des actrices
        self.clear_actresses_grid()

        # Filtrer les actrices
        filtered_actresses = [a for a in self.actrices if search_text in a.get("nom", "").lower()]

        # Trier selon le critère actuel
        sorted_actresses = self.get_sorted_actresses(filtered_actresses)

        # Afficher les actrices filtrées
        self.display_actresses_grid(sorted_actresses)

    def sort_actresses(self):
        """Trie les actrices selon le critère sélectionné"""
        # Récupérer toutes les actrices visibles (filtrées)
        search_text = self.actress_search_input.text().lower()
        filtered_actresses = [a for a in self.actrices if search_text in a.get("nom", "").lower()]

        # Trier selon le critère actuel
        sorted_actresses = self.get_sorted_actresses(filtered_actresses)

        # Nettoyer et réafficher la grille
        self.clear_actresses_grid()
        self.display_actresses_grid(sorted_actresses)

    def get_sorted_actresses(self, actresses_list):
        """Trie une liste d'actrices selon le critère actuel"""
        sort_index = self.actress_sort_combo.currentIndex()

        if sort_index == 0:  # Nom (A-Z)
            return sorted(actresses_list, key=lambda a: a.get("nom", "").lower())
        elif sort_index == 1:  # Nom (Z-A)
            return sorted(actresses_list, key=lambda a: a.get("nom", "").lower(), reverse=True)
        elif sort_index == 2:  # Nombre de scènes (↑)
            return sorted(actresses_list, key=lambda a: a.get("nombre_de_scenes", 0))
        elif sort_index == 3:  # Nombre de scènes (↓)
            return sorted(actresses_list, key=lambda a: a.get("nombre_de_scenes", 0), reverse=True)
        elif sort_index == 4:  # Note moyenne (↑)
            return sorted(actresses_list, key=lambda a: a.get("note_moyenne", 0) or 0)
        elif sort_index == 5:  # Note moyenne (↓)
            return sorted(actresses_list, key=lambda a: a.get("note_moyenne", 0) or 0, reverse=True)
        elif sort_index == 6:  # Dernière vue
            return sorted(actresses_list, key=lambda a: a.get("derniere_vue", "") or "", reverse=True)

        # Par défaut, trier par nom
        return sorted(actresses_list, key=lambda a: a.get("nom", "").lower())

    def clear_actresses_grid(self):
        """Nettoie la grille des actrices"""
        # Supprimer tous les widgets de la grille
        for i in reversed(range(self.actresses_grid_layout.count())):
            widget = self.actresses_grid_layout.itemAt(i).widget()
            if widget:
                widget.deleteLater()

    def display_actresses_grid(self, actresses_list):
        """Affiche une liste d'actrices dans la grille"""
        # Déterminer le nombre de colonnes (ajustable)
        num_columns = 4

        # Remplir avec les actrices
        for i, actress in enumerate(actresses_list):
            actress_card = self.create_actress_card(actress)

            row = i // num_columns
            col = i % num_columns

            self.actresses_grid_layout.addWidget(actress_card, row, col)

        # Ajouter un widget vide pour combler l'espace restant
        if actresses_list:
            self.actresses_grid_layout.addItem(QSpacerItem(20, 20), len(actresses_list) // num_columns + 1, 0, 1,
                                               num_columns)

    def show_actress_profile(self, actress):
        """Affiche le profil détaillé d'une actrice"""
        # Créer un dialogue pour le profil
        profile_dialog = QDialog(self)
        profile_dialog.setWindowTitle(f"Profil - {actress.get('nom', 'Actrice')}")
        profile_dialog.setMinimumSize(800, 600)
        profile_dialog.setStyleSheet("""
            QDialog {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
            }
            QTabWidget::pane {
                border: none;
                background-color: #252540;
                border-radius: 10px;
            }
            QTabBar::tab {
                background-color: #161626;
                color: #a0a0a0;
                padding: 10px 20px;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
            }
            QTabBar::tab:selected {
                background-color: #252540;
                color: #e6e6e6;
            }
            QTabBar::tab:!selected {
                margin-top: 2px;
            }
        """)

        layout = QVBoxLayout(profile_dialog)

        # Section d'en-tête avec photo et détails
        header_widget = QWidget()
        header_layout = QHBoxLayout(header_widget)

        # Photo (si disponible)
        photo_container = QWidget()
        photo_layout = QVBoxLayout(photo_container)

        photo_path = actress.get("photo", "")
        if photo_path and os.path.exists(photo_path):
            photo_label = QLabel()
            pixmap = QPixmap(photo_path)
            pixmap = pixmap.scaled(200, 300, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            photo_label.setPixmap(pixmap)
            photo_label.setAlignment(Qt.AlignCenter)
            photo_layout.addWidget(photo_label)
        else:
            # Image placeholder
            placeholder = QLabel()
            placeholder.setStyleSheet("""
                background-color: #20203a;
                border-radius: 8px;
                color: #6c5ce7;
                font-size: 100px;
                min-height: 280px;
                min-width: 200px;
            """)
            placeholder.setText("👤")
            placeholder.setAlignment(Qt.AlignCenter)
            photo_layout.addWidget(placeholder)

        # Bouton pour définir une photo
        change_photo_btn = QPushButton("Modifier la photo")
        change_photo_btn.clicked.connect(lambda: self.change_actress_photo(actress))
        photo_layout.addWidget(change_photo_btn)

        header_layout.addWidget(photo_container, 1)

        # Informations principales
        info_container = QWidget()
        info_layout = QVBoxLayout(info_container)

        # Nom
        name = QLabel(actress.get("nom", "Inconnue"))
        name.setStyleSheet("font-size: 32px; font-weight: bold;")
        info_layout.addWidget(name)

        # Statistiques
        stats_widget = QWidget()
        stats_layout = QGridLayout(stats_widget)

        stats = [
            ("🎬 Scènes", str(actress.get("nombre_de_scenes", "0"))),
            ("⭐ Note moyenne", f"{actress.get('note_moyenne', '0')}/5"),
            ("📅 Dernière vue", actress.get("derniere_vue", "Jamais"))
        ]

        for i, (label, value) in enumerate(stats):
            stat_label = QLabel(label + ":")
            stat_label.setStyleSheet("color: #a0a0a0;")
            stats_layout.addWidget(stat_label, i, 0)

            stat_value = QLabel(value)
            stat_value.setStyleSheet("font-weight: bold;")
            stats_layout.addWidget(stat_value, i, 1)

        info_layout.addWidget(stats_widget)

        # Commentaire
        if actress.get("commentaire"):
            comment_container = QFrame()
            comment_container.setStyleSheet("""
                QFrame {
                    background-color: #252540;
                    border-radius: 8px;
                    padding: 10px;
                    margin-top: 10px;
                }
            """)

            comment_layout = QVBoxLayout(comment_container)

            comment_label = QLabel("💬 Commentaire:")
            comment_label.setStyleSheet("color: #a0a0a0;")
            comment_layout.addWidget(comment_label)

            comment = QLabel(actress.get("commentaire"))
            comment.setWordWrap(True)
            comment_layout.addWidget(comment)

            info_layout.addWidget(comment_container)

        # Tags typiques
        if actress.get("tags_typiques"):
            tags_container = QFrame()
            tags_container.setStyleSheet("""
                QFrame {
                    background-color: #252540;
                    border-radius: 8px;
                    padding: 10px;
                    margin-top: 10px;
                }
            """)

            tags_layout = QVBoxLayout(tags_container)

            tags_label = QLabel("🏷️ Tags typiques:")
            tags_label.setStyleSheet("color: #a0a0a0;")
            tags_layout.addWidget(tags_label)

            # Créer une grille de tags
            tags_grid = QWidget()
            grid_layout = QGridLayout(tags_grid)
            grid_layout.setContentsMargins(0, 0, 0, 0)
            grid_layout.setSpacing(5)

            num_columns = 3

            for i, tag in enumerate(actress.get("tags_typiques", [])):
                tag_label = QLabel(tag)
                tag_label.setStyleSheet("""
                    background-color: #353570;
                    padding: 5px 10px;
                    border-radius: 5px;
                """)

                row = i // num_columns
                col = i % num_columns

                grid_layout.addWidget(tag_label, row, col)

            tags_layout.addWidget(tags_grid)

            info_layout.addWidget(tags_container)

        # Bouton pour modifier le profil
        edit_btn = QPushButton("✏️ Modifier le profil")
        edit_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                border-radius: 5px;
                padding: 10px;
                margin-top: 15px;
            }
            QPushButton:hover {
                background-color: #42A5F5;
            }
        """)
        edit_btn.clicked.connect(lambda: self.edit_actress_profile(actress))
        info_layout.addWidget(edit_btn)

        info_layout.addStretch()

        header_layout.addWidget(info_container, 2)

        layout.addWidget(header_widget)

        # Onglets pour les différentes informations
        tabs = QTabWidget()

        # Onglet des scènes
        scenes_tab = QWidget()
        scenes_layout = QVBoxLayout(scenes_tab)

        # Trouver toutes les scènes avec cette actrice
        scenes = [s for s in self.metadata if actress.get("nom") in s.get("actrices", [])]

        if not scenes:
            no_scenes = QLabel("Aucune scène trouvée pour cette actrice.")
            no_scenes.setAlignment(Qt.AlignCenter)
            no_scenes.setStyleSheet("color: #a0a0a0; margin: 50px 0;")
            scenes_layout.addWidget(no_scenes)
        else:
            scenes_scroll = QScrollArea()
            scenes_scroll.setWidgetResizable(True)
            scenes_scroll.setStyleSheet("""
                QScrollArea {
                    border: none;
                    background-color: transparent;
                }
            """)

            scenes_content = QWidget()
            scenes_content_layout = QVBoxLayout(scenes_content)

            for scene in scenes:
                scene_widget = QFrame()
                scene_widget.setStyleSheet("""
                    QFrame {
                        background-color: #2d2d5a;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 5px;
                    }
                    QFrame:hover {
                        background-color: #353570;
                    }
                """)

                scene_layout = QHBoxLayout(scene_widget)

                # Informations de la scène
                scene_info = QWidget()
                scene_info_layout = QVBoxLayout(scene_info)

                title = QLabel(scene.get("titre", "Sans titre"))
                title.setStyleSheet("font-size: 18px; font-weight: bold;")
                scene_info_layout.addWidget(title)

                details = QLabel()

                details_text = ""
                if scene.get("studio"):
                    details_text += f"🏢 {scene['studio']} "
                if scene.get("site"):
                    details_text += f"| 🌐 {scene['site']} "
                if scene.get("note_perso"):
                    details_text += f"| ⭐ {scene['note_perso']} "
                if scene.get("duree"):
                    details_text += f"| ⏱️ {scene['duree']} min "

                details.setText(details_text)
                details.setStyleSheet("color: #a0a0a0;")
                scene_info_layout.addWidget(details)

                scene_layout.addWidget(scene_info, 3)

                # Boutons d'action
                scene_buttons = QWidget()
                scene_buttons_layout = QHBoxLayout(scene_buttons)

                view_btn = QPushButton("👁️ Détails")
                view_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #2196F3;
                        color: white;
                        border-radius: 5px;
                        padding: 8px;
                    }
                    QPushButton:hover {
                        background-color: #42A5F5;
                    }
                """)
                view_btn.clicked.connect(lambda checked=False, s=scene: self.view_scene_details(s))
                scene_buttons_layout.addWidget(view_btn)

                play_btn = QPushButton("▶️ Regarder")
                play_btn.setStyleSheet("""
                    QPushButton {
                        background-color: #4CAF50;
                        color: white;
                        border-radius: 5px;
                        padding: 8px;
                    }
                    QPushButton:hover {
                        background-color: #66BB6A;
                    }
                """)
                play_btn.clicked.connect(lambda checked=False, s=scene: self.play_favorite(s))
                scene_buttons_layout.addWidget(play_btn)

                scene_layout.addWidget(scene_buttons, 1)

                scenes_content_layout.addWidget(scene_widget)

            scenes_scroll.setWidget(scenes_content)
            scenes_layout.addWidget(scenes_scroll)

        tabs.addTab(scenes_tab, "Scènes")

        # Ajouter les onglets au layout
        layout.addWidget(tabs)

        # Exécuter le dialogue
        profile_dialog.exec()

    def change_actress_photo(self, actress):
        """Permet de modifier la photo d'une actrice"""
        file_dialog = QFileDialog()
        file_dialog.setFileMode(QFileDialog.ExistingFile)
        file_dialog.setNameFilter("Images (*.png *.jpg *.jpeg *.bmp)")

        if file_dialog.exec():
            selected_files = file_dialog.selectedFiles()
            if selected_files:
                photo_path = selected_files[0]

                # Créer le dossier images s'il n'existe pas
                if not os.path.exists("images"):
                    os.makedirs("images")

                # Créer un nom de fichier basé sur le nom de l'actrice
                import shutil
                from pathlib import Path

                file_ext = Path(photo_path).suffix
                safe_name = actress["nom"].replace(" ", "_").lower()
                destination = f"images/{safe_name}{file_ext}"

                # Copier la photo
                try:
                    shutil.copy(photo_path, destination)

                    # Mettre à jour les données
                    for a in self.actrices:
                        if a["nom"] == actress["nom"]:
                            a["photo"] = destination

                    # Enregistrer les modifications
                    self.save_json(ACTRICES_FILE, self.actrices)

                    QMessageBox.information(self, "Photo mise à jour",
                                            f"La photo de {actress['nom']} a été mise à jour.")

                    # Rafraîchir l'interface
                    self.complete_actress_page()

                except Exception as e:
                    QMessageBox.warning(self, "Erreur",
                                        f"Impossible de mettre à jour la photo: {str(e)}")

    def edit_actress_profile(self, actress):
        """Permet d'éditer le profil d'une actrice"""
        edit_dialog = QDialog(self)
        edit_dialog.setWindowTitle(f"Modifier - {actress.get('nom', 'Actrice')}")
        edit_dialog.setMinimumWidth(500)
        edit_dialog.setStyleSheet("""
            QDialog {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
            }
            QLineEdit, QTextEdit {
                padding: 8px;
                border-radius: 4px;
                background-color: #252540;
                color: white;
                border: 1px solid #333355;
            }
            QPushButton {
                background-color: #6c5ce7;
                color: white;
                border-radius: 4px;
                padding: 8px;
            }
            QPushButton:hover {
                background-color: #7b7bf7;
            }
        """)

        layout = QVBoxLayout(edit_dialog)

        form_widget = QWidget()
        form_layout = QGridLayout(form_widget)

        # Nom
        form_layout.addWidget(QLabel("Nom:"), 0, 0)
        name_input = QLineEdit(actress.get("nom", ""))
        form_layout.addWidget(name_input, 0, 1)

        # Tags typiques
        form_layout.addWidget(QLabel("Tags typiques:"), 1, 0)
        tags_input = QLineEdit(", ".join(actress.get("tags_typiques", [])))
        form_layout.addWidget(tags_input, 1, 1)

        # Commentaire
        form_layout.addWidget(QLabel("Commentaire:"), 2, 0)
        comment_input = QTextEdit(actress.get("commentaire", ""))
        comment_input.setMinimumHeight(100)
        form_layout.addWidget(comment_input, 2, 1)

        layout.addWidget(form_widget)

        # Boutons d'action
        buttons_widget = QWidget()
        buttons_layout = QHBoxLayout(buttons_widget)

        cancel_btn = QPushButton("Annuler")
        cancel_btn.clicked.connect(edit_dialog.reject)
        buttons_layout.addWidget(cancel_btn)

        save_btn = QPushButton("Enregistrer")
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
            }
            QPushButton:hover {
                background-color: #66BB6A;
            }
        """)
        save_btn.clicked.connect(lambda: self.save_actress_profile(actress, name_input.text(),
                                                                   tags_input.text(),
                                                                   comment_input.toPlainText(),
                                                                   edit_dialog))
        buttons_layout.addWidget(save_btn)

        layout.addWidget(buttons_widget)

        # Exécuter le dialogue
        edit_dialog.exec()

    def save_actress_profile(self, actress, name, tags_text, comment, dialog):
        """Enregistre les modifications du profil d'une actrice"""
        # Traiter les tags
        tags_list = [t.strip() for t in tags_text.split(",") if t.strip()]

        # Mettre à jour les données
        for a in self.actrices:
            if a["nom"] == actress["nom"]:
                a["nom"] = name
                a["tags_typiques"] = tags_list
                a["commentaire"] = comment

        # Enregistrer les modifications
        self.save_json(ACTRICES_FILE, self.actrices)

        QMessageBox.information(self, "Profil mis à jour",
                                f"Le profil de {name} a été mis à jour.")

        # Rafraîchir l'interface
        self.complete_actress_page()

        # Fermer le dialogue
        dialog.accept()

    def generate_actresses_data(self):
        """Génère les fiches actrices à partir des métadonnées des scènes"""
        import datetime

        # Charger les anciennes fiches pour conserver certaines informations
        old_actresses = {a["nom"]: a for a in self.actrices}

        # Dictionnaire pour stocker les données des actrices
        actresses_dict = {}

        for scene in self.metadata:
            actresses = scene.get("actrices", [])
            note = scene.get("note_perso", "")
            date_vue = scene.get("date_vue", None)
            tags = scene.get("tags", [])

            for nom in actresses:
                nom = nom.strip()

                # Récupérer l'ancienne fiche si elle existe
                old = old_actresses.get(nom, {})

                if nom not in actresses_dict:
                    actresses_dict[nom] = {
                        "nom": nom,
                        "nombre_de_scenes": 0,
                        "note_totale": 0,
                        "nb_notes": 0,
                        "derniere_vue": date_vue,
                        "tags_typiques": [],
                        "commentaire": old.get("commentaire", ""),
                        "photo": old.get("photo", "")
                    }

                actresses_dict[nom]["nombre_de_scenes"] += 1

                # Traiter la note
                etoiles = note.count("⭐")
                if etoiles > 0:
                    actresses_dict[nom]["note_totale"] += etoiles
                    actresses_dict[nom]["nb_notes"] += 1

                # Mise à jour de la dernière date de visionnage
                if date_vue:
                    current = actresses_dict[nom]["derniere_vue"]
                    if current is None or (date_vue > current):
                        actresses_dict[nom]["derniere_vue"] = date_vue

                # Ajouter les tags
                actresses_dict[nom]["tags_typiques"].extend(tags)

        # Créer les fiches finales
        new_actresses = []
        for nom, data in actresses_dict.items():
            moyenne = None
            if data["nb_notes"] > 0:
                moyenne = round(data["note_totale"] / data["nb_notes"], 2)

            # Éliminer les doublons de tags et trier
            tags_uniques = sorted(list(set(data["tags_typiques"])))

            new_actresses.append({
                "nom": nom,
                "nombre_de_scenes": data["nombre_de_scenes"],
                "note_moyenne": moyenne,
                "derniere_vue": data["derniere_vue"],
                "tags_typiques": tags_uniques,
                "commentaire": data["commentaire"],
                "photo": data["photo"]
            })

        # Enregistrer les nouvelles fiches
        self.actrices = new_actresses
        self.save_json(ACTRICES_FILE, new_actresses)

        # Mettre à jour l'interface
        self.complete_actress_page()
        self.complete_stats_page()

        QMessageBox.information(self, "Génération terminée",
                                f"{len(new_actresses)} fiches d'actrices ont été générées.")

    # === 10. FONCTIONS DES MENUS ET PARAMÈTRES ===
    def clear_history(self):
        """Réinitialise l'historique des vidéos visionnées"""
        reply = QMessageBox.question(self, "Confirmation",
                                     "Êtes-vous sûr de vouloir réinitialiser l'historique ?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)

        if reply == QMessageBox.Yes:
            self.history = []
            self.save_json(HISTORY_FILE, self.history)

            # Mettre à jour l'interface
            self.create_home_page()
            self.complete_stats_page()

            QMessageBox.information(self, "Historique", "L'historique a été réinitialisé.")

    def clear_favorites(self):
        """Réinitialise la liste des favoris"""
        reply = QMessageBox.question(self, "Confirmation",
                                     "Êtes-vous sûr de vouloir réinitialiser les favoris ?",
                                     QMessageBox.Yes | QMessageBox.No, QMessageBox.No)

        if reply == QMessageBox.Yes:
            self.favorites = []
            self.save_json(FAVORITES_FILE, self.favorites)

            # Mettre à jour l'interface
            self.complete_favorites_page()
            self.complete_stats_page()

            QMessageBox.information(self, "Favoris", "La liste des favoris a été réinitialisée.")

    def show_about(self):
        """Affiche la boîte de dialogue À propos"""
        about_dialog = QDialog(self)
        about_dialog.setWindowTitle("À propos d'Intyma")
        about_dialog.setFixedSize(400, 300)
        about_dialog.setStyleSheet("""
            QDialog {
                background-color: #20203a;
                color: #e6e6e6;
            }
            QLabel {
                color: #e6e6e6;
            }
        """)

        layout = QVBoxLayout(about_dialog)

        title = QLabel("Intyma")
        title.setStyleSheet("font-size: 32px; font-weight: bold; color: #ff9d00;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        version = QLabel("Version 2.0")
        version.setStyleSheet("font-size: 14px; color: #a0a0a0;")
        version.setAlignment(Qt.AlignCenter)
        layout.addWidget(version)

        description = QLabel(
            "Gestionnaire de collection de vidéos pour adultes avec interface graphique."
        )
        description.setWordWrap(True)
        description.setAlignment(Qt.AlignCenter)
        description.setStyleSheet("margin-top: 20px;")
        layout.addWidget(description)

        copyright = QLabel("© 2025 - Tous droits réservés")
        copyright.setAlignment(Qt.AlignCenter)
        copyright.setStyleSheet("margin-top: 20px; color: #a0a0a0;")
        layout.addWidget(copyright)

        # Bouton OK
        ok_btn = QPushButton("OK")
        ok_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff9d00;
                color: white;
                border-radius: 4px;
                padding: 8px;
                margin-top: 20px;
            }
            QPushButton:hover {
                background-color: #ffb347;
            }
        """)
        ok_btn.clicked.connect(about_dialog.accept)

        btn_container = QWidget()
        btn_layout = QHBoxLayout(btn_container)
        btn_layout.addStretch()
        btn_layout.addWidget(ok_btn)
        btn_layout.addStretch()

        layout.addWidget(btn_container)
        layout.addStretch()

        about_dialog.exec()


# Lancement de l'application
if __name__ == "__main__":
    app = QApplication(sys.argv)

    # Appliquer un style global
    app.setStyleSheet("""
        QMainWindow, QDialog {
            background-color: #20203a;
            color: #e6e6e6;
        }
        QLabel {
            color: #e6e6e6;
        }
        QPushButton {
            background-color: #6c5ce7;
            color: white;
            border-radius: 4px;
            padding: 8px;
        }
        QScrollBar:vertical {
            border: none;
            background: #252540;
            width: 10px;
            margin: 0px 0px 0px 0px;
        }
        QScrollBar::handle:vertical {
            background: #5252c7;
            min-height: 20px;
            border-radius: 5px;
        }
        QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
            height: 0px;
        }
    """)

    window = IntymaApp()
    window.show()

    sys.exit(app.exec())