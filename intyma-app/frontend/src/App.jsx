import React, {useEffect, useState} from "react";
import axios from "axios";
import SceneCard from "./components/SceneCard";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection"; // Nouveau import
import {Container, Typography, Box} from "@mui/material";
import {BrowserRouter} from "react-router-dom";
import ActriceDuJour from "./components/ActriceDuJour.jsx";
import CollectionsFavorites from "./components/CollectionsFavorites.jsx";
import SuggestionsSidebar from "./components/SuggestionsSidebar.jsx";

function App() {
    const [scenes, setScenes] = useState([]);
    const [currentPath, setCurrentPath] = useState('/'); // État pour la navigation

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/scenes")
            .then((res) => setScenes(res.data))
            .catch((err) => console.error("Erreur API :", err));
    }, []);

    // Fonction de navigation
    const handleNavigation = (path) => {
        setCurrentPath(path);
        console.log(`Navigation vers: ${path}`);
        // TODO: Ici vous pourrez ajouter React Router plus tard
    };

    // Fonction pour le bouton "Explorer maintenant"
    const handleExploreNow = () => {
        setCurrentPath('/decouvrir');
        console.log('Redirection vers Découvrir');
        // TODO: Implémenter la navigation React Router vers /decouvrir
    };

    return (
        <BrowserRouter>
            <div>
                {/* Header avec navigation */}
                <Header
                    currentPath={currentPath}
                    onNavigate={handleNavigation}
                    logoSrc="/logo-intyma.png"
                    userName="Utilisateur"
                />

                {/* Hero Section - Nouveau ! */}
                <HeroSection
                    title="Entrez dans l'univers Intyma..."
                    subtitle="Éveillez vos sens, explorez vos envies... toujours en privé."
                    backgroundImage="/silhouette-hero.png"
                    onPrimaryAction={handleExploreNow}
                    apiBaseUrl="http://127.0.0.1:5000"
                    showSecondaryButton={true}
                />

                <ActriceDuJour
                    apiBaseUrl="http://127.0.0.1:5000"
                    onActriceClick={(actrice) => {
                        // Navigation vers fiche actrice
                        console.log('Voir actrice:', actrice);
                    }}
                    onSceneClick={(scene) => {
                        // Navigation vers scène
                        console.log('Voir scène:', scene);
                    }}
                />

                <CollectionsFavorites
                    apiBaseUrl="http://127.0.0.1:5000"
                    title="📚 Mes Collections Premium"
                    maxItems={6}
                    onCollectionClick={(collection) => {
                        // Navigation vers la collection
                        console.log('Ouvrir collection:', collection);
                    }}
                />

                <SuggestionsSidebar
                    apiBaseUrl="http://127.0.0.1:5000"
                    onShowSurprise={(surprise) => console.log("Nouvelle suggestion:", surprise)}
                />

            </div>
        </BrowserRouter>
    );
}

export default App;