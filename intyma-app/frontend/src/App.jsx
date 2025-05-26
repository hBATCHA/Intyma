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
        setCurrentPath(path);
        console.log(`Navigation vers: ${path}`);
    };

    // Fonction pour le bouton "Explorer maintenant"
    const handleExploreNow = () => {
        setCurrentPath('/decouvrir');
        console.log('Redirection vers Découvrir');
    };

    // Si on est en mode admin, afficher seulement l'interface d'administration
    // Si on est en mode admin, afficher seulement l'interface d'administration
    if (showAdmin) {
        return <AdminInterface onBack={() => setShowAdmin(false)} />;
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
                    apiBaseUrl="http://127.0.0.1:5000"
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

                <CollectionsFavorites
                    apiBaseUrl="http://127.0.0.1:5000"
                    title="📚 Mes Collections Premium"
                    maxItems={6}
                    onCollectionClick={(collection) => {
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