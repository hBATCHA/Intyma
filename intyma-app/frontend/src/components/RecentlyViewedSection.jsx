import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Container,
    Fade,
    CircularProgress,
    Alert,
    Chip,
    Tooltip,
    Tabs,
    Tab,
    Skeleton
} from '@mui/material';
import {
    Close,
    PlayCircleOutline,
    Person,
    Collections,
    AccessTime,
    Visibility,
    ClearAll,
    ChevronLeft,
    ChevronRight,
    Star,
    FavoriteOutlined
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.6), 0 0 40px rgba(218, 165, 32, 0.3); }
`;

const goldenGlow = keyframes`
    0%, 100% {
        box-shadow: 0 0 25px rgba(184, 134, 11, 0.4), 0 0 50px rgba(218, 165, 32, 0.2);
    }
    50% {
        box-shadow: 0 0 35px rgba(184, 134, 11, 0.6), 0 0 60px rgba(218, 165, 32, 0.4);
    }
`;

const sparkle = keyframes`
    0%, 100% { opacity: 0; transform: translateY(0px) scale(1); }
    50% { opacity: 1; transform: translateY(-10px) scale(1.2); }
`;

const fadeOut = keyframes`
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8); }
`;

const slideInLeft = keyframes`
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

// =================== STYLES PERSONNALISÉS ===================

const SectionContainer = styled(Container)(({ theme }) => ({
    padding: '40px 20px',
    backgroundColor: '#1a1a1a', // ✅ CORRECTION: Même couleur que CollectionsFavorites
    position: 'relative',
    maxWidth: 'none !important',
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    overflow: 'hidden',

    [theme.breakpoints.up('md')]: {
        padding: '60px 40px',
    }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    maxWidth: '1400px',
    margin: '0 auto 32px auto',
    padding: '0 20px',

    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center'
    }
}));

// ✅ CORRECTION: Utiliser le même style de titre que CollectionsFavorites
const SectionTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    marginBottom: '32px',
    color: '#F5E6D3',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.7)',

    '&::after': {
        content: '""',
        display: 'block',
        width: '80px',
        height: '3px',
        background: 'linear-gradient(90deg, #DAA520, #B8860B)',
        margin: '16px auto 0',
        borderRadius: '2px'
    }
}));

const ClearAllButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15), rgba(184, 134, 11, 0.15))',
    color: '#DAA520',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '20px',
    textTransform: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',

    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(184, 134, 11, 0.25))',
        borderColor: '#DAA520',
        color: '#F4D03F',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)'
    },

    [theme.breakpoints.down('md')]: {
        marginTop: '8px'
    }
}));

const TabsContainer = styled(Box)({
    maxWidth: '1400px',
    margin: '0 auto 24px auto',
    padding: '0 20px',
});

const StyledTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
        background: 'linear-gradient(90deg, #DAA520, #B8860B)',
        height: '3px',
        borderRadius: '2px'
    }
});

const StyledTab = styled(Tab)({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    color: '#B8860B',
    minWidth: 'auto',
    padding: '12px 20px',

    '&.Mui-selected': {
        color: '#DAA520',
        fontWeight: 600
    },

    '&:hover': {
        color: '#F4D03F',
        background: 'rgba(218, 165, 32, 0.05)'
    }
});

const SliderWrapper = styled(Box)({
    position: 'relative',
    maxWidth: '1400px',
    margin: '0 auto',
    overflow: 'hidden',
    padding: '0 60px',

    '@media (max-width: 900px)': {
        padding: '0 40px',
    },

    '@media (max-width: 600px)': {
        padding: '0 20px',
    }
});

const SliderContainer = styled(Box)({
    display: 'flex',
    transition: 'transform 0.5s ease-in-out',
    gap: '20px',
    padding: '24px 0',
    alignItems: 'flex-start',
});

const NavButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))',
    color: '#000',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(218, 165, 32, 0.4)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',

    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'translateY(-50%) scale(1.1)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',
    },

    '&.prev': {
        left: '5px',
    },

    '&.next': {
        right: '5px',
    },

    [theme.breakpoints.down('md')]: {
        width: '40px',
        height: '40px',
    }
}));

const HistoryCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'contentType' && prop !== 'isRemoving'
})(({ contentType, isRemoving }) => ({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)', // ✅ CORRECTION: Même style que CollectionsFavorites
    borderRadius: '20px', // ✅ CORRECTION: Même border radius
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.15)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '380px',
    width: '280px',
    minWidth: '280px',
    maxWidth: '280px',
    flexShrink: 0,
    position: 'relative',
    animation: isRemoving ? `${fadeOut} 0.4s ease-out forwards` : 'none',

    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: contentType === 'scene'
            ? '0 20px 40px rgba(218, 165, 32, 0.25), 0 0 30px rgba(218, 165, 32, 0.15)'
            : contentType === 'actress'
                ? '0 20px 40px rgba(255, 107, 157, 0.25), 0 0 30px rgba(255, 107, 157, 0.15)'
                : '0 20px 40px rgba(156, 39, 176, 0.25), 0 0 30px rgba(156, 39, 176, 0.15)',
        borderColor: contentType === 'scene'
            ? 'rgba(218, 165, 32, 0.4)'
            : contentType === 'actress'
                ? 'rgba(255, 107, 157, 0.4)'
                : 'rgba(156, 39, 176, 0.4)',
        animation: `${goldenGlow} 2s ease-in-out infinite`,

        '& .history-overlay': {
            opacity: 1
        },

        '& .history-miniature': {
            transform: 'scale(1.08)',
            filter: 'brightness(1.1) contrast(1.1)'
        },

        '& .remove-button': {
            opacity: 1,
            transform: 'scale(1)'
        }
    }
}));

// ✅ CORRECTION: Même style d'image que CollectionsFavorites
const HistoryMiniature = styled(Box)({
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    backgroundColor: '#0a0a0a',

    // Image de fond floutée (même image)
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.3)',
        zIndex: 0,
    },

    // Image principale nette au centre
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
    }
});

const HistoryOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.85), rgba(184, 134, 11, 0.9))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 20,

    '& .MuiSvgIcon-root': {
        fontSize: '3.5rem',
        color: '#000',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
    }
});

const RemoveButton = styled(IconButton)({
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 30,
    width: '28px',
    height: '28px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    opacity: 0,
    transform: 'scale(0.8)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(4px)',

    '&:hover': {
        background: 'rgba(220, 53, 69, 0.9)',
        transform: 'scale(1.1)',
        color: '#fff'
    }
});

const ContentTypeBadge = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'contentType'
})(({ contentType }) => ({
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 10,
    fontSize: '0.7rem',
    fontWeight: 600,
    height: '22px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',

    ...(contentType === 'scene' ? {
        background: 'linear-gradient(135deg, #DAA520, #B8860B)',
        color: '#000',
    } : contentType === 'actress' ? {
        background: 'linear-gradient(135deg, #FF6B9D, #E91E63)',
        color: '#fff',
    } : {
        background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
        color: '#fff',
    }),

    '& .MuiChip-label': {
        padding: '0 8px',
    }
}));

const HistoryInfo = styled(CardContent)({
    padding: '16px',
    color: '#fff',
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
});

const HistoryTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    color: '#F5E6D3',
    lineHeight: 1.3,
    marginBottom: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
});

const ViewedDate = styled(Typography)({
    color: '#B8860B',
    fontSize: '0.8rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px'
});

const StatsContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
});

const StatBadge = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 500,
    background: 'rgba(218, 165, 32, 0.1)',
    color: '#DAA520',
    border: '1px solid rgba(218, 165, 32, 0.2)'
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    color: '#DAA520'
});

const EmptyContainer = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    color: '#B8860B',
    maxWidth: '500px',
    margin: '0 auto'
});

const EmptyIcon = styled(Box)({
    fontSize: '4rem',
    marginBottom: '16px',
    opacity: 0.6
});

const SkeletonCard = styled(Card)({
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.1)',
    height: '320px',
    width: '240px',
    minWidth: '240px',
    maxWidth: '240px',
    flexShrink: 0,
});

// =================== UTILITY FUNCTIONS ===================

const formatViewedDate = (dateString) => {
    if (!dateString) return 'Récemment';

    const viewedDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - viewedDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} sem.`;
    return viewedDate.toLocaleDateString('fr-FR');
};

// ✅ CORRECTION: Fonction de construction d'URL améliorée pour les scènes
const buildImageUrl = (imagePath, apiBaseUrl) => {
    if (!imagePath) return null;

    try {
        if (imagePath.startsWith('http')) return imagePath;

        const normalizedPath = imagePath.trim();
        let actriceName, fileName;

        if (normalizedPath.includes('/miniatures/')) {
            const index = normalizedPath.indexOf('/miniatures/');
            const afterEndpoint = normalizedPath.substring(index + '/miniatures/'.length);
            const parts = afterEndpoint.split('/');
            if (parts.length >= 2) {
                actriceName = parts[0];
                fileName = parts[parts.length - 1];
            }
        } else {
            const pathParts = normalizedPath.split('/');
            if (pathParts.length >= 2) {
                fileName = pathParts[pathParts.length - 1];
                actriceName = pathParts[pathParts.length - 2];
            }
        }

        if (actriceName && fileName) {
            const cleanActriceName = actriceName.trim();
            const cleanFileName = fileName.trim();
            return `${apiBaseUrl}/miniatures/${encodeURIComponent(cleanActriceName)}/${encodeURIComponent(cleanFileName)}`;
        }

        return null;
    } catch (error) {
        console.error('Erreur construction URL image:', error);
        return null;
    }
};

// ✅ CORRECTION: Fonction pour construire l'URL des images d'actrices (extraction depuis le chemin complet)
const buildActressImageUrl = (imagePath, apiBaseUrl) => {
    if (!imagePath) {
        //console.log('❌ Pas de chemin image pour actrice');
        return null;
    }

    try {
        if (imagePath.startsWith('http')) return imagePath;

        //(`🖼️ Chemin actrice original: ${imagePath}`);

        // Extraire actrice et fichier depuis le chemin complet
        // Ex: "/Volumes/My Passport for Mac/Intyma/images/Alexa Payne/alexa-payne.jpg"
        // devient "Alexa Payne" et "alexa-payne.jpg"

        const pathParts = imagePath.split('/');
        if (pathParts.length >= 2) {
            const fileName = pathParts[pathParts.length - 1]; // dernier élément = nom fichier
            const actressName = pathParts[pathParts.length - 2]; // avant-dernier = nom actrice

            //console.log(`🖼️ Actrice extraite: "${actressName}", Fichier: "${fileName}"`);

            if (fileName && actressName) {
                const encodedActressName = encodeURIComponent(actressName);
                const encodedFileName = encodeURIComponent(fileName);
                const finalUrl = `${apiBaseUrl}/images/${encodedActressName}/${encodedFileName}`;
                //console.log(`🖼️ URL finale actrice: ${finalUrl}`);
                return finalUrl;
            }
        }

        //console.log(`❌ Impossible de parser le chemin actrice: ${imagePath}`);
        return null;
    } catch (error) {
        //console.error('Erreur construction URL image actrice:', error);
        return null;
    }
};

// ✅ CORRECTION: Fonction pour construire l'URL des images de collections (comme dans CollectionsFavorites)
const buildCollectionImageUrl = (imagePath, apiBaseUrl) => {
    if (!imagePath) return '/placeholder-collection.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${apiBaseUrl}${imagePath}`;
};

const getContentIcon = (contentType) => {
    switch (contentType) {
        case 'scene': return <PlayCircleOutline />;
        case 'actress': return <Person />;
        case 'collection': return <Collections />;
        default: return <Visibility />;
    }
};

// =================== COMPOSANT PRINCIPAL ===================

const RecentlyViewedSection = ({
                                   apiBaseUrl = "http://127.0.0.1:5000",
                                   maxItems = 12
                               }) => {
    const [historyData, setHistoryData] = useState([]);
    const [scenes, setScenes] = useState([]);
    const [actresses, setActresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0);
    const [removingItems, setRemovingItems] = useState(new Set());
    const [collections, setCollections] = useState([]);

    const containerRef = useRef(null);

    // Calcul responsive des éléments visibles
    const getVisibleCount = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 600) return 1;
            if (width < 900) return 2;
            if (width < 1200) return 3;
            if (width < 1600) return 4;
            return 5;
        }
        return 4;
    };

    const [visibleCount, setVisibleCount] = useState(getVisibleCount());

    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(getVisibleCount());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Chargement des données
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [historyRes, scenesRes, actressesRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/history`).catch(() => ({ data: [] })),
                    axios.get(`${apiBaseUrl}/api/scenes`).catch(() => ({ data: [] })),
                    axios.get(`${apiBaseUrl}/api/actrices`).catch(() => ({ data: [] }))

                ]);

                const history = historyRes.data;
                const scenesData = scenesRes.data;
                const actressesData = actressesRes.data;

                setScenes(scenesData);
                setActresses(actressesData);

                // Enrichir l'historique avec les détails des scènes/actrices/collections
                const enrichedHistory = [];

                // Traiter les scènes de l'historique
                history.forEach(historyItem => {
                    const scene = scenesData.find(s => s.id === historyItem.scene_id);
                    if (scene) {
                        enrichedHistory.push({
                            ...historyItem,
                            contentType: 'scene',
                            title: scene.titre || 'Sans titre',
                            image: scene.image,
                            details: {
                                duration: scene.duree,
                                note: scene.note_perso,
                                actress: scene.actrices?.[0]?.nom
                            }
                        });
                    }
                });

                // Ajouter des actrices récemment vues (basé sur l'historique des scènes)
                const recentActresses = new Map();
                history.forEach(historyItem => {
                    const scene = scenesData.find(s => s.id === historyItem.scene_id);
                    if (scene && scene.actrices) {
                        scene.actrices.forEach(actress => {
                            const fullActress = actressesData.find(a => a.id === actress.id);
                            if (!recentActresses.has(actress.id) ||
                                new Date(historyItem.date_vue) > new Date(recentActresses.get(actress.id).date_vue)) {
                                recentActresses.set(actress.id, {
                                    id: `actress-${actress.id}`,
                                    contentType: 'actress',
                                    title: actress.nom,
                                    image: fullActress.photo, // ✅ CORRECTION: Utiliser actress.photo
                                    actressName: actress.nom, // ✅ AJOUT: Pour construction URL
                                    date_vue: historyItem.date_vue,
                                    details: {
                                        scenes: scenesData.filter(s => s.actrices?.some(a => a.id === actress.id)).length
                                    }
                                });
                            }
                        });
                    }
                });

                // Ajouter les actrices à l'historique enrichi
                recentActresses.forEach(actress => {
                    enrichedHistory.push(actress);
                });

                // Récupérer les vraies collections depuis l'API
                try {
                    const collectionsRes = await axios.get(`${apiBaseUrl}/api/collections_favorites`);
                    const collectionsData = collectionsRes.data;

                    collectionsData.slice(0, 3).forEach((collection, index) => {
                        enrichedHistory.push({
                            id: `collection-${collection.id}`,
                            contentType: 'collection',
                            title: collection.titre,
                            image: collection.image,
                            date_vue: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
                            details: {
                                videos: collection.nb_videos || 0,
                                views: collection.nb_vues || 0
                            }
                        });
                    });
                } catch (err) {
                    console.log('Collections non disponibles:', err);
                }

                // Trier par date de vue et limiter
                enrichedHistory.sort((a, b) => new Date(b.date_vue) - new Date(a.date_vue));
                setHistoryData(enrichedHistory.slice(0, maxItems));

            } catch (err) {
                console.error('Erreur chargement historique:', err);
                setError('Impossible de charger l\'historique');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiBaseUrl, maxItems]);

    // Filtrage par type de contenu
    const getFilteredData = () => {
        switch (selectedTab) {
            case 1: return historyData.filter(item => item.contentType === 'scene');
            case 2: return historyData.filter(item => item.contentType === 'actress');
            case 3: return historyData.filter(item => item.contentType === 'collection');
            default: return historyData;
        }
    };

    const filteredData = getFilteredData();

    // Navigation du slider
    const handlePrev = () => {
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, filteredData.length - visibleCount);
            return prev > 0 ? prev - 1 : maxIndex;
        });
    };

    const handleNext = () => {
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, filteredData.length - visibleCount);
            return prev < maxIndex ? prev + 1 : 0;
        });
    };

    // Suppression d'un élément
    const handleRemoveItem = async (item, event) => {
        event.stopPropagation();

        setRemovingItems(prev => new Set([...prev, item.id]));

        try {
            await axios.delete(`${apiBaseUrl}/api/history/${item.id}`);

            setTimeout(() => {
                setHistoryData(prev => prev.filter(h => h.id !== item.id));
                setRemovingItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item.id);
                    return newSet;
                });
            }, 400);
        } catch (err) {
            console.error('Erreur suppression:', err);
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(item.id);
                return newSet;
            });
        }
    };

    // Vider tout l'historique
    const handleClearAll = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir vider tout l\'historique ?')) return;

        try {
            await axios.delete(`${apiBaseUrl}/api/history`);
            setHistoryData([]);
        } catch (err) {
            console.error('Erreur vidage historique:', err);
        }
    };

    // Clic sur un élément
    const handleItemClick = (item) => {
        //console.log('Voir détail:', item);
    };

    // Navigation clavier
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrev();
            } else if (event.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const translateX = -(currentIndex * (280 + 20));

    // ✅ CORRECTION: Fonction pour obtenir l'URL correcte selon le type de contenu
    const getImageUrl = (item) => {
        switch (item.contentType) {
            case 'scene':
                return buildImageUrl(item.image, apiBaseUrl);
            case 'actress':
                return buildActressImageUrl(item.image, apiBaseUrl); // ✅ Supprimé le 3ème paramètre
            case 'collection':
                return buildCollectionImageUrl(item.image, apiBaseUrl);
            default:
                return null;
        }
    };

    // Rendu du loading
    if (loading) {
        return (
            <SectionContainer maxWidth="xl">
                <SectionTitle>🕒 Récemment Vues</SectionTitle>

                <SliderWrapper>
                    <SliderContainer>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonCard key={index}>
                                <Skeleton
                                    variant="rectangular"
                                    height={180}
                                    sx={{ bgcolor: 'rgba(218, 165, 32, 0.1)' }}
                                />
                                <Box sx={{ p: 2 }}>
                                    <Skeleton
                                        variant="text"
                                        height={24}
                                        sx={{ bgcolor: 'rgba(218, 165, 32, 0.1)', mb: 1 }}
                                    />
                                    <Skeleton
                                        variant="text"
                                        height={16}
                                        width="60%"
                                        sx={{ bgcolor: 'rgba(218, 165, 32, 0.1)', mb: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Skeleton
                                            variant="rectangular"
                                            width={60}
                                            height={20}
                                            sx={{ bgcolor: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px' }}
                                        />
                                        <Skeleton
                                            variant="rectangular"
                                            width={50}
                                            height={20}
                                            sx={{ bgcolor: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px' }}
                                        />
                                    </Box>
                                </Box>
                            </SkeletonCard>
                        ))}
                    </SliderContainer>
                </SliderWrapper>
            </SectionContainer>
        );
    }

    // Rendu d'erreur
    if (error) {
        return (
            <SectionContainer maxWidth="xl">
                <SectionTitle>🕒 Récemment Vues</SectionTitle>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="error" sx={{
                        background: 'rgba(220, 53, 69, 0.1)',
                        color: '#DC3545',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        {error}
                    </Alert>
                </Box>
            </SectionContainer>
        );
    }

    // Rendu vide
    if (!historyData.length) {
        return (
            <SectionContainer maxWidth="xl">
                <SectionTitle>🕒 Récemment Vues</SectionTitle>

                <EmptyContainer>
                    <EmptyIcon>🕒</EmptyIcon>
                    <Typography variant="h6" sx={{
                        color: '#F5E6D3',
                        mb: 2,
                        fontWeight: 600,
                        fontFamily: '"Playfair Display", serif'
                    }}>
                        Aucun historique pour le moment
                    </Typography>
                    <Typography variant="body1" sx={{
                        color: '#B8860B',
                        lineHeight: 1.6,
                        fontStyle: 'italic'
                    }}>
                        Commencez à explorer le contenu Intyma pour voir apparaître
                        vos dernières vues ici. Chaque scène, actrice ou collection
                        visitée sera élégamment présentée dans cette section premium.
                    </Typography>
                </EmptyContainer>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionHeader>
                        <Box /> {/* Spacer gauche */}
                        <SectionTitle>🕒 Récemment Vues</SectionTitle>
                        {historyData.length > 0 ? (
                            <ClearAllButton
                                startIcon={<ClearAll />}
                                onClick={handleClearAll}
                                aria-label="Vider tout l'historique"
                            >
                                Vider tout
                            </ClearAllButton>
                        ) : (
                            <Box /> // Spacer droite si pas de bouton
                        )}
                    </SectionHeader>

                    {/* Tabs de filtrage */}
                    <TabsContainer>
                        <StyledTabs
                            value={selectedTab}
                            onChange={(e, newValue) => {
                                setSelectedTab(newValue);
                                setCurrentIndex(0);
                            }}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="Filtres de l'historique"
                        >
                            <StyledTab label="Tout" />
                            <StyledTab label={`Scènes (${historyData.filter(item => item.contentType === 'scene').length})`} />
                            <StyledTab label={`Actrices (${historyData.filter(item => item.contentType === 'actress').length})`} />
                            <StyledTab label={`Collections (${historyData.filter(item => item.contentType === 'collection').length})`} />
                        </StyledTabs>
                    </TabsContainer>

                    {/* Slider principal */}
                    <SliderWrapper>
                        {filteredData.length > visibleCount && (
                            <>
                                <NavButton
                                    className="prev"
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    aria-label="Élément précédent"
                                >
                                    <ChevronLeft />
                                </NavButton>
                                <NavButton
                                    className="next"
                                    onClick={handleNext}
                                    disabled={currentIndex >= filteredData.length - visibleCount}
                                    aria-label="Élément suivant"
                                >
                                    <ChevronRight />
                                </NavButton>
                            </>
                        )}

                        <SliderContainer
                            ref={containerRef}
                            sx={{
                                transform: `translateX(${translateX}px)`,
                                width: `${filteredData.length * (280 + 20)}px`
                            }}
                        >
                            {filteredData.map((item, index) => {
                                const imageUrl = getImageUrl(item); // ✅ CORRECTION: Utiliser la nouvelle fonction
                                const isRemoving = removingItems.has(item.id);

                                return (
                                    <Fade
                                        key={`history-${item.id}`}
                                        in={true}
                                        timeout={800 + (index * 100)}
                                    >
                                        <HistoryCard
                                            contentType={item.contentType}
                                            isRemoving={isRemoving}
                                            onClick={() => handleItemClick(item)}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`Voir ${item.title}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleItemClick(item);
                                                }
                                            }}
                                        >
                                            <ContentTypeBadge
                                                label={item.contentType === 'scene' ? 'SCÈNE' :
                                                    item.contentType === 'actress' ? 'ACTRICE' : 'COLLECTION'}
                                                contentType={item.contentType}
                                                size="small"
                                            />

                                            <Tooltip title="Supprimer de l'historique" arrow>
                                                <RemoveButton
                                                    className="remove-button"
                                                    onClick={(e) => handleRemoveItem(item, e)}
                                                    aria-label={`Supprimer ${item.title} de l'historique`}
                                                >
                                                    <Close sx={{ fontSize: '1rem' }} />
                                                </RemoveButton>
                                            </Tooltip>

                                            <HistoryMiniature
                                                className="history-miniature"
                                                sx={{
                                                    backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none'
                                                }}
                                            >
                                                {!imageUrl && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        zIndex: 4,
                                                        color: 'rgba(218, 165, 32, 0.4)',
                                                        fontSize: '3rem'
                                                    }}>
                                                        {getContentIcon(item.contentType)}
                                                    </Box>
                                                )}

                                                <HistoryOverlay className="history-overlay">
                                                    {getContentIcon(item.contentType)}
                                                </HistoryOverlay>
                                            </HistoryMiniature>

                                            <HistoryInfo>
                                                <Box>
                                                    <HistoryTitle>
                                                        {item.title}
                                                    </HistoryTitle>

                                                    <ViewedDate>
                                                        <AccessTime sx={{ fontSize: '0.8rem' }} />
                                                        {formatViewedDate(item.date_vue)}
                                                    </ViewedDate>
                                                </Box>

                                                <StatsContainer>
                                                    {item.details?.duration && (
                                                        <StatBadge>
                                                            <AccessTime sx={{ fontSize: '0.7rem' }} />
                                                            {item.details.duration}min
                                                        </StatBadge>
                                                    )}

                                                    {item.details?.note && (
                                                        <StatBadge>
                                                            <Star sx={{ fontSize: '0.7rem' }} />
                                                            {item.details.note}
                                                        </StatBadge>
                                                    )}

                                                    {item.details?.actress && (
                                                        <StatBadge>
                                                            <Person sx={{ fontSize: '0.7rem' }} />
                                                            {item.details.actress}
                                                        </StatBadge>
                                                    )}

                                                    {item.details?.videos && (
                                                        <StatBadge>
                                                            <Collections sx={{ fontSize: '0.7rem' }} />
                                                            {item.details.videos} vidéos
                                                        </StatBadge>
                                                    )}

                                                    {item.details?.scenes && (
                                                        <StatBadge>
                                                            <PlayCircleOutline sx={{ fontSize: '0.7rem' }} />
                                                            {item.details.scenes} scènes
                                                        </StatBadge>
                                                    )}

                                                    {item.nb_vues && item.nb_vues > 1 && (
                                                        <StatBadge>
                                                            <Visibility sx={{ fontSize: '0.7rem' }} />
                                                            {item.nb_vues}x
                                                        </StatBadge>
                                                    )}
                                                </StatsContainer>
                                            </HistoryInfo>
                                        </HistoryCard>
                                    </Fade>
                                );
                            })}
                        </SliderContainer>
                    </SliderWrapper>

                    {/* Indicateur de position */}
                    {filteredData.length > visibleCount && (
                        <Box sx={{
                            textAlign: 'center',
                            mt: 3,
                            color: '#B8860B',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>
                            {currentIndex + 1} - {Math.min(currentIndex + visibleCount, filteredData.length)} sur {filteredData.length}
                        </Box>
                    )}
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default RecentlyViewedSection;