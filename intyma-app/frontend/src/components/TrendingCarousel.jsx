import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Fade,
    CircularProgress,
    Alert,
    Avatar,
    IconButton
} from '@mui/material';
import {
    PlayCircleOutline,
    ArrowForward,
    ChevronLeft,
    ChevronRight,
    Star,
    AccessTime,
    Person,
    Visibility,
    Favorite,
    Movie
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
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 50px rgba(255, 215, 0, 0.4);
    }
    50% {
        box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.6);
    }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const sparkle = keyframes`
    0%, 100% { opacity: 0; transform: translateY(0px) scale(1); }
    50% { opacity: 1; transform: translateY(-10px) scale(1.2); }
`;

// =================== STYLES CORRIGÉS ===================

// ✅ AJOUT : Section conteneur avec overflow corrigé
const SectionContainer = styled(Container)(({ theme }) => ({
    padding: '40px 20px',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    maxWidth: 'none !important',
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    overflow: 'hidden', // ✅ CHANGÉ : Permettre débordement

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
            radial-gradient(1px 1px at 20px 30px, rgba(218, 165, 32, 0.3), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(244, 208, 63, 0.2), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(205, 133, 63, 0.3), transparent)
        `,
        animation: `${sparkle} 6s ease-in-out infinite`,
        pointerEvents: 'none',
        opacity: 0.4
    },

    [theme.breakpoints.up('md')]: {
        padding: '60px 40px',
    }
}));

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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center', // ✅ REMETTRE : Centré
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    maxWidth: '1200px', // ✅ AJOUTÉ : Largeur max
    margin: '0 auto 32px auto', // ✅ AJOUTÉ : Centrage
    padding: '0 20px', // ✅ AJOUTÉ : Padding

    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        gap: '16px',
        textAlign: 'center'
    }
}));

const SeeAllButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #DAA520, #B8860B)',
    color: '#000',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '50px',
    textTransform: 'none',
    fontSize: '1rem',
    position: 'absolute', // ✅ REMETTRE : Position absolue
    right: '20px', // ✅ CHANGÉ : Plus loin du bord
    overflow: 'hidden',

    [theme.breakpoints.down('md')]: {
        position: 'static',
        marginTop: '16px'
    },

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        animation: `${shimmer} 2s infinite`,
    },

    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',
        animation: `${glow} 2s infinite`
    }
}));

// ========== CAROUSEL CORRIGÉ ==========

const CarouselWrapper = styled(Box)({
    position: 'relative',
    width: '100%',
    overflow: 'hidden', // ✅ CHANGÉ : Retour à hidden pour éviter débordement
    borderRadius: '20px',
    minHeight: '420px',
    margin: '0 auto',
    padding: '0 80px', // ✅ CHANGÉ : Encore plus de padding

    '@media (max-width: 1200px)': {
        padding: '0 60px',
    },

    '@media (max-width: 900px)': {
        padding: '0 40px',
        minHeight: '400px',
    },

    '@media (max-width: 600px)': {
        padding: '0 20px',
        minHeight: '380px',
    }
});

const CarouselContainer = styled(Box)({
    display: 'flex',
    transition: 'transform 0.5s ease-in-out',
    gap: '16px',
    padding: '20px', // ✅ CHANGÉ : Padding normal tout autour
    alignItems: 'flex-start',
    minHeight: '400px',
    height: '400px',
    width: 'fit-content', // ✅ CHANGÉ : Largeur adaptée au contenu
});


const NavButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1000,
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.95), rgba(184, 134, 11, 0.95))',
    color: '#000',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(218, 165, 32, 0.5)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',

    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'translateY(-50%) scale(1.1)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',
    },

    '&.prev': {
        left: '10px', // ✅ CHANGÉ : Plus proche, dans la zone visible
    },

    '&.next': {
        right: '10px', // ✅ CHANGÉ : Plus proche, dans la zone visible
    },

    [theme.breakpoints.down('lg')]: {
        '&.prev': { left: '5px' },
        '&.next': { right: '5px' }
    },

    [theme.breakpoints.down('md')]: {
        width: '40px',
        height: '40px',
        '&.prev': { left: '0px' },
        '&.next': { right: '0px' }
    }
}));

const TopNavButton = styled(IconButton)(({ theme }) => ({
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(184, 134, 11, 0.9))',
    color: '#000',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',

    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'scale(1.1)',
        boxShadow: '0 4px 12px rgba(218, 165, 32, 0.4)',
    },

    [theme.breakpoints.down('md')]: {
        width: '35px',
        height: '35px',
    }
}));

const CarouselControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '0 20px',

    [theme.breakpoints.down('md')]: {
        padding: '0 10px',
    }
}));

const NavButtonsGroup = styled(Box)({
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
});

const CarouselProgress = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#B8860B',
    fontSize: '0.9rem',
    fontWeight: 500
});

const TrendingCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'isTop1'
})(({ isTop1 }) => ({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: isTop1 ? '2px solid #FFD700' : '1px solid rgba(218, 165, 32, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '410px',
    width: '280px',
    minWidth: '280px',
    maxWidth: '280px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',

    ...(isTop1 && {
        animation: `${goldenGlow} 3s ease-in-out infinite`,
    }),

    '&:hover': {
        transform: 'translateY(-5px) scale(1.02)',
        boxShadow: isTop1
            ? '0 20px 40px rgba(255, 215, 0, 0.3), 0 10px 25px rgba(0,0,0,0.4)'
            : '0 15px 30px rgba(0,0,0,0.3), 0 0 20px rgba(218, 165, 32, 0.2)',
        borderColor: isTop1 ? '#FFD700' : 'rgba(218, 165, 32, 0.3)',

        '& .trending-overlay': {
            opacity: 1
        },

        '& .trending-miniature': {
            transform: 'scale(1.08)',
            filter: 'brightness(1.1) contrast(1.1)'
        }
    }
}));

const TrendingMiniature = styled(Box)({
    position: 'relative',
    // ✅ CORRECTION : Hauteur encore réduite pour laisser plus de place au contenu
    height: '160px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    backgroundColor: '#1a1a1a',

    // Image de fond floutée
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

    // Image principale nette au centre
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
    }
});

const TrendingOverlay = styled(Box)({
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
        fontSize: '3rem',
        color: '#000',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
        animation: `${pulse} 2s infinite`
    }
});

const TrendingBadge = styled(Chip)(({ variant = 'trending' }) => ({
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 10,
    fontWeight: 700,
    fontSize: '0.65rem',
    height: '24px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',

    ...(variant === 'top1' ? {
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        color: '#000',
        animation: `${goldenGlow} 2s infinite`,
        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)',
    } : {
        background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        color: '#fff',
        animation: `${glow} 2s infinite`,
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
    }),

    '& .MuiChip-label': {
        padding: '0 8px',
    }
}));

const TrendingInfo = styled(CardContent)({
    padding: '16px',
    color: '#fff',
    flex: 1, // ✅ AJOUTÉ : Prendre l'espace restant
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // ✅ CHANGÉ : Répartir l'espace
    gap: '8px',
    minHeight: 0, // ✅ AJOUTÉ : Permettre la compression
});

const TrendingTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '0.9rem', // ✅ CHANGÉ : Plus petit
    color: '#F5E6D3',
    lineHeight: 1.2, // ✅ CHANGÉ : Plus compact
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: 0 // ✅ CHANGÉ : Retirer la marge
});


const StatsContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: 0
});

const StatBadge = styled(Box)(({ variant = 'default' }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.7rem',
    fontWeight: 500,

    ...(variant === 'views' ? {
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.2))',
        color: '#4CAF50',
        border: '1px solid rgba(76, 175, 80, 0.3)'
    } : variant === 'likes' ? {
        background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 87, 34, 0.2))',
        color: '#FF6B9D',
        border: '1px solid rgba(255, 107, 157, 0.3)'
    } : variant === 'duration' ? {
        background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.2), rgba(25, 118, 210, 0.2))',
        color: '#2196F3',
        border: '1px solid rgba(33, 150, 243, 0.3)'
    } : variant === 'studio' ? {
        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(142, 36, 170, 0.2))',
        color: '#9C27B0',
        border: '1px solid rgba(156, 39, 176, 0.3)'
    } : variant === 'site' ? {
        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2), rgba(245, 124, 0, 0.2))',
        color: '#FF9800',
        border: '1px solid rgba(255, 152, 0, 0.3)'
    } : variant === 'tag' ? {
        background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.2), rgba(94, 53, 177, 0.2))',
        color: '#673AB7',
        border: '1px solid rgba(103, 58, 183, 0.3)'
    } : {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
        color: '#DAA520',
        border: '1px solid rgba(218, 165, 32, 0.3)'
    })
}));

const ActressSection = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: 'auto',
    padding: '12px 16px', // ✅ CHANGÉ : Plus de padding
    borderTop: '1px solid rgba(218, 165, 32, 0.2)', // ✅ CHANGÉ : Bordure plus visible
    backgroundColor: 'rgba(218, 165, 32, 0.1)', // ✅ CHANGÉ : Fond plus visible
    borderRadius: '0 0 16px 16px', // ✅ CHANGÉ : Coins arrondis en bas
    margin: '0 -16px -16px -16px', // ✅ CHANGÉ : Étendre jusqu'aux bords
});

const ActressAvatar = styled(Avatar)({
    width: '24px', // ✅ CHANGÉ : Plus grand
    height: '24px',
    border: '2px solid rgba(218, 165, 32, 0.8)', // ✅ CHANGÉ : Bordure plus épaisse
    fontSize: '0.8rem', // ✅ CHANGÉ : Icône plus grande
    backgroundColor: '#DAA520',
});

const ActressName = styled(Typography)({
    color: '#F5E6D3',
    fontSize: '0.75rem', // ✅ CORRECTION : Taille augmentée
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
});

const DotsContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '24px',
    gap: '8px'
});

const Dot = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'active'
})(({ active }) => ({
    width: active ? '24px' : '8px',
    height: '8px',
    borderRadius: '4px',
    background: active
        ? 'linear-gradient(90deg, #DAA520, #F4D03F)'
        : 'rgba(218, 165, 32, 0.3)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',

    '&:hover': {
        background: active
            ? 'linear-gradient(90deg, #F4D03F, #DAA520)'
            : 'rgba(218, 165, 32, 0.5)',
    }
}));

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    color: '#DAA520'
});

const ErrorContainer = styled(Box)({
    textAlign: 'center',
    padding: '40px 20px',
    color: '#FF6B6B'
});

// =================== UTILITY FUNCTIONS ===================

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

const buildActressImageUrl = (photoPath, apiBaseUrl) => {
    if (!photoPath) return null;

    try {
        if (photoPath.startsWith('http')) return photoPath;

        const normalizedPath = photoPath.trim();
        let actriceName, fileName;

        if (normalizedPath.includes('/images/')) {
            const index = normalizedPath.indexOf('/images/');
            const afterEndpoint = normalizedPath.substring(index + '/images/'.length);
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
            return `${apiBaseUrl}/images/${encodeURIComponent(cleanActriceName)}/${encodeURIComponent(cleanFileName)}`;
        }

        return null;
    } catch (error) {
        console.error('Erreur construction URL photo actrice:', error);
        return null;
    }
};

// =================== COMPOSANT PRINCIPAL ===================

const TrendingCarousel = ({
                              apiBaseUrl = "http://127.0.0.1:5000",
                              maxItems = 10,
                              onSceneClick = null,
                              onSeeAllClick = null,
                              autoplayDelay = 4000
                          }) => {
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);

    const containerRef = useRef(null);
    const autoplayRef = useRef(null);

    /// ✅ CORRECTION : Fonction de calcul responsive améliorée
    const getVisibleCount = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            const cardWidth = 280;
            const cardGap = 16;
            const cardWithGap = cardWidth + cardGap;

            // ✅ CHANGÉ : Padding du wrapper corrigé
            const wrapperPadding = 120; // Plus de padding pour éviter coupure

            // Largeur max du container
            const maxWidth = Math.min(1400, width);

            // Largeur disponible pour les cartes
            const availableWidth = maxWidth - wrapperPadding;

            // Calculer combien de cartes complètes peuvent tenir
            const maxCards = Math.floor(availableWidth / cardWithGap);

            // S'assurer qu'on a au moins 1 carte et max 4 (pour éviter surcharge)
            return Math.min(Math.max(1, maxCards), 4);
        }
        return 3; // ✅ CHANGÉ : Défaut plus conservateur
    };

    const [visibleCount, setVisibleCount] = useState(getVisibleCount());

    useEffect(() => {
        const handleResize = () => {
            setVisibleCount(getVisibleCount());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                setLoading(true);
                setError(null);

                // ✅ CORRECTION : Utiliser vos vraies APIs
                const [scenesRes, favoritesRes, historyRes] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/scenes`),
                    axios.get(`${apiBaseUrl}/api/favorites`).catch(() => ({ data: [] })),
                    axios.get(`${apiBaseUrl}/api/history`).catch(() => ({ data: [] }))
                ]);

                const scenesData = scenesRes.data;
                const favoritesData = favoritesRes.data;
                const historyData = historyRes.data;

                setFavorites(favoritesData);
                setHistory(historyData);

                // ✅ CORRECTION : Calcul des vraies stats trending
                let trendingScenes = scenesData.map(scene => {
                    // Calculer les vraies stats
                    const isFavorite = favoritesData.some(fav => fav.scene_id === scene.id);
                    const historyEntry = historyData.find(hist => hist.scene_id === scene.id);
                    const viewCount = historyEntry ? (historyEntry.nb_vues || 1) : 0;

                    // Score trending basé sur des vraies métriques
                    const noteScore = (parseFloat(scene.note_perso) || 0) * 200;
                    const favoriteBonus = isFavorite ? 500 : 0;
                    const viewBonus = viewCount * 100;
                    const recentBonus = scene.date_ajout ?
                        (new Date() - new Date(scene.date_ajout)) < 30 * 24 * 60 * 60 * 1000 ? 300 : 0 : 0;

                    const trendingScore = noteScore + favoriteBonus + viewBonus + recentBonus;

                    return {
                        ...scene,
                        viewCount: viewCount,
                        likeCount: isFavorite ? 1 : 0,
                        trendingScore: trendingScore,
                        isFavorite: isFavorite,
                        isInHistory: viewCount > 0
                    };
                });

                // Trier par score trending et garder les top
                trendingScenes.sort((a, b) => b.trendingScore - a.trendingScore);
                trendingScenes = trendingScenes.slice(0, maxItems);

                setScenes(trendingScenes);
            } catch (err) {
                console.error('Erreur chargement trending:', err);
                setError('Impossible de charger le contenu tendance');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, [apiBaseUrl, maxItems]);

    // Autoplay
    useEffect(() => {
        if (autoplay && scenes.length > visibleCount) {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    const maxIndex = scenes.length - visibleCount;
                    return prev >= maxIndex ? 0 : prev + 1;
                });
            }, autoplayDelay);
        }

        return () => {
            if (autoplayRef.current) {
                clearInterval(autoplayRef.current);
            }
        };
    }, [autoplay, scenes.length, visibleCount, autoplayDelay]);

    const handlePrev = () => {
        setAutoplay(false);
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, scenes.length - visibleCount);
            return prev > 0 ? prev - 1 : maxIndex;
        });
        setTimeout(() => setAutoplay(true), 5000);
    };

    const handleNext = () => {
        setAutoplay(false);
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, scenes.length - visibleCount);
            return prev < maxIndex ? prev + 1 : 0;
        });
        setTimeout(() => setAutoplay(true), 5000);
    };

    const handleDotClick = (index) => {
        setAutoplay(false);
        setCurrentIndex(index);
        setTimeout(() => setAutoplay(true), 5000);
    };

    const handleSceneClick = (scene) => {
        if (onSceneClick) {
            onSceneClick(scene);
        } else {
            console.log('Voir scène trending:', scene);
        }
    };

    const handleSeeAllClick = () => {
        if (onSeeAllClick) {
            onSeeAllClick();
        } else {
            console.log('Voir tout le contenu trending');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return buildImageUrl(imagePath, apiBaseUrl);
    };

    const getActressImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;
        return buildActressImageUrl(photoPath, apiBaseUrl);
    };

    // ✅ CORRECTION : Calcul plus précis
    const cardWidth = 280;
    const cardGap = 16;
    const cardWithGap = cardWidth + cardGap;

    // Calculer la position exacte
    const translateX = -(currentIndex * cardWithGap);

    const maxDots = Math.max(0, scenes.length - visibleCount + 1);

    // Rendu du loading
    if (loading) {
        return (
            <SectionContainer>
                <SectionTitle>🔥 Tendances</SectionTitle>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement des tendances...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // Rendu d'erreur
    if (error) {
        return (
            <SectionContainer>
                <SectionTitle>🔥 Tendances</SectionTitle>
                <ErrorContainer>
                    <Alert severity="error" sx={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                        {error}
                    </Alert>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    if (!scenes.length) {
        return (
            <SectionContainer>
                <SectionTitle>🔥 Tendances</SectionTitle>
                <ErrorContainer>
                    <Typography variant="h6" sx={{ color: '#B8860B', fontStyle: 'italic' }}>
                        Aucun contenu tendance pour le moment
                    </Typography>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer>
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionHeader>
                        <SectionTitle>🔥 Tendances</SectionTitle>
                        <SeeAllButton
                            endIcon={<ArrowForward />}
                            onClick={handleSeeAllClick}
                        >
                            Voir tout
                        </SeeAllButton>
                    </SectionHeader>

                    <Box sx={{ position: 'relative', width: '100%', margin: '0 auto' }}>
                        {/* Contrôles en haut */}
                        {scenes.length > visibleCount && (
                            <CarouselControls>
                                <CarouselProgress>
                                    {currentIndex + 1} - {Math.min(currentIndex + visibleCount, scenes.length)} sur {scenes.length}
                                </CarouselProgress>

                                <NavButtonsGroup>
                                    <TopNavButton onClick={handlePrev} disabled={currentIndex === 0}>
                                        <ChevronLeft />
                                    </TopNavButton>
                                    <TopNavButton
                                        onClick={handleNext}
                                        disabled={currentIndex >= scenes.length - visibleCount}
                                    >
                                        <ChevronRight />
                                    </TopNavButton>
                                </NavButtonsGroup>
                            </CarouselControls>
                        )}

                        <CarouselWrapper>
                            <CarouselContainer
                                ref={containerRef}
                                sx={{
                                    transform: `translateX(${translateX}px)`
                                }}
                            >
                                {scenes.map((scene, index) => {
                                    const imageUrl = getImageUrl(scene.image);
                                    const mainActress = scene.actrices && scene.actrices.length > 0 ? scene.actrices[0] : null;
                                    const actressImageUrl = mainActress ? getActressImageUrl(mainActress.photo) : null;
                                    const isTop1 = index === 0;

                                    return (
                                        <TrendingCard
                                            key={`trending-scene-${scene.id}-${index}`}
                                            isTop1={isTop1}
                                            onClick={() => handleSceneClick(scene)}
                                        >
                                            <TrendingBadge
                                                label={isTop1 ? "👑 #1" : "🔥 TRENDING"}
                                                variant={isTop1 ? "top1" : "trending"}
                                                size="small"
                                            />

                                            <TrendingMiniature
                                                className="trending-miniature"
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
                                                        <Movie sx={{ fontSize: 'inherit' }} />
                                                    </Box>
                                                )}

                                                <TrendingOverlay className="trending-overlay">
                                                    <PlayCircleOutline />
                                                </TrendingOverlay>
                                            </TrendingMiniature>

                                            <TrendingInfo>
                                                {/* Titre en haut */}
                                                <TrendingTitle>
                                                    {scene.titre || 'Sans titre'}
                                                </TrendingTitle>

                                                {/* 1ère ligne : Vue, Favoris, Temps, Score */}
                                                <StatsContainer sx={{ marginBottom: '12px' }}>
                                                    {scene.viewCount > 0 && (
                                                        <StatBadge variant="views">
                                                            <Visibility sx={{ fontSize: '0.8rem' }} />
                                                            {scene.viewCount > 1000 ?
                                                                `${(scene.viewCount / 1000).toFixed(1)}k` :
                                                                scene.viewCount
                                                            }
                                                        </StatBadge>
                                                    )}

                                                    {scene.isFavorite && (
                                                        <StatBadge variant="likes">
                                                            <Favorite sx={{ fontSize: '0.8rem' }} />
                                                            Favori
                                                        </StatBadge>
                                                    )}

                                                    {scene.duree && (
                                                        <StatBadge variant="duration">
                                                            <AccessTime sx={{ fontSize: '0.8rem' }} />
                                                            {scene.duree}min
                                                        </StatBadge>
                                                    )}

                                                    {scene.note_perso && (
                                                        <StatBadge>
                                                            <Star sx={{ fontSize: '0.8rem' }} />
                                                            {scene.note_perso}
                                                        </StatBadge>
                                                    )}
                                                </StatsContainer>

                                                {/* 2ème ligne : Studio et Site */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px',
                                                    minHeight: '20px' // Pour garder l'espace même si vide
                                                }}>
                                                    {scene.studio && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Box sx={{
                                                                width: '14px',
                                                                height: '14px',
                                                                backgroundColor: '#B8860B',
                                                                borderRadius: '2px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.5rem',
                                                                fontWeight: 'bold',
                                                                color: '#000'
                                                            }}>
                                                                S
                                                            </Box>
                                                            <Typography sx={{
                                                                color: '#B8860B',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 400,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                {scene.studio}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {scene.site && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Box sx={{
                                                                width: '14px',
                                                                height: '14px',
                                                                backgroundColor: '#4CAF50',
                                                                borderRadius: '2px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.5rem',
                                                                fontWeight: 'bold',
                                                                color: '#000'
                                                            }}>
                                                                W
                                                            </Box>
                                                            <Typography sx={{
                                                                color: '#B8860B',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 400,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                fontStyle: 'italic'
                                                            }}>
                                                                {scene.site}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* 3ème ligne : Section actrice */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '12px',
                                                    padding: '8px 12px',
                                                    backgroundColor: 'rgba(218, 165, 32, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(218, 165, 32, 0.2)'
                                                }}>
                                                    <ActressAvatar
                                                        src={actressImageUrl}
                                                        alt={mainActress?.nom || 'Actrice'}
                                                    >
                                                        <Person sx={{ fontSize: '0.8rem' }} />
                                                    </ActressAvatar>
                                                    <ActressName>
                                                        {mainActress?.nom || 'Actrice inconnue'}
                                                    </ActressName>
                                                </Box>

                                                {/* 4ème ligne : Tags en bas */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    flexWrap: 'wrap',
                                                    marginTop: 'auto' // Pousse les tags vers le bas
                                                }}>
                                                    {scene.tags && scene.tags.slice(0, 3).map((tag, tagIndex) => (
                                                        <Chip
                                                            key={`tag-${scene.id}-${tagIndex}`}
                                                            label={typeof tag === 'object' ? tag.nom : tag}
                                                            size="small"
                                                            sx={{
                                                                fontSize: '0.55rem',
                                                                height: '18px',
                                                                background: 'rgba(218, 165, 32, 0.15)',
                                                                color: '#DAA520',
                                                                border: '1px solid rgba(218, 165, 32, 0.3)',
                                                                '& .MuiChip-label': {
                                                                    padding: '0 6px',
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </TrendingInfo>
                                        </TrendingCard>
                                    );
                                })}
                            </CarouselContainer>
                        </CarouselWrapper>
                    </Box>

                    {/* Dots de navigation */}
                    {maxDots > 1 && (
                        <DotsContainer>
                            {Array.from({ length: maxDots }).map((_, index) => (
                                <Dot
                                    key={`dot-${index}`}
                                    active={index === currentIndex}
                                    onClick={() => handleDotClick(index)}
                                />
                            ))}
                        </DotsContainer>
                    )}
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default TrendingCarousel;