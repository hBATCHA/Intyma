import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Fade,
    Grow,
    Modal,
    Backdrop,
    Rating,
    IconButton,
    Chip,
    Snackbar
} from '@mui/material';
import {
    PlayCircleOutline,
    Favorite,
    FavoriteBorder,
    Visibility,
    AccessTime,
    Person,
    HighQuality,
    CalendarMonth,
    PlayArrow,
    Movie,
    Close,
    Add,
    Remove,
    Delete
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from "axios";
import SceneSearchAndFilters from './SceneSearchAndFilters';
import SuggestionsExploration from './SuggestionsExploration';
import {
    generateSceneFavHistoryBadges,
    generateSceneBadges,
    generateSceneTagsBadges,
    SceneFavHistoryBadge,
    SceneInfoBadge,
    SceneBadgeContainer,
    SceneTagsBadgeContainer,
    SceneBadgeWithTooltip
} from './SceneBadgesSystem';

// =================== ANIMATIONS ===================

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
`;

// =================== STYLED COMPONENTS ===================

const PageContainer = styled(Container)({
    background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #2D1810 50%, #1A1A1A 75%, #0F0F0F 100%)',
    minHeight: '100vh',
    paddingTop: '40px',
    paddingBottom: '40px',
    position: 'relative',
    maxWidth: 'none !important',
    width: '100vw',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center top, rgba(218, 165, 32, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    }
});

const PageTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    marginBottom: '16px',
    color: '#F5E6D3',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
    '&::after': {
        content: '""',
        display: 'block',
        width: '100px',
        height: '3px',
        background: 'linear-gradient(90deg, #DAA520, #B8860B)',
        margin: '20px auto 0',
        borderRadius: '2px'
    }
}));

const PageSubtitle = styled(Typography)({
    color: '#CD853F',
    fontSize: '1.1rem',
    textAlign: 'center',
    marginBottom: '40px',
    fontStyle: 'italic',
    fontWeight: 300,
});

const ControlsBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '16px 24px',
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
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
    },
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
    }
}));

const ResultsInfo = styled(Box)({
    color: '#DAA520',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const SortSelect = styled(FormControl)({
    minWidth: 120,
    '& .MuiInputBase-root': {
        color: '#fff',
        background: 'rgba(26, 26, 26, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(218, 165, 32, 0.3)',
        fontSize: '0.9rem',
        '&:hover': {
            borderColor: 'rgba(218, 165, 32, 0.5)',
        },
        '&.Mui-focused': {
            borderColor: '#DAA520',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.3)',
        }
    },
    '& .MuiInputLabel-root': {
        color: '#B8860B',
        fontSize: '0.9rem',
        '&.Mui-focused': {
            color: '#DAA520',
        }
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        }
    }
});

const CompactCard = styled(Box)({
    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    color: '#fff',
    height: '420px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #DAA520, #F4D03F, #DAA520)',
    },
    '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: '#DAA520',
        boxShadow: '0 12px 30px rgba(218, 165, 32, 0.3), 0 6px 15px rgba(0,0,0,0.4)',
        animation: `${floatAnimation} 3s ease-in-out infinite`,
        '&::before': {
            height: '4px',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.5)',
        }
    }
});

const CompactImageContainer = styled(Box)({
    width: '100%',
    height: '200px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px 12px 0 0',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.3)',
        zIndex: 0,
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '95%',
        height: '95%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    },
    '&:hover::after': {
        transform: 'translate(-50%, -50%) scale(1.05)',
    }
});

const CompactCardContent = styled(Box)({
    padding: '16px 16px 20px 16px',
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
});

const CompactTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    color: '#F4D03F',
    marginBottom: '8px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const CompactSubtitle = styled(Typography)({
    color: '#B8860B',
    fontSize: '0.8rem',
    marginBottom: '8px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const PlaceholderIcon = styled(Movie)({
    fontSize: '3rem',
    color: 'rgba(218, 165, 32, 0.4)',
    opacity: 0.6,
});

const StyledChip = styled(Chip)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
    color: '#F4D03F',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    fontWeight: 500,
    fontSize: '0.8rem',
    margin: '2px',
    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
        borderColor: '#DAA520',
    }
});

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
    maxWidth: '800px',
    maxHeight: '95vh',
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
    height: '300px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    margin: '24px 0',
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

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    color: '#DAA520'
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
});

const PaginationContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
    '& .MuiPagination-root': {
        '& .MuiPaginationItem-root': {
            color: '#B8860B',
            borderColor: 'rgba(218, 165, 32, 0.3)',
            '&:hover': {
                backgroundColor: 'rgba(218, 165, 32, 0.1)',
                borderColor: '#DAA520',
            },
            '&.Mui-selected': {
                backgroundColor: '#DAA520',
                color: '#000',
                fontWeight: 600,
                '&:hover': {
                    backgroundColor: '#B8860B',
                }
            }
        }
    }
});

// =================== CUSTOM HOOK POUR PAGINATION STABLE ===================

const usePaginationState = (initialPage = 1) => {
    // 🔑 SOLUTION: Utiliser un reducer au lieu de useState
    const [state, dispatch] = React.useReducer(
        (prevState, action) => {
            console.log('🔄 Pagination Reducer:', action.type, 'payload:', action.payload, 'previous:', prevState.page);

            switch (action.type) {
                case 'SET_PAGE':
                    // Empêcher les changements non-intentionnels
                    if (action.source === 'user' || prevState.page === initialPage) {
                        return { ...prevState, page: action.payload, lastUpdate: Date.now() };
                    }
                    return prevState;

                case 'RESET_PAGE':
                    return { ...prevState, page: 1, lastUpdate: Date.now() };

                case 'INIT':
                    return { page: initialPage, lastUpdate: Date.now() };

                default:
                    return prevState;
            }
        },
        { page: initialPage, lastUpdate: Date.now() }
    );

    const setPage = useCallback((page, source = 'auto') => {
        dispatch({ type: 'SET_PAGE', payload: page, source });
    }, []);

    const resetPage = useCallback(() => {
        dispatch({ type: 'RESET_PAGE' });
    }, []);

    return [state.page, setPage, resetPage];
};

// =================== MAIN COMPONENT ===================

const Decouvrir = ({ apiBaseUrl = "http://127.0.0.1:5000" }) => {
    // États principaux
    const [scenes, setScenes] = useState([]);
    const [filteredScenes, setFilteredScenes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);
    const [actresses, setActresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔑 SOLUTION: Pagination avec custom hook + reducer
    const [currentPage, setCurrentPage, resetCurrentPage] = usePaginationState(1);
    const [sortBy, setSortBy] = useState('date_ajout_desc');
    const scenesPerPage = 24;

    // États pour le modal et notifications
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [actriceModalOpen, setActriceModalOpen] = useState(false);
    const [selectedActrice, setSelectedActrice] = useState(null);

    // Refs pour éviter les effets de bord
    const hasMounted = useRef(false);
    const isFilterChange = useRef(false);

    // 🔑 SOLUTION: Chargement initial une seule fois avec useLayoutEffect
    React.useLayoutEffect(() => {
        if (hasMounted.current) return;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [scenesRes, favoritesRes, historyRes, actressesRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/scenes`),
                    axios.get(`${apiBaseUrl}/api/favorites`).catch(() => ({ data: [] })),
                    axios.get(`${apiBaseUrl}/api/history`).catch(() => ({ data: [] })),
                    axios.get(`${apiBaseUrl}/api/actrices`).catch(() => ({ data: [] }))
                ]);

                setScenes(scenesRes.data);
                setFilteredScenes(scenesRes.data);
                setFavorites(favoritesRes.data);
                setHistory(historyRes.data);
                setActresses(actressesRes.data);

                hasMounted.current = true;

            } catch (err) {
                console.error('Erreur chargement données:', err);
                setError('Impossible de charger les scènes');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // Dépendances vides + useLayoutEffect

    // Tri des scènes avec mémoisation stable
    const sortedScenes = useMemo(() => {
        if (!filteredScenes.length) return [];

        const scenesToSort = [...filteredScenes];

        switch (sortBy) {
            case 'date_ajout_desc':
                return scenesToSort.sort((a, b) => new Date(b.date_ajout || 0) - new Date(a.date_ajout || 0));
            case 'date_ajout_asc':
                return scenesToSort.sort((a, b) => new Date(a.date_ajout || 0) - new Date(b.date_ajout || 0));
            case 'note_desc':
                return scenesToSort.sort((a, b) => {
                    const noteA = parseFloat(a.note_perso) || 0;
                    const noteB = parseFloat(b.note_perso) || 0;
                    return noteB - noteA;
                });
            case 'titre_asc':
                return scenesToSort.sort((a, b) => (a.titre || '').localeCompare(b.titre || ''));
            case 'duree_desc':
                return scenesToSort.sort((a, b) => (b.duree || 0) - (a.duree || 0));
            default:
                return scenesToSort;
        }
    }, [filteredScenes, sortBy]);

    // 🔑 SOLUTION: Pagination calculée de manière ultra-stable
    const paginationInfo = useMemo(() => {
        const totalItems = sortedScenes.length;
        const totalPages = Math.ceil(totalItems / scenesPerPage) || 1;

        // 🔑 Garantir que currentPage est valide
        const safePage = Math.min(Math.max(1, currentPage), totalPages);

        const startIndex = (safePage - 1) * scenesPerPage;
        const endIndex = Math.min(startIndex + scenesPerPage, totalItems);
        const currentScenes = sortedScenes.slice(startIndex, endIndex);

        return {
            totalPages,
            safePage,
            startIndex,
            endIndex,
            currentScenes,
            totalItems
        };
    }, [sortedScenes, currentPage, scenesPerPage]);

    // Fonctions utilitaires
    const buildImageUrl = (imagePath) => {
        if (!imagePath) return null;
        try {
            if (imagePath.startsWith('http')) return imagePath;
            const pathParts = imagePath.split('/');
            if (pathParts.length >= 2) {
                const fileName = pathParts[pathParts.length - 1];
                const actriceName = pathParts[pathParts.length - 2];
                return `${apiBaseUrl}/miniatures/${encodeURIComponent(actriceName)}/${encodeURIComponent(fileName)}`;
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
            return `${apiBaseUrl}/images/${encodeURIComponent(actrice.nom)}/${encodeURIComponent(filename)}`;
        } catch (error) {
            console.error('Erreur construction URL actrice:', error);
        }
        return null;
    };

    const getViewCount = (sceneId) => {
        const historyEntry = history.find(hist => hist.scene_id === sceneId);
        return historyEntry?.nb_vues || (history.filter(hist => hist.scene_id === sceneId).length) || 0;
    };

    const isFavorite = (sceneId) => favorites.some(fav => fav.scene_id === sceneId);
    const isInHistory = (sceneId) => history.some(hist => hist.scene_id === sceneId);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // 🔑 SOLUTION: Gestionnaires d'événements stables
    const handleCardClick = useCallback(async (scene) => {
        console.log('🖱️ Scène cliquée:', scene);

        try {
            // Charger les détails complets de la scène depuis l'API
            const response = await axios.get(`${apiBaseUrl}/api/scenes/${scene.id}`);
            const sceneDetail = response.data;

            setSelectedItem({ ...sceneDetail, type: 'scene' });
            setDetailModalOpen(true);

        } catch (error) {
            console.error('❌ Erreur chargement détails scène:', error);
            // En cas d'erreur, utiliser les données de base
            setSelectedItem({ ...scene, type: 'scene' });
            setDetailModalOpen(true);
        }
    }, [apiBaseUrl]);

    const handleToggleFavorite = useCallback(async (scene, event) => {
        event.stopPropagation();

        try {
            const isFav = favorites.some(fav => fav.scene_id === scene.id);

            if (isFav) {
                // Supprimer des favoris
                await axios.delete(`${apiBaseUrl}/api/favorites/scene/${scene.id}`);
                setFavorites(prev => prev.filter(fav => fav.scene_id !== scene.id));
                showSnackbar('Supprimé des favoris');
            } else {
                // Ajouter aux favoris
                await axios.post(`${apiBaseUrl}/api/favorites`, { scene_id: scene.id });
                setFavorites(prev => [...prev, { scene_id: scene.id, date_ajout: new Date() }]);
                showSnackbar('Ajouté aux favoris');
            }
        } catch (err) {
            console.error('Erreur toggle favorite:', err);
            showSnackbar(`Erreur: ${err.response?.data?.error || err.message}`, 'error');
        }
    }, [favorites, apiBaseUrl]);

    const addToHistory = useCallback(async (sceneId) => {
        try {
            const response = await axios.post(`${apiBaseUrl}/api/history`, {
                scene_id: sceneId,
                note_session: 4.5 // Note par défaut, vous pouvez ajuster
            });

            const responseData = response.data;

            // Mettre à jour l'état local avec le nouveau compteur
            if (responseData.is_new) {
                // Nouvelle entrée dans l'historique
                setHistory(prev => [...prev, {
                    scene_id: sceneId,
                    date_vue: new Date().toISOString().split('T')[0],
                    nb_vues: 1
                }]);
                showSnackbar(`Première vue enregistrée ! 🆕`);
            } else {
                // Incrémenter le compteur existant
                setHistory(prev => prev.map(hist =>
                    hist.scene_id === sceneId
                        ? { ...hist, nb_vues: responseData.nb_vues, date_vue: new Date().toISOString().split('T')[0] }
                        : hist
                ));
                showSnackbar(`Vue #${responseData.nb_vues} enregistrée ! 🎬`);
            }

        } catch (error) {
            console.error('Erreur ajout historique:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    }, [apiBaseUrl]);


    const removeFromHistory = useCallback(async (sceneId) => {
        try {
            await axios.delete(`${apiBaseUrl}/api/history/scene/${sceneId}`);
            setHistory(prev => prev.filter(hist => hist.scene_id !== sceneId));
            showSnackbar('Supprimé de l\'historique');
        } catch (error) {
            console.error('Erreur suppression historique:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    }, [apiBaseUrl]);

    const openVideoFile = useCallback(async (scene) => {
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
            } else {
                showSnackbar('Erreur lors de l\'ouverture de la vidéo', 'error');
            }
        } catch (error) {
            console.error('Erreur ouverture vidéo:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    }, [apiBaseUrl]);

    const handleCloseDetail = useCallback(() => {
        setDetailModalOpen(false);
        setSelectedItem(null);
    }, []);

    const handleCloseActriceDetail = useCallback(() => {
        setActriceModalOpen(false);
        setSelectedActrice(null);
    }, []);

    // 🔑 SOLUTION: Gestionnaire de filtres qui ne reset que lors de vrais changements
    const handleFilteredResults = useCallback((results) => {
        console.log('🔍 handleFilteredResults called with', results.length, 'scenes');

        setFilteredScenes(results);

        // Reset page seulement si c'est un vrai changement de filtre
        if (hasMounted.current && !isFilterChange.current) {
            console.log('🔄 Filter change detected, resetting to page 1');
            resetCurrentPage();
        }

        isFilterChange.current = false;
    }, [resetCurrentPage]);

    // 🔑 SOLUTION: Gestionnaire de tri stable
    const handleSortChange = useCallback((event) => {
        console.log('📊 Sort change:', event.target.value);
        setSortBy(event.target.value);
        resetCurrentPage();
    }, [resetCurrentPage]);

    // 🔑 SOLUTION: Gestionnaire de pagination ultra-stable
    const handlePageChange = useCallback((event, page) => {
        console.log('📄 USER CLICK: Page change to', page, 'from', currentPage);

        // Marquer explicitement que c'est un changement utilisateur
        setCurrentPage(page, 'user');

        // Scroll vers le haut après un délai
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    }, [currentPage, setCurrentPage]);

    const handleActriceClick = useCallback(async (actrice) => {
        console.log('🎭 Clic sur actrice:', actrice);

        try {
            // Chercher l'actrice dans la liste par nom si on n'a que le nom
            let actriceToLoad = actrice;

            if (!actrice.id && actrice.nom) {
                actriceToLoad = actresses.find(a => a.nom === actrice.nom);
            }

            if (!actriceToLoad || !actriceToLoad.id) {
                console.log('❌ Actrice non trouvée dans la liste ou sans ID');
                setSelectedActrice({
                    nom: actrice.nom || 'Actrice inconnue',
                    photo: actrice.photo,
                    type: 'actrice'
                });
                setActriceModalOpen(true);
                return;
            }

            // Charger les détails complets de l'actrice depuis l'API
            const response = await axios.get(`${apiBaseUrl}/api/actrices/${actriceToLoad.id}`);
            const actriceDetail = response.data;

            setSelectedActrice({ ...actriceDetail, type: 'actrice' });
            setActriceModalOpen(true);

        } catch (error) {
            console.error('❌ Erreur chargement détails actrice:', error);
            // En cas d'erreur, utiliser les données de base
            setSelectedActrice({
                nom: actrice.nom || 'Actrice inconnue',
                photo: actrice.photo,
                type: 'actrice'
            });
            setActriceModalOpen(true);
        }
    }, [actresses, apiBaseUrl]);

    // ✅ NOUVEAU : Mise à jour des données locales après actions depuis SuggestionsExploration
    const handleSuggestionToggleFavorite = useCallback((scene, isAdded) => {
        if (isAdded) {
            setFavorites(prev => [...prev, { scene_id: scene.id, date_ajout: new Date() }]);
        } else {
            setFavorites(prev => prev.filter(fav => fav.scene_id !== scene.id));
        }
    }, []);

    const handleSuggestionAddToHistory = useCallback((sceneId, responseData) => {
        if (responseData.is_new) {
            setHistory(prev => [...prev, {
                scene_id: sceneId,
                date_vue: new Date().toISOString().split('T')[0],
                nb_vues: 1
            }]);
        } else {
            setHistory(prev => prev.map(hist =>
                hist.scene_id === sceneId
                    ? { ...hist, nb_vues: responseData.nb_vues, date_vue: new Date().toISOString().split('T')[0] }
                    : hist
            ));
        }
    }, []);

    const handleSuggestionRemoveFromHistory = useCallback((sceneId) => {
        setHistory(prev => prev.filter(hist => hist.scene_id !== sceneId));
    }, []);

    // Rendu conditionnel
    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement des scènes...
                    </Typography>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <Alert severity="error" sx={{
                    background: 'rgba(255, 107, 107, 0.1)',
                    color: '#FF6B6B',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    {error}
                </Alert>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Fade in={true} timeout={1000}>
                <div>
                    {/* Header de page */}
                    <PageTitle>
                        🔍 Découvrir
                    </PageTitle>
                    <PageSubtitle>
                        Explorez l'univers Intyma et trouvez vos prochains coups de cœur
                    </PageSubtitle>

                    {/* Système de recherche et filtres */}
                    <Box sx={{ mb: 4 }}>
                        <SceneSearchAndFilters
                            scenes={scenes}
                            actrices={actresses}       // ✅ AJOUTÉ
                            favorites={favorites}      // ✅ AJOUTÉ
                            history={history}          // ✅ AJOUTÉ
                            onFilteredResults={handleFilteredResults}
                        />
                    </Box>

                    {/* Section Suggestions */}
                    <Box sx={{ mb: 4 }}>
                        <SuggestionsExploration
                            apiBaseUrl={apiBaseUrl}
                            onShowSurprise={(surprise) => {
                                console.log("Nouvelle suggestion:", surprise);
                            }}
                            // ✅ NOUVEAU : Props pour les actions
                            onActriceClick={handleActriceClick}
                            favorites={favorites}
                            history={history}
                            actrices={actresses}
                            scenes={scenes}
                            onToggleFavorite={handleSuggestionToggleFavorite}
                            onAddToHistory={handleSuggestionAddToHistory}
                            onRemoveFromHistory={handleSuggestionRemoveFromHistory}
                            onOpenVideo={openVideoFile}
                        />
                    </Box>

                    {/* Barre de contrôles */}
                    <ControlsBar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ResultsInfo>
                                📊 {filteredScenes.length} scène{filteredScenes.length !== 1 ? 's' : ''} trouvée{filteredScenes.length !== 1 ? 's' : ''}
                            </ResultsInfo>
                            {paginationInfo.totalPages > 1 && (
                                <Chip
                                    label={`Page ${paginationInfo.safePage}/${paginationInfo.totalPages}`}
                                    size="small"
                                    sx={{
                                        background: 'rgba(218, 165, 32, 0.2)',
                                        color: '#DAA520',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            )}
                        </Box>

                        <SortSelect size="small">
                            <InputLabel>Trier par</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={handleSortChange}
                                label="Trier par"
                            >
                                <MenuItem value="date_ajout_desc">Plus récentes</MenuItem>
                                <MenuItem value="date_ajout_asc">Plus anciennes</MenuItem>
                                <MenuItem value="note_desc">Mieux notées</MenuItem>
                                <MenuItem value="titre_asc">Titre A-Z</MenuItem>
                                <MenuItem value="duree_desc">Plus longues</MenuItem>
                            </Select>
                        </SortSelect>
                    </ControlsBar>

                    {/* Grille des scènes */}
                    {paginationInfo.currentScenes.length === 0 ? (
                        <EmptyState>
                            <PlayCircleOutline sx={{ fontSize: '4rem', color: '#444', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                                Aucune scène trouvée
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#888' }}>
                                Essayez de modifier vos filtres de recherche
                            </Typography>
                        </EmptyState>
                    ) : (
                        <>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: 'repeat(1, 300px)',
                                    sm: 'repeat(2, 300px)',
                                    md: 'repeat(3, 300px)',
                                    lg: 'repeat(4, 300px)',
                                    xl: 'repeat(auto-fit, 300px)'
                                },
                                gap: 3,
                                justifyContent: 'start',
                                width: '100%'
                            }}>
                                {paginationInfo.currentScenes.map((scene, index) => {
                                    const imageUrl = buildImageUrl(scene.image);
                                    const isSceneFavorite = isFavorite(scene.id);
                                    const sceneViewCount = getViewCount(scene.id);
                                    const isSceneInHistory = isInHistory(scene.id);

                                    // ✨ Générer les badges pour cette scène comme dans AdminInterface
                                    const favHistoryBadges = generateSceneFavHistoryBadges(scene, favorites, history);
                                    const qualityBadges = generateSceneBadges(scene, {});
                                    const tagsBadges = generateSceneTagsBadges(scene, {});

                                    return (
                                        <Box key={`scene-${scene.id}-page-${currentPage}`} sx={{
                                            width: '300px',
                                            flexShrink: 0
                                        }}>
                                            <Grow in={true} timeout={300 + index * 100}>
                                                <CompactCard onClick={() => handleCardClick(scene)}>
                                                    {/* ✨ BADGES TOP-RIGHT : Favoris/Historique en priorité */}
                                                    <SceneBadgeContainer>
                                                        {/* Badges favoris/historique en premier */}
                                                        {favHistoryBadges.map(badge => (
                                                            <SceneBadgeWithTooltip key={badge.key} badge={badge}>
                                                                <SceneFavHistoryBadge
                                                                    variant={badge.variant}
                                                                    label={badge.label}
                                                                    size="small"
                                                                />
                                                            </SceneBadgeWithTooltip>
                                                        ))}

                                                        {/* Puis les autres badges (qualité, durée, etc.) */}
                                                        {qualityBadges.slice(0, 4 - favHistoryBadges.length).map(badge => (
                                                            <SceneInfoBadge
                                                                key={badge.key}
                                                                variant={badge.variant}
                                                                label={badge.label}
                                                                size="small"
                                                            />
                                                        ))}
                                                    </SceneBadgeContainer>

                                                    {/* ✨ TAGS BADGES BOTTOM */}
                                                    {tagsBadges.length > 0 && (
                                                        <SceneTagsBadgeContainer>
                                                            {tagsBadges.map(tag => (
                                                                <SceneInfoBadge
                                                                    key={tag.key}
                                                                    variant={tag.isMatching ? 'tag' : 'default'}
                                                                    label={tag.label}
                                                                    size="small"
                                                                    sx={{
                                                                        fontSize: '0.65rem',
                                                                        height: '18px',
                                                                        opacity: tag.isMatching ? 1 : 0.8,
                                                                        transform: tag.isMatching ? 'scale(1.05)' : 'scale(1)',
                                                                    }}
                                                                />
                                                            ))}
                                                        </SceneTagsBadgeContainer>
                                                    )}

                                                    {/* Bouton favori en overlay */}
                                                    <IconButton
                                                        onClick={(e) => handleToggleFavorite(scene, e)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            left: '8px',
                                                            zIndex: 20,
                                                            background: 'rgba(0, 0, 0, 0.7)',
                                                            color: isSceneFavorite ? '#FF6B9D' : '#fff',
                                                            backdropFilter: 'blur(4px)',
                                                            width: '36px',
                                                            height: '36px',
                                                            '&:hover': {
                                                                background: isSceneFavorite ? 'rgba(255, 107, 157, 0.2)' : 'rgba(218, 165, 32, 0.2)',
                                                                transform: 'scale(1.1)',
                                                            }
                                                        }}
                                                    >
                                                        {isSceneFavorite ? <Favorite /> : <FavoriteBorder />}
                                                    </IconButton>

                                                    <CompactImageContainer
                                                        sx={{
                                                            backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none'
                                                        }}
                                                    >
                                                        {!imageUrl && (
                                                            <PlaceholderIcon
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    zIndex: 4
                                                                }}
                                                            />
                                                        )}
                                                    </CompactImageContainer>

                                                    <CompactCardContent>
                                                        <div>
                                                            <CompactTitle>{scene.titre || 'Sans titre'}</CompactTitle>
                                                        </div>

                                                        <div>
                                                            <CompactSubtitle>
                                                                <AccessTime sx={{ fontSize: '1rem' }} />
                                                                {scene.duree ? `${scene.duree} min` : 'Durée inconnue'}
                                                                <HighQuality sx={{ fontSize: '1rem', ml: 1 }} />
                                                                {scene.qualite}
                                                                <CalendarMonth sx={{ fontSize: '1rem', ml: 1 }} />
                                                                {scene.date_scene ? new Date(scene.date_scene).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                                            </CompactSubtitle>

                                                            {scene.actrices && scene.actrices.length > 0 && (
                                                                <CompactSubtitle>
                                                                    <Person sx={{ fontSize: '1rem' }} />
                                                                    {/* ✅ NOUVEAU : Clic sur nom d'actrice */}
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        {scene.actrices.map((actrice, idx) => (
                                                                            <span key={actrice.id}>
                                                                                <span
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleActriceClick(actrice);
                                                                                    }}
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        textDecoration: 'underline',
                                                                                        color: '#DAA520'
                                                                                    }}
                                                                                >
                                                                                    {actrice.nom}
                                                                                </span>
                                                                                {idx < scene.actrices.length - 1 && ', '}
                                                                            </span>
                                                                        ))}
                                                                    </Box>
                                                                </CompactSubtitle>
                                                            )}

                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                                                {scene.site && (
                                                                    <StyledChip label={scene.site} size="small" />
                                                                )}
                                                                {scene.studio && (
                                                                    <StyledChip label={scene.studio} size="small" />
                                                                )}
                                                            </Box>
                                                        </div>
                                                    </CompactCardContent>
                                                </CompactCard>
                                            </Grow>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* 🔑 SOLUTION: Pagination ultra-stable avec clé unique */}
                            {paginationInfo.totalPages > 1 && (
                                <PaginationContainer key={`pagination-${paginationInfo.totalPages}-${sortBy}`}>
                                    <Pagination
                                        count={paginationInfo.totalPages}
                                        page={paginationInfo.safePage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                color: '#B8860B',
                                                borderColor: 'rgba(218, 165, 32, 0.3)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(218, 165, 32, 0.1)',
                                                    borderColor: '#DAA520',
                                                },
                                                '&.Mui-selected': {
                                                    backgroundColor: '#DAA520',
                                                    color: '#000',
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        backgroundColor: '#B8860B',
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{
                                        color: '#888',
                                        mt: 1,
                                        textAlign: 'center',
                                        display: 'block'
                                    }}>
                                        Page {paginationInfo.safePage} sur {paginationInfo.totalPages} • {sortedScenes.length} scènes au total
                                    </Typography>
                                </PaginationContainer>
                            )}
                        </>
                    )}

                    {/* MODAL DE DÉTAILS */}
                    <DetailModal
                        open={detailModalOpen}
                        onClose={handleCloseDetail}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{ timeout: 500 }}
                    >
                        <Fade in={detailModalOpen}>
                            <DetailModalContent>
                                {selectedItem && (
                                    <>
                                        <DetailHeader>
                                            <DetailTitle>
                                                {selectedItem.titre}
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
                                                    backgroundImage: selectedItem.image
                                                        ? `url("${buildImageUrl(selectedItem.image)}")`
                                                        : 'none'
                                                }}
                                            >
                                                {(!selectedItem.image || !buildImageUrl(selectedItem.image)) && (
                                                    <PlaceholderIcon sx={{
                                                        fontSize: '4rem',
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        zIndex: 4
                                                    }} />
                                                )}
                                            </DetailImageContainer>

                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="h5" sx={{ color: '#F4D03F', mb: 2 }}>
                                                    {selectedItem.titre}
                                                </Typography>

                                                {selectedItem.synopsis && (
                                                    <Typography variant="body1" sx={{ color: '#ccc', mb: 2, fontStyle: 'italic' }}>
                                                        {selectedItem.synopsis}
                                                    </Typography>
                                                )}

                                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                                                    {selectedItem.duree && (
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            ⏱️ {selectedItem.duree} minutes
                                                        </Typography>
                                                    )}
                                                    {selectedItem.qualite && (
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            📺 {selectedItem.qualite}
                                                        </Typography>
                                                    )}
                                                    {selectedItem.date_scene && (
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            📅 {new Date(selectedItem.date_scene).toLocaleDateString('fr-FR')}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {selectedItem.note_perso && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <Rating
                                                            value={parseFloat(selectedItem.note_perso) || 0}
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
                                                            {selectedItem.note_perso}/5
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {selectedItem.actrices && selectedItem.actrices.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Actrices
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {selectedItem.actrices.map((actrice) => (
                                                                <StyledChip
                                                                    key={actrice.id}
                                                                    label={actrice.nom}
                                                                    size="small"
                                                                    icon={<Person />}
                                                                    // ✅ NOUVEAU : Clic sur actrice
                                                                    onClick={() => handleActriceClick(actrice)}
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            transform: 'scale(1.05)',
                                                                            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.4), rgba(184, 134, 11, 0.4))',
                                                                        }
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {selectedItem.tags && selectedItem.tags.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Tags
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {selectedItem.tags.map((tag) => (
                                                                <StyledChip
                                                                    key={tag.id || tag}
                                                                    label={tag.nom || tag}
                                                                    size="small"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                                                    {selectedItem.studio && (
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            🏢 {selectedItem.studio}
                                                        </Typography>
                                                    )}
                                                    {selectedItem.site && (
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            🌐 {selectedItem.site}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>

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
                                                    onClick={() => openVideoFile(selectedItem)}
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
                                                    startIcon={isFavorite(selectedItem.id) ? <Remove /> : <Add />}
                                                    onClick={(e) => handleToggleFavorite(selectedItem, e)}
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
                                                    {isFavorite(selectedItem.id)
                                                        ? 'Retirer des favoris'
                                                        : 'Ajouter aux favoris'
                                                    }
                                                </Button>

                                                <Button
                                                    startIcon={<Visibility />}
                                                    onClick={() => addToHistory(selectedItem.id)}
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
                                                    {isInHistory(selectedItem.id) ?
                                                        `👁️ Revoir (Vue ${getViewCount(selectedItem.id) || 1} fois)` :
                                                        '👁️ Marquer comme vue'
                                                    }
                                                </Button>

                                                {isInHistory(selectedItem.id) && (
                                                    <Button
                                                        startIcon={<Delete />}
                                                        onClick={() => removeFromHistory(selectedItem.id)}
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

                    {/* ✅ AJOUTER CE MODAL ACTRICE */}
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
                                            {/* Photo de l'actrice */}
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

                                            {/* Informations en grille */}
                                            <Box sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: 4,
                                                mb: 3
                                            }}>
                                                {/* Colonne gauche */}
                                                <Box>
                                                    <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                        Informations personnelles
                                                    </Typography>

                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Nom
                                                        </Typography>
                                                        <Typography variant="h5" sx={{ color: '#F4D03F', fontWeight: 600 }}>
                                                            {selectedActrice.nom}
                                                        </Typography>
                                                    </Box>

                                                    {selectedActrice.nationalite ? (
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                                Nationalité
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                🌍 {selectedActrice.nationalite}
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

                                                    {selectedActrice.tags_typiques && (
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                                Tags typiques
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selectedActrice.tags_typiques.split(',').slice(0, 8).map((tag, index) => (
                                                                    <StyledChip
                                                                        key={index}
                                                                        label={tag.trim()}
                                                                        size="small"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Colonne droite */}
                                                <Box>
                                                    <Typography variant="h6" sx={{ color: '#DAA520', mb: 2, fontSize: '1.1rem' }}>
                                                        Statistiques
                                                    </Typography>

                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Nombre de scènes
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            🎬 {selectedActrice.nb_scenes || selectedActrice.scenes?.length || '0'} scène{((selectedActrice.nb_scenes || selectedActrice.scenes?.length || 0) > 1) ? 's' : ''}
                                                        </Typography>
                                                    </Box>

                                                    {/* ✅ AJOUTER : Vues totales */}
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Vues totales
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            {(() => {
                                                                if (!selectedActrice.scenes || !history) {
                                                                    return <span style={{ color: '#888', fontStyle: 'italic' }}>Non calculé</span>;
                                                                }

                                                                // Calculer le total des vues pour toutes les scènes de cette actrice
                                                                const totalVues = selectedActrice.scenes.reduce((total, scene) => {
                                                                    const sceneHistory = history.filter(h => h.scene_id === scene.id);
                                                                    if (sceneHistory.length > 0) {
                                                                        // Utiliser nb_vues si disponible, sinon compter les entrées
                                                                        const vues = sceneHistory[0].nb_vues || sceneHistory.length;
                                                                        return total + vues;
                                                                    }
                                                                    return total;
                                                                }, 0);

                                                                return `👁️ ${totalVues} vue${totalVues > 1 ? 's' : ''}`;
                                                            })()}
                                                        </Typography>
                                                    </Box>

                                                    {/* ✅ AJOUTER : Première apparition */}
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1 }}>
                                                            Première apparition
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#fff' }}>
                                                            {(() => {
                                                                if (!selectedActrice.scenes || selectedActrice.scenes.length === 0) {
                                                                    return <span style={{ color: '#888', fontStyle: 'italic' }}>Non renseignée</span>;
                                                                }

                                                                // ✅ CORRECTION : Chercher les dates dans la liste complète des scènes
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

                                                    {/* ✅ AJOUTER : Dernière vue */}
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
                                                </Box>
                                            </Box>

                                            {/* Biographie */}
                                            {selectedActrice.biographie && (
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
                                                            <StyledChip
                                                                key={scene.id || index}
                                                                label={scene.titre || `Scène ${index + 1}`}
                                                                onClick={async () => {
                                                                    handleCloseActriceDetail();
                                                                    setTimeout(async () => {
                                                                        try {
                                                                            const response = await axios.get(`${apiBaseUrl}/api/scenes/${scene.id}`);
                                                                            const sceneDetail = response.data;
                                                                            setSelectedItem({ ...sceneDetail, type: 'scene' });
                                                                            setDetailModalOpen(true);
                                                                        } catch (error) {
                                                                            console.error('❌ Erreur chargement scène:', error);
                                                                            setSelectedItem({ ...scene, type: 'scene' });
                                                                            setDetailModalOpen(true);
                                                                        }
                                                                    }, 100);
                                                                }}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.05)'
                                                                    }
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                        Aucune scène trouvée
                                                    </Typography>
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

                    {/* Snackbar pour les notifications */}
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
                </div>
            </Fade>
        </PageContainer>
    );
};

export default Decouvrir;