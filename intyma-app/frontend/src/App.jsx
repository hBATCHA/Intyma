import React, {useEffect, useState} from "react";
import axios from "axios";
import SceneCard from "./components/SceneCard";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import AdminInterface from "./components/AdminInterface"; // Nouveau import
import {Container, Typography, Box, Button} from "@mui/material";
import {BrowserRouter} from "react-router-dom";
import ActriceDuJour from "./components/ActriceDuJour.jsx";
import CollectionsFavorites from "./components/CollectionsFavorites.jsx";
import SuggestionsSidebar from "./components/SuggestionsSidebar.jsx";
import NewReleasesGrid from "./components/NewReleasesGrid.jsx";
import TrendingCarousel from "./components/TrendingCarousel.jsx";
import PopularCategories from "./components/PopularCategories.jsx";
import RecentlyViewedSection from "./components/RecentlyViewedSection.jsx";
import FooterComplet from "./components/FooterComplet.jsx";
import Decouvrir from "./components/Decouvrir.jsx";
import StatsPersonnelles from "./components/StatsPersonnelles.jsx";
import SuggestionsExploration from "./components/SuggestionsExploration.jsx";

function App() {
    const [scenes, setScenes] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [showAdmin, setShowAdmin] = useState(false); // Nouvel état

    useEffect(() => {
        if (!showAdmin) {
            axios.get("http://127.0.0.1:5000/api/scenes")
                .then((res) => setScenes(res.data))
                .catch((err) => console.error("Erreur API :", err));
        }
    }, [showAdmin]);

    // Fonction de navigation
    const handleNavigation = (path) => {
        if (path === '/admin') {
            setShowAdmin(true);
            return;
        }
        if (path === '/decouvrir') {
            setCurrentPath('/decouvrir');
            return;
        }
        setCurrentPath(path);
        console.log(`Navigation vers: ${path}`);
    };

    // Fonction pour le bouton "Explorer maintenant"
    const handleExploreNow = () => {
        setCurrentPath('/decouvrir');
        console.log('Redirection vers Découvrir');
    };

    // ✅ NOUVEAU : Gestion des clics sur les nouvelles sorties
    const handleNewReleaseClick = (scene) => {
        console.log('Clic sur nouvelle sortie:', scene);
        // Vous pouvez ici ouvrir un modal de détail, naviguer vers une page de détail, etc.
        // Exemple : setSelectedScene(scene); setDetailModalOpen(true);
    };

    // ✅ NOUVEAU : Gestion du clic "Voir tout" des nouvelles sorties
    const handleSeeAllNewReleases = () => {
        setCurrentPath('/nouvelles-sorties');
        console.log('Navigation vers toutes les nouvelles sorties');
    };

    // ✅ NOUVEAU : Gestion des clics sur les contenus trending
    const handleTrendingClick = (scene) => {
        console.log('Clic sur contenu trending:', scene);
        // Vous pouvez ici ouvrir un modal de détail, naviguer vers une page de détail, etc.
        // Exemple : setSelectedScene(scene); setDetailModalOpen(true);
    };

    // ✅ NOUVEAU : Gestion du clic "Voir tout" des tendances
    const handleSeeAllTrending = () => {
        setCurrentPath('/tendances');
        console.log('Navigation vers toutes les tendances');
    };

    // Si on est en mode admin, afficher seulement l'interface d'administration
    if (showAdmin) {
        return <AdminInterface onBack={() => setShowAdmin(false)} />;
    }

    if (currentPath === '/decouvrir') {
        return (
            <BrowserRouter>
                <div>
                    <Header
                        currentPath={currentPath}
                        onNavigate={handleNavigation}
                        logoSrc="/logo-intyma.png"
                        userName="Utilisateur"
                        showAdminButton={true}
                    />
                    <Decouvrir apiBaseUrl="http://127.0.0.1:5000" />
                </div>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <div>
                {/* Header avec navigation - ajout du lien admin */}
                <Header
                    currentPath={currentPath}
                    onNavigate={handleNavigation}
                    logoSrc="/logo-intyma.png"
                    userName="Utilisateur"
                    showAdminButton={true} // Nouveau prop
                />

                <HeroSection
                    title="Entrez dans l'univers Intyma..."
                    subtitle="Éveillez vos sens, explorez vos envies... toujours en privé."
                    backgroundImage="/silhouette-hero.png"
                    onPrimaryAction={handleExploreNow}
                    showSecondaryButton={true}
                />

                <ActriceDuJour
                    apiBaseUrl="http://127.0.0.1:5000"
                    onActriceClick={(actrice) => {
                        console.log('Voir actrice:', actrice);
                    }}
                    onSceneClick={(scene) => {
                        console.log('Voir scène:', scene);
                    }}
                />

                <NewReleasesGrid
                    apiBaseUrl="http://127.0.0.1:5000"
                    maxItems={8}
                    onSceneClick={handleNewReleaseClick}
                    onSeeAllClick={handleSeeAllNewReleases}
                />

                <TrendingCarousel
                    apiBaseUrl="http://127.0.0.1:5000"
                    maxItems={10}
                    autoplayDelay={4000}
                    onSceneClick={handleTrendingClick}
                    onSeeAllClick={handleSeeAllTrending}
                />

                <PopularCategories
                    apiBaseUrl="http://127.0.0.1:5000"
                    maxItems={12}
                    showItemCount={true}
                    enableMultiSelect={false}
                    onCategoryClick={(category, selectedCategories) => {
                        if (category) {
                            console.log('Catégorie sélectionnée:', category.name);
                            // Rediriger vers la page découverte avec filtre
                            setCurrentPath('/decouvrir');
                        } else {
                            console.log('Voir toutes les catégories');
                            setCurrentPath('/decouvrir');
                        }
                    }}
                />

                <RecentlyViewedSection
                    apiBaseUrl="http://127.0.0.1:5000"
                    maxItems={12}
                />

                <CollectionsFavorites
                    apiBaseUrl="http://127.0.0.1:5000"
                    title="📚 Mes Collections Premium"
                    maxItems={6}
                    onCollectionClick={(collection) => {
                        console.log('Ouvrir collection:', collection);
                    }}
                />

                <StatsPersonnelles apiBaseUrl="http://127.0.0.1:5000" />

                <FooterComplet />

            </div>
        </BrowserRouter>
    );
}

export default App;