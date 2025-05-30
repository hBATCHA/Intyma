import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Modal,
    Backdrop,
    Fade,
    IconButton,
    Rating,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Close,
    PlayArrow,
    Favorite,
    FavoriteBorder,
    Visibility,
    Add,
    Remove,
    Delete,
    Person,
    Movie
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
`;

// =================== STYLED COMPONENTS ===================

const SuggestionsContainer = styled(Box)({
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05) 0%, transparent 50%, rgba(218, 165, 32, 0.02) 100%)',
        pointerEvents: 'none',
    }
});

const SurpriseButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520, #B8860B)',
    color: '#000',
    fontWeight: 600,
    fontSize: '1.1rem',
    padding: '12px 32px',
    borderRadius: '25px',
    textTransform: 'none',
    width: '100%',
    boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(218, 165, 32, 0.4)',
    }
});

const SurpriseCard = styled(Card)({
    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    marginTop: '20px',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #DAA520, #F4D03F, #DAA520)',
    }
});

// ✅ STYLES POUR LE DESIGN ORIGINAL (2 colonnes) - VERSION OPTIMISÉE
const ActriceSection = styled(Box)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)',
    border: '2px solid rgba(218, 165, 32, 0.4)',
    borderRadius: '16px',
    padding: '20px 16px 16px 16px', // ✅ Réduction du padding bottom
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '260px', // ✅ Réduction de la largeur
    maxWidth: '280px',
    position: 'relative',
    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.25) 0%, rgba(184, 134, 11, 0.25) 100%)',
        borderColor: '#DAA520',
        transform: 'translateY(-3px) scale(1.02)', // ✅ Effet hover plus prononcé
        boxShadow: '0 12px 30px rgba(218, 165, 32, 0.3)',
    },
    // ✅ Effet de brillance
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
        borderRadius: '16px 16px 0 0',
    }
});

const ActriceImage = styled(Box)({
    width: '180px',
    height: '220px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    marginBottom: '12px',
    margin: '0 auto 12px auto', // ✅ CORRECTION : Centrage restauré
    border: '3px solid rgba(218, 165, 32, 0.5)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',

    // ✅ EFFET FLOU EN ARRIÈRE-PLAN
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.3)',
        zIndex: 0,
    },

    // ✅ IMAGE NETTE PAR-DESSUS
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        height: '90%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    },

    '&:hover': {
        borderColor: '#DAA520',
        transform: 'scale(1.03)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',

        '&::after': {
            transform: 'translate(-50%, -50%) scale(1.05)',
        }
    }
});

const ActriceImagePlaceholder = styled(Box)({
    width: '180px',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(218, 165, 32, 0.1)',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '3px solid rgba(218, 165, 32, 0.3)',
    margin: '0 auto 12px auto' // ✅ CORRECTION : Centrage restauré
});

const SceneSection = styled(Box)({
    flex: 1,
    paddingLeft: '24px', // ✅ Réduction du padding
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // ✅ Répartition optimale de l'espace
});

const SceneImage = styled(Box)({
    width: '300px',
    height: '225px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '3px solid rgba(218, 165, 32, 0.5)', // ✅ CHANGÉ de 0.4 à 0.5
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)', // ✅ CHANGÉ de '0 6px 20px' à '0 4px 15px'
    cursor: 'pointer',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.3)',
        zIndex: 0,
    },

    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        height: '90%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    },

    '&:hover': {
        borderColor: '#DAA520',
        transform: 'scale(1.03)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',

        '&::after': {
            transform: 'translate(-50%, -50%) scale(1.05)', // ✅ AJOUTÉ cette ligne
        }
    }
});

const SceneImagePlaceholder = styled(Box)({
    width: '280px', // ✅ Même taille que l'image
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(184, 134, 11, 0.05))', // ✅ Gradient plus sexy
    borderRadius: '16px',
    marginBottom: '12px',
    border: '3px solid rgba(218, 165, 32, 0.3)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
});

const TagChip = styled(Chip)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
    color: '#F4D03F',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    margin: '3px',
    fontSize: '0.85rem',
    fontWeight: 500,
    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
    }
});

// =================== MODAL STYLES ===================

const DetailModal = styled(Modal)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const DetailModalContent = styled(Box)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    width: '90vw',
    maxWidth: '900px',
    maxHeight: '90vh',
    minWidth: '600px',
    overflow: 'auto',
    outline: 'none',
    position: 'relative',
});

const DetailHeader = styled(Box)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(42, 42, 42, 0.8))',
    padding: '24px',
    borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '20px 20px 0 0',
});

const DetailTitle = styled(Typography)({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    fontSize: '1.8rem',
    color: '#F4D03F',
});

const DetailImageContainer = styled(Box)({
    width: '100%',
    height: '350px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    margin: '24px 0',
    borderRadius: '12px',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.3)',
        zIndex: 0,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        height: '90%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '12px',
    }
});

// =================== MAIN COMPONENT ===================

const SuggestionsExploration = ({
                                    apiBaseUrl = "http://127.0.0.1:5000",
                                    onShowSurprise,
                                    onActriceClick,
                                    onSceneDetail,
                                    favorites = [],
                                    history = [],
                                    actrices = [],
                                    scenes = [],
                                    onToggleFavorite,
                                    onAddToHistory,
                                    onRemoveFromHistory,
                                    onOpenVideo
                                }) => {
    const [surprise, setSurprise] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedScene, setSelectedScene] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [actriceModalOpen, setActriceModalOpen] = useState(false);
    const [selectedActrice, setSelectedActrice] = useState(null)

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // ✅ Fonctions utilitaires
    const buildImageUrl = (imagePath) => {
        if (!imagePath) return null;
        try {
            if (imagePath.startsWith('http')) return imagePath;

            const pathParts = imagePath.split('/');
            if (pathParts.length >= 2) {
                const fileName = pathParts[pathParts.length - 1];
                const actriceName = pathParts[pathParts.length - 2];

                // ✅ CORRECTION : Décoder d'abord si déjà encodé, puis réencoder proprement
                const decodedActriceName = decodeURIComponent(actriceName);
                const decodedFileName = decodeURIComponent(fileName);

                const finalUrl = `${apiBaseUrl}/miniatures/${encodeURIComponent(decodedActriceName)}/${encodeURIComponent(decodedFileName)}`;
                console.log('🔗 URL image construite:', finalUrl);
                return finalUrl;
            }
        } catch (error) {
            console.error('Erreur construction URL image:', error);
        }
        return null;
    };

    const buildActriceImageUrl = (actrice) => {
        if (!actrice.photo) return null;
        try {
            const filename = actrice.photo.split('/').pop();

            // ✅ CORRECTION : Décoder d'abord si déjà encodé, puis réencoder proprement
            const decodedActriceName = decodeURIComponent(actrice.nom);
            const decodedFileName = decodeURIComponent(filename);

            const finalUrl = `${apiBaseUrl}/images/${encodeURIComponent(decodedActriceName)}/${encodeURIComponent(decodedFileName)}`;
            console.log('🔗 URL actrice construite:', finalUrl);
            return finalUrl;
        } catch (error) {
            console.error('Erreur construction URL actrice:', error);
        }
        return null;
    };

    const isFavorite = (sceneId) => favorites.some(fav => fav.scene_id === sceneId);
    const isInHistory = (sceneId) => history.some(hist => hist.scene_id === sceneId);
    const getViewCount = (sceneId) => {
        const historyEntry = history.find(hist => hist.scene_id === sceneId);
        return historyEntry?.nb_vues || 0;
    };

    // ✅ Récupérer une surprise
    const handleSurpriseClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiBaseUrl}/api/surprends_moi`);
            setSurprise(response.data);
            onShowSurprise?.(response.data);
            showSnackbar(response.data.message || "Nouvelle surprise découverte ! 🎲");
        } catch (error) {
            console.error('Erreur surprise:', error);
            showSnackbar("Erreur lors de la récupération de la surprise", 'error');
        } finally {
            setLoading(false);
        }
    };

    // ✅ NOUVEAU : Ouvrir le modal de détail de scène
    const handleOpenDetailModal = async () => {
        if (!surprise) return;

        try {
            // Charger les détails complets de la scène depuis l'API
            const response = await axios.get(`${apiBaseUrl}/api/scenes/${surprise.id}`);
            const sceneDetail = response.data;

            setSelectedScene({ ...sceneDetail, type: 'scene' });
            setDetailModalOpen(true);

        } catch (error) {
            console.error('❌ Erreur chargement détails scène:', error);
            // En cas d'erreur, utiliser les données de base
            setSelectedScene({ ...surprise, type: 'scene' });
            setDetailModalOpen(true);
        }
    };

    // ✅ NOUVEAU : Gestion des actions sur scène
    const handleToggleFavorite = async (scene, event) => {
        event?.stopPropagation();

        try {
            const isFav = favorites.some(fav => fav.scene_id === scene.id);

            if (isFav) {
                await axios.delete(`${apiBaseUrl}/api/favorites/scene/${scene.id}`);
                onToggleFavorite?.(scene, false);
                showSnackbar('Supprimé des favoris');
            } else {
                await axios.post(`${apiBaseUrl}/api/favorites`, { scene_id: scene.id });
                onToggleFavorite?.(scene, true);
                showSnackbar('Ajouté aux favoris');
            }
        } catch (err) {
            console.error('Erreur toggle favorite:', err);
            showSnackbar(`Erreur: ${err.response?.data?.error || err.message}`, 'error');
        }
    };

    const handleAddToHistory = async (sceneId) => {
        try {
            const response = await axios.post(`${apiBaseUrl}/api/history`, {
                scene_id: sceneId,
                note_session: 4.5
            });

            const responseData = response.data;
            onAddToHistory?.(sceneId, responseData);

            if (responseData.is_new) {
                showSnackbar(`Première vue enregistrée ! 🆕`);
            } else {
                showSnackbar(`Vue #${responseData.nb_vues} enregistrée ! 🎬`);
            }

        } catch (error) {
            console.error('Erreur ajout historique:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const handleRemoveFromHistory = async (sceneId) => {
        try {
            await axios.delete(`${apiBaseUrl}/api/history/scene/${sceneId}`);
            onRemoveFromHistory?.(sceneId);
            showSnackbar('Supprimé de l\'historique');
        } catch (error) {
            console.error('Erreur suppression historique:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const handleOpenVideo = async (scene) => {
        try {
            if (!scene.chemin) {
                showSnackbar('Aucun chemin vidéo défini pour cette scène', 'error');
                return;
            }

            const response = await axios.post(`${apiBaseUrl}/api/scenes/open-video`, {
                chemin: scene.chemin,
                scene_id: scene.id
            });

            if (response.data.success) {
                console.log('✅ Vidéo ouverte:', scene.titre);
                showSnackbar(`Vidéo "${scene.titre}" ouverte avec succès`);
                onOpenVideo?.(scene);
            } else {
                showSnackbar('Erreur lors de l\'ouverture de la vidéo', 'error');
            }
        } catch (error) {
            console.error('Erreur ouverture vidéo:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    // ✅ NOUVEAU : Gestion clic actrice
    const handleActriceClick = async (actrice) => {
        console.log('🎭 Clic sur actrice:', actrice);

        try {
            // ✅ CORRECTION : Chercher l'actrice par nom dans la liste des actrices
            const actriceName = actrice.nom || surprise.actrices?.[0];
            console.log('🔍 Nom actrice à chercher:', actriceName);

            if (!actriceName) {
                console.log('❌ Pas de nom actrice trouvé');
                return;
            }

            // Chercher l'actrice dans la liste actrices par nom
            const actriceFromList = actrices.find(a => a.nom === actriceName);
            console.log('👤 Actrice trouvée dans la liste:', actriceFromList);

            if (!actriceFromList || !actriceFromList.id) {
                console.log('❌ Actrice non trouvée dans la liste ou sans ID');
                // Utiliser les données de base disponibles
                setSelectedActrice({
                    nom: actriceName,
                    photo: actrice.photo,
                    type: 'actrice'
                });
                setActriceModalOpen(true);
                return;
            }

            // Charger les détails complets de l'actrice depuis l'API
            const response = await axios.get(`${apiBaseUrl}/api/actrices/${actriceFromList.id}`);
            const actriceDetail = response.data;

            console.log('📝 Données actrice reçues de l\'API:', actriceDetail);

            setSelectedActrice({ ...actriceDetail, type: 'actrice' });
            setActriceModalOpen(true);

        } catch (error) {
            console.error('❌ Erreur chargement détails actrice:', error);
            // En cas d'erreur, utiliser les données de base
            setSelectedActrice({
                nom: actrice.nom || surprise.actrices?.[0] || 'Actrice inconnue',
                photo: actrice.photo,
                type: 'actrice'
            });
            setActriceModalOpen(true);
        }
    };

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setSelectedScene(null);
    };

    const handleCloseActriceDetail = () => {
        setActriceModalOpen(false);
        setSelectedActrice(null);
    };

    return (
        <SuggestionsContainer>
            <Typography
                variant="h5"
                sx={{
                    color: '#F4D03F',
                    textAlign: 'center',
                    mb: 2,
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 600
                }}
            >
                🎲 Ta surprise du jour
            </Typography>

            <SurpriseButton
                onClick={handleSurpriseClick}
                disabled={loading}
            >
                {loading ? '🎯 Recherche en cours...' : '✨ Surprends-moi !'}
            </SurpriseButton>

            {surprise && (
                <Fade in={true} timeout={800}>
                    <SurpriseCard>
                        <CardContent sx={{ p: 3 }}>
                            {/* ✅ DESIGN ORIGINAL : Layout en 2 colonnes OPTIMISÉ */}
                            <Box sx={{
                                display: 'flex',
                                gap: 2, // ✅ Réduction du gap
                                alignItems: 'stretch', // ✅ Hauteur égale
                                minHeight: '400px', // ✅ Hauteur minimale pour éviter l'espace vide
                                '@media (max-width: 768px)': {
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minHeight: 'auto'
                                }
                            }}>
                                {/* ✅ SECTION ACTRICE (Colonne de gauche) */}
                                <ActriceSection onClick={() => handleActriceClick(surprise.actrices_data?.[0])}>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            color: '#DAA520',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            letterSpacing: '1.5px',
                                            display: 'block',
                                            marginBottom: '12px'
                                        }}
                                    >
                                        ACTRICE VEDETTE
                                    </Typography>

                                    {surprise.actrices_data?.[0]?.photo ? (
                                        <ActriceImage
                                            sx={{
                                                backgroundImage: `url("${buildActriceImageUrl(surprise.actrices_data[0])}")`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                    ) : (
                                        <ActriceImagePlaceholder>
                                            <Person sx={{ fontSize: '4rem', color: '#DAA520', opacity: 0.6 }} />
                                        </ActriceImagePlaceholder>
                                    )}

                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: '#F4D03F',
                                            fontWeight: 600,
                                            fontSize: '1.3rem', // ✅ Taille plus compacte
                                            fontFamily: '"Playfair Display", serif',
                                            lineHeight: 1.1, // ✅ Interligne plus serré
                                            marginTop: '8px' // ✅ Marge réduite
                                        }}
                                    >
                                        {surprise.actrices?.[0] || 'Actrice mystère'}
                                    </Typography>
                                </ActriceSection>

                                {/* ✅ SECTION SCÈNE (Colonne de droite) */}
                                <SceneSection>
                                    {/* ✅ LAYOUT HORIZONTAL : Image à gauche, infos à droite */}
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2.5,
                                        alignItems: 'flex-start',
                                        mb: 2
                                    }}>
                                        {/* ✅ IMAGE DE LA SCÈNE À GAUCHE */}
                                        {surprise.image ? (
                                            <Box sx={{ flexShrink: 0 }}>
                                                <SceneImage
                                                    sx={{
                                                        backgroundImage: `url("${buildImageUrl(surprise.image)}")`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{ flexShrink: 0 }}>
                                                <SceneImagePlaceholder>
                                                    <Movie sx={{ fontSize: '3rem', color: '#DAA520', opacity: 0.6 }} />
                                                    <Typography sx={{ color: '#888', mt: 1, fontSize: '0.8rem' }}>
                                                        Aucune image
                                                    </Typography>
                                                </SceneImagePlaceholder>
                                            </Box>
                                        )}

                                        {/* ✅ INFOS À DROITE DE L'IMAGE */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="h3"
                                                sx={{
                                                    color: '#F4D03F',
                                                    mb: 1.5,
                                                    fontFamily: '"Playfair Display", serif',
                                                    fontWeight: 600,
                                                    fontSize: '2rem',
                                                    lineHeight: 1.1
                                                }}
                                            >
                                                {surprise.titre}
                                            </Typography>

                                            {/* Chips avec informations principales */}
                                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                                <Chip
                                                    label={`⏱️ ${surprise.duree}min`}
                                                    sx={{
                                                        background: 'rgba(76, 175, 80, 0.2)',
                                                        color: '#4CAF50',
                                                        border: '1px solid rgba(76, 175, 80, 0.3)',
                                                        fontWeight: 600
                                                    }}
                                                />
                                                <Chip
                                                    label={`📺 ${surprise.qualite}`}
                                                    sx={{
                                                        background: 'rgba(33, 150, 243, 0.2)',
                                                        color: '#2196F3',
                                                        border: '1px solid rgba(33, 150, 243, 0.3)',
                                                        fontWeight: 600
                                                    }}
                                                />
                                                {surprise.note && (
                                                    <Chip
                                                        label={`⭐ ${surprise.note}/5`}
                                                        sx={{
                                                            background: 'rgba(255, 193, 7, 0.2)',
                                                            color: '#FFC107',
                                                            border: '1px solid rgba(255, 193, 7, 0.3)',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Tags */}
                                            {surprise.tags && surprise.tags.length > 0 && (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                                    {surprise.tags.slice(0, 10).map((tag, index) => (
                                                        <TagChip key={index} label={tag} size="small" />
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Studio et Site */}
                                            <Box sx={{ mb: 1.5 }}>
                                                {surprise.studio && (
                                                    <Typography variant="body1" sx={{ color: '#ccc', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
                                                        🏢 Studio : <Box component="span" sx={{ color: '#DAA520', fontWeight: 600 }}>{surprise.studio}</Box>
                                                    </Typography>
                                                )}
                                                {surprise.site && (
                                                    <Typography variant="body1" sx={{ color: '#ccc', display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
                                                        🌐 Site : <Box component="span" sx={{ color: '#4FC3F7', fontWeight: 600 }}>{surprise.site}</Box>
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Synopsis en pleine largeur sous l'image et les infos */}
                                    {surprise.synopsis && (
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#ccc',
                                                mb: 2,
                                                fontStyle: 'italic',
                                                lineHeight: 1.5,
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            {surprise.synopsis}
                                        </Typography>
                                    )}

                                    {/* Bouton pour voir la fiche complète */}
                                    <Box sx={{ mt: 'auto' }}>
                                        <Button
                                            onClick={handleOpenDetailModal}
                                            sx={{
                                                background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                                                color: '#000',
                                                fontWeight: 600,
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: '10px',
                                                fontSize: '0.95rem',
                                                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)'
                                                }
                                            }}
                                        >
                                            ▶️ Voir la fiche complète
                                        </Button>
                                    </Box>
                                </SceneSection>
                            </Box>
                        </CardContent>
                    </SurpriseCard>
                </Fade>
            )}

            {/* ✅ Modal de détail complet (inchangé) */}
            <DetailModal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={detailModalOpen}>
                    <DetailModalContent>
                        {selectedScene && (
                            <>
                                <DetailHeader>
                                    <DetailTitle>
                                        {selectedScene.titre}
                                    </DetailTitle>
                                    <IconButton
                                        onClick={handleCloseDetail}
                                        sx={{
                                            color: '#B8860B',
                                            '&:hover': {
                                                color: '#DAA520',
                                                background: 'rgba(218, 165, 32, 0.1)'
                                            }
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </DetailHeader>

                                <Box sx={{ padding: '24px' }}>
                                    <DetailImageContainer
                                        sx={{
                                            backgroundImage: selectedScene.image
                                                ? `url("${buildImageUrl(selectedScene.image)}")`
                                                : 'none'
                                        }}
                                    />

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h5" sx={{ color: '#F4D03F', mb: 2 }}>
                                            {selectedScene.titre}
                                        </Typography>

                                        {selectedScene.synopsis && (
                                            <Typography variant="body1" sx={{ color: '#ccc', mb: 2, fontStyle: 'italic' }}>
                                                {selectedScene.synopsis}
                                            </Typography>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                                            {selectedScene.duree && (
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    ⏱️ {selectedScene.duree} minutes
                                                </Typography>
                                            )}
                                            {selectedScene.qualite && (
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    📺 {selectedScene.qualite}
                                                </Typography>
                                            )}
                                            {selectedScene.date_scene && (
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    📅 {new Date(selectedScene.date_scene).toLocaleDateString('fr-FR')}
                                                </Typography>
                                            )}
                                        </Box>

                                        {selectedScene.note_perso && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <Rating
                                                    value={parseFloat(selectedScene.note_perso) || 0}
                                                    readOnly
                                                    size="large"
                                                    sx={{
                                                        '& .MuiRating-iconFilled': {
                                                            color: '#DAA520',
                                                        },
                                                        '& .MuiRating-iconEmpty': {
                                                            color: 'rgba(218, 165, 32, 0.3)',
                                                        }
                                                    }}
                                                />
                                                <Typography variant="body1" sx={{ color: '#F4D03F', ml: 1 }}>
                                                    {selectedScene.note_perso}/5
                                                </Typography>
                                            </Box>
                                        )}

                                        {selectedScene.actrices && selectedScene.actrices.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Actrices
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedScene.actrices.map((actrice) => (
                                                        <Chip
                                                            key={actrice.id}
                                                            label={actrice.nom}
                                                            size="small"
                                                            icon={<Person />}
                                                            onClick={() => handleActriceClick(actrice)}
                                                            sx={{
                                                                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
                                                                color: '#F4D03F',
                                                                border: '1px solid rgba(218, 165, 32, 0.3)',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {selectedScene.tags && selectedScene.tags.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Tags
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedScene.tags.map((tag) => (
                                                        <TagChip
                                                            key={tag.id || tag}
                                                            label={tag.nom || tag}
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                                            {selectedScene.studio && (
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    🏢 {selectedScene.studio}
                                                </Typography>
                                            )}
                                            {selectedScene.site && (
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    🌐 {selectedScene.site}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* ✅ Actions en bas du modal */}
                                    <Box sx={{
                                        mt: 4,
                                        pt: 3,
                                        borderTop: '1px solid rgba(218, 165, 32, 0.2)',
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <Button
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleOpenVideo(selectedScene)}
                                            sx={{
                                                background: 'linear-gradient(135deg, #4CAF50, #45A049)',
                                                color: '#fff',
                                                fontWeight: 600,
                                                px: 3,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #5CBF60, #4CAF50)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            📹 Lire la vidéo
                                        </Button>

                                        <Button
                                            startIcon={isFavorite(selectedScene.id) ? <Remove /> : <Add />}
                                            onClick={(e) => handleToggleFavorite(selectedScene, e)}
                                            sx={{
                                                background: 'linear-gradient(135deg, #FF6B9D, #FF5722)',
                                                color: '#fff',
                                                fontWeight: 600,
                                                px: 3,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #FF7BAD, #FF6B9D)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            {isFavorite(selectedScene.id)
                                                ? 'Retirer des favoris'
                                                : 'Ajouter aux favoris'
                                            }
                                        </Button>

                                        <Button
                                            startIcon={<Visibility />}
                                            onClick={() => handleAddToHistory(selectedScene.id)}
                                            sx={{
                                                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                                color: '#fff',
                                                fontWeight: 600,
                                                px: 3,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #42A5F5, #2196F3)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            {isInHistory(selectedScene.id) ?
                                                `👁️ Revoir (Vue ${getViewCount(selectedScene.id) || 1} fois)` :
                                                '👁️ Marquer comme vue'
                                            }
                                        </Button>

                                        {isInHistory(selectedScene.id) && (
                                            <Button
                                                startIcon={<Delete />}
                                                onClick={() => handleRemoveFromHistory(selectedScene.id)}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #90CAF9, #2196F3)',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #BBDEFB, #90CAF9)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                Supprimer de l'historique
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        )}
                    </DetailModalContent>
                </Fade>
            </DetailModal>

            {/* ✅ MODAL ACTRICE - EXACTEMENT COMME ADMININTERFACE */}
            <DetailModal
                open={actriceModalOpen}
                onClose={handleCloseActriceDetail}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={actriceModalOpen}>
                    <DetailModalContent>
                        {selectedActrice && (
                            <>
                                <DetailHeader>
                                    <DetailTitle>
                                        {selectedActrice.nom}
                                    </DetailTitle>
                                    <IconButton
                                        onClick={handleCloseActriceDetail}
                                        sx={{
                                            color: '#B8860B',
                                            '&:hover': {
                                                color: '#DAA520',
                                                background: 'rgba(218, 165, 32, 0.1)'
                                            }
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </DetailHeader>

                                <Box sx={{ padding: '24px' }}>
                                    {/* Photo de l'actrice avec effet flouté */}
                                    <DetailImageContainer
                                        sx={{
                                            backgroundImage: selectedActrice.photo ? `url("${buildActriceImageUrl(selectedActrice)}")` : 'none',
                                            height: '300px'
                                        }}
                                    >
                                        {!selectedActrice.photo && (
                                            <Person sx={{
                                                fontSize: '6rem',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: '#DAA520',
                                                opacity: 0.6,
                                                zIndex: 4
                                            }} />
                                        )}
                                    </DetailImageContainer>

                                    {/* Informations en grille comme AdminInterface */}
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 4,
                                        mb: 3
                                    }}>
                                        {/* Colonne gauche - Informations personnelles */}
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Informations personnelles
                                            </Typography>

                                            {/* Nom */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Nom
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: '#F4D03F', fontWeight: 600 }}>
                                                    {selectedActrice.nom}
                                                </Typography>
                                            </Box>

                                            {/* Nationalité */}
                                            {selectedActrice.nationalite ? (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                        Nationalité
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        🌍 {selectedActrice.nationalite} 🇺🇸
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                        Nationalité
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Non renseignée
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Date de naissance */}
                                            {selectedActrice.date_naissance ? (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                        Date de naissance
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        📅 {new Date(selectedActrice.date_naissance).toLocaleDateString('fr-FR')}
                                                        ({new Date().getFullYear() - new Date(selectedActrice.date_naissance).getFullYear()} ans)
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                        Date de naissance
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Non renseignée
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Note moyenne */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Note moyenne
                                                </Typography>
                                                {selectedActrice.note_moyenne ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Rating
                                                            value={selectedActrice.note_moyenne}
                                                            readOnly
                                                            size="small"
                                                            sx={{
                                                                '& .MuiRating-iconFilled': { color: '#DAA520' },
                                                                '& .MuiRating-iconEmpty': { color: 'rgba(218, 165, 32, 0.3)' }
                                                            }}
                                                        />
                                                        <Typography variant="body1" sx={{ color: '#F4D03F', fontWeight: 600 }}>
                                                            {selectedActrice.note_moyenne}/5
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Aucune note
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Dernière vue */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Dernière vue
                                                </Typography>
                                                {selectedActrice.derniere_vue ? (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        🕐 {new Date(selectedActrice.derniere_vue).toLocaleDateString('fr-FR')}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Jamais vue
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Tags typiques */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Tags typiques
                                                </Typography>
                                                {selectedActrice.tags_typiques ? (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selectedActrice.tags_typiques.split(',').slice(0, 8).map((tag, index) => (
                                                            <TagChip
                                                                key={index}
                                                                label={tag.trim()}
                                                                size="small"
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Aucun tag typique
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Colonne droite - Statistiques */}
                                        <Box>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Statistiques
                                            </Typography>

                                            {/* Nombre de scènes */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Nombre de scènes
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    🎬 {selectedActrice.nb_scenes || selectedActrice.scenes?.length || '1'} scène{((selectedActrice.nb_scenes || selectedActrice.scenes?.length || 1) > 1) ? 's' : ''}
                                                </Typography>
                                            </Box>

                                            {/* Vues totales */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Vues totales
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    {(() => {
                                                        if (!selectedActrice.scenes || !history || selectedActrice.scenes.length === 0) {
                                                            return <span style={{ color: '#888', fontStyle: 'italic' }}>Non calculé</span>;
                                                        }

                                                        // ✅ CORRECTION : Utiliser les IDs des scènes de l'actrice
                                                        const sceneIds = selectedActrice.scenes.map(scene => scene.id);

                                                        const totalVues = sceneIds.reduce((total, sceneId) => {
                                                            const sceneHistory = history.filter(h => h.scene_id === sceneId);
                                                            if (sceneHistory.length > 0) {
                                                                const vues = sceneHistory[0].nb_vues || sceneHistory.length;
                                                                return total + vues;
                                                            }
                                                            return total;
                                                        }, 0);

                                                        return `👁️ ${totalVues} vue${totalVues > 1 ? 's' : ''}`;
                                                    })()}
                                                </Typography>
                                            </Box>

                                            {/* Première apparition */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Première apparition
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    {(() => {
                                                        if (!selectedActrice.scenes || selectedActrice.scenes.length === 0) {
                                                            return <span style={{ color: '#888', fontStyle: 'italic' }}>Non renseignée</span>;
                                                        }

                                                        // ✅ CORRECTION : Utiliser la liste complète des scènes
                                                        const sceneIds = selectedActrice.scenes.map(scene => scene.id);
                                                        const scenesWithDates = scenes.filter(scene => sceneIds.includes(scene.id));

                                                        const dates = scenesWithDates
                                                            .map(scene => scene.date_ajout || scene.date_scene)
                                                            .filter(date => date)
                                                            .map(date => new Date(date));

                                                        if (dates.length === 0) {
                                                            return <span style={{ color: '#888', fontStyle: 'italic' }}>Non renseignée</span>;
                                                        }

                                                        const premiereDate = new Date(Math.min(...dates));
                                                        return `📅 ${premiereDate.toLocaleDateString('fr-FR')}`;
                                                    })()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Biographie */}
                                    {selectedActrice.biographie ? (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Biographie
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#ccc',
                                                fontStyle: 'italic',
                                                lineHeight: 1.6,
                                                background: 'rgba(42, 42, 42, 0.4)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(218, 165, 32, 0.2)'
                                            }}>
                                                {selectedActrice.biographie}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Biographie
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                Aucune biographie renseignée
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Commentaire personnel */}
                                    {selectedActrice.commentaire && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Commentaire
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                color: '#ccc',
                                                fontStyle: 'italic',
                                                lineHeight: 1.6,
                                                background: 'rgba(42, 42, 42, 0.4)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(218, 165, 32, 0.2)'
                                            }}>
                                                💭 {selectedActrice.commentaire}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Photo path (comme dans AdminInterface) */}
                                    {selectedActrice.photo && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                Photo (ActriceName/filename.jpg)
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: '#888',
                                                fontFamily: 'monospace',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem'
                                            }}>
                                                {selectedActrice.photo}
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Scènes de l'actrice */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                            Scènes de {selectedActrice.nom}
                                        </Typography>
                                        {selectedActrice.scenes && selectedActrice.scenes.length > 0 ? (
                                            <Box sx={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 1,
                                                maxHeight: '120px',
                                                overflowY: 'auto'
                                            }}>
                                                {selectedActrice.scenes.map((scene, index) => (
                                                    <Chip
                                                        key={scene.id || index}
                                                        label={scene.titre || `Scène ${index + 1}`}
                                                        onClick={async () => {
                                                            handleCloseActriceDetail();

                                                            setTimeout(async () => {
                                                                try {
                                                                    // Charger les détails complets depuis l'API comme pour les autres scènes
                                                                    const response = await axios.get(`${apiBaseUrl}/api/scenes/${scene.id}`);
                                                                    const sceneDetail = response.data;

                                                                    setSelectedScene({ ...sceneDetail, type: 'scene' });
                                                                    setDetailModalOpen(true);
                                                                } catch (error) {
                                                                    console.error('❌ Erreur chargement détails scène:', error);
                                                                    // Fallback avec les données disponibles
                                                                    setSelectedScene({
                                                                        ...scene,
                                                                        type: 'scene',
                                                                        image: scene.image || null,
                                                                        actrices: scene.actrices || [selectedActrice],
                                                                        tags: scene.tags || []
                                                                    });
                                                                    setDetailModalOpen(true);
                                                                }
                                                            }, 100);
                                                        }}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
                                                            color: '#F4D03F',
                                                            border: '1px solid rgba(218, 165, 32, 0.3)',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Chip
                                                label="Voir toutes ses scènes"
                                                onClick={() => {
                                                    console.log('Voir toutes les scènes de', selectedActrice.nom);
                                                    handleCloseActriceDetail();
                                                }}
                                                sx={{
                                                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
                                                    color: '#F4D03F',
                                                    border: '1px solid rgba(218, 165, 32, 0.3)',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                                                    }
                                                }}
                                            />
                                        )}
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{
                                        mt: 4,
                                        pt: 3,
                                        borderTop: '1px solid rgba(218, 165, 32, 0.2)',
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'center',
                                        flexWrap: 'wrap'
                                    }}>
                                        <Button
                                            onClick={handleCloseActriceDetail}
                                            sx={{
                                                background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                                                color: '#000',
                                                fontWeight: 600,
                                                px: 3,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            ✨ Fermer
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </DetailModalContent>
                </Fade>
            </DetailModal>

            {/* ✅ Snackbar pour les notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        background: snackbar.severity === 'success'
                            ? 'linear-gradient(135deg, #DAA520, #B8860B)'
                            : undefined,
                        color: snackbar.severity === 'success' ? '#000' : undefined,
                        fontWeight: 500,
                        borderRadius: '12px',
                        border: '1px solid rgba(218, 165, 32, 0.3)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </SuggestionsContainer>
    );
};

export default SuggestionsExploration;