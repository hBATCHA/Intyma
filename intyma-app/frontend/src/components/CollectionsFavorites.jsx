import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Container,
    Fade,
    CircularProgress,
    Alert,
    Badge
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
    PlayCircleOutline,
    Favorite,
    Visibility,
    Star,
    VideoLibrary,
    NewReleases,
    WhatshotOutlined
} from '@mui/icons-material';
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

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const slideInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// =================== STYLES PERSONNALISÉS ===================

const SectionContainer = styled(Container)(({ theme }) => ({
    padding: '40px 20px',
    backgroundColor: '#1a1a1a',

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

const CollectionsGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',

    [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    },

    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '32px',
    },

    [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
    }
}));

const CollectionCard = styled(Card)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',

    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(218, 165, 32, 0.4)',
        borderColor: 'rgba(218, 165, 32, 0.5)',
        animation: `${glow} 2s infinite`,

        '& .collection-overlay': {
            opacity: 1
        },

        '& .collection-image': {
            transform: 'scale(1.08)',
            filter: 'brightness(1.1) contrast(1.1)'
        },

        '& .premium-badge': {
            animation: `${pulse} 1.5s infinite`,
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
        }
    }
});

const CollectionImage = styled(CardMedia)({
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s ease',

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
    }
});

const ImageOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Overlay plus discret et avec meilleur contraste
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.85), rgba(184, 134, 11, 0.9))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 2,

    '& .MuiSvgIcon-root': {
        fontSize: '4rem',
        color: '#000',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
        animation: `${pulse} 2s infinite`
    }
});

const BadgeContainer = styled(Box)({
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10, // Z-index plus élevé pour passer au-dessus de l'overlay
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
    alignItems: 'flex-end'
});

const PremiumBadge = styled(Chip)(({ variant = 'premium' }) => {
    const getVariantStyles = () => {
        switch(variant) {
            case 'favoris':
                return {
                    background: 'linear-gradient(135deg, #FF6B9D, #FF8A65)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            case 'qualite':
                return {
                    background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
                    color: '#000',
                    textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                };
            case 'actrice':
                return {
                    background: 'linear-gradient(135deg, #AB47BC, #8E24AA)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            case 'studio':
                return {
                    background: 'linear-gradient(135deg, #FF7043, #FF5722)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            case 'site':
                return {
                    background: 'linear-gradient(135deg, #26A69A, #00796B)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            case 'nouveau':
                return {
                    background: 'linear-gradient(135deg, #66BB6A, #4CAF50)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            case 'hot':
                return {
                    background: 'linear-gradient(135deg, #FF5722, #F44336)',
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.7)'
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                    color: '#000',
                    textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                };
        }
    };

    return {
        fontSize: '0.7rem',
        fontWeight: 700,
        height: '24px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        border: '2px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        ...getVariantStyles(),

        '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.8)'
        }
    };
});

const CollectionInfo = styled(CardContent)({
    padding: '20px',
    color: '#fff'
});

const CollectionTitle = styled(Typography)({
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: '1.2rem',
    color: '#F5E6D3',
    marginBottom: '12px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
});

const StatsContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '12px'
});

const StatItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#DAA520',
    fontSize: '0.85rem',
    fontWeight: 500
});

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

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    color: '#888'
});

// =================== COMPOSANT PRINCIPAL ===================

const CollectionsFavorites = ({
                                  apiBaseUrl = "http://127.0.0.1:5000",
                                  onCollectionClick = null,
                                  title = "📚 Vos Collections Favorites",
                                  maxItems = 8
                              }) => {
    // États
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chargement des données
    useEffect(() => {
        const loadCollections = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${apiBaseUrl}/api/collections_favorites`);
                const collectionsData = response.data || [];

                // Limiter le nombre d'items si spécifié
                setCollections(collectionsData.slice(0, maxItems));
            } catch (err) {
                console.error('Erreur chargement collections:', err);
                setError('Impossible de charger vos collections');
            } finally {
                setLoading(false);
            }
        };

        loadCollections();
    }, [apiBaseUrl, maxItems]);

    // Gestion du clic sur une collection
    const handleCollectionClick = (collection) => {
        if (onCollectionClick) {
            onCollectionClick(collection);
        } else {
            console.log('Collection sélectionnée:', collection);
        }
    };

    // Construction de l'URL de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-collection.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${apiBaseUrl}${imagePath}`;
    };

    // Déterminer le type de badge
    const getBadgeVariant = (type) => {
        switch(type) {
            case 'favoris': return 'favoris';
            case 'qualite': return 'qualite';
            case 'actrice': return 'actrice';
            case 'studio': return 'studio';
            case 'site': return 'site';
            case 'recent': return 'nouveau';
            default: return 'premium';
        }
    };

    // Déterminer le texte du badge
    const getBadgeText = (type, collection) => {
        switch(type) {
            case 'favoris': return '❤️ FAVORIS';
            case 'qualite': return '🎬 HD';
            case 'actrice': return '⭐ ACTRICE';
            case 'studio': return '🎭 STUDIO';
            case 'site': return '🌐 SITE';
            case 'recent': return '🆕 RÉCENT';
            default: return '👑 PREMIUM';
        }
    };

    // Déterminer si c'est nouveau/hot (logique exemple)
    const getSpecialBadge = (collection) => {
        if (collection.nb_videos > 50) return { text: '🔥 HOT', variant: 'hot' };
        if (collection.nb_vues < 20) return { text: '✨ NOUVEAU', variant: 'nouveau' };
        return null;
    };

    // ✨ NOUVEAU : Badges spéciaux pour les actrices
    const getActriceBadges = (collection) => {
        const badges = [];

        if (collection.type === 'actrice') {
            // Badge TOP si c'est l'actrice la plus regardée
            if (collection.is_top_actress) {
                badges.push({ text: '👑 TOP', variant: 'premium' });
            }

            // Badge HOT si elle a beaucoup de scènes hot
            if (collection.hot_scenes_count && collection.hot_scenes_count > 0) {
                badges.push({
                    text: `🔥 ${collection.hot_scenes_count} HOT`,
                    variant: 'hot'
                });
            }

            // Badge STAR si note moyenne très élevée
            if (collection.note_moyenne && collection.note_moyenne >= 4.5) {
                badges.push({ text: '⭐ STAR', variant: 'premium' });
            }

            // Badge POPULAIRE si beaucoup de vues
            if (collection.nb_vues > 100) {
                badges.push({ text: '📈 POPULAIRE', variant: 'nouveau' });
            }
        }

        return badges;
    };

    // Rendu du loading
    if (loading) {
        return (
            <SectionContainer>
                <SectionTitle>{title}</SectionTitle>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement de vos collections...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // Rendu d'erreur
    if (error) {
        return (
            <SectionContainer>
                <SectionTitle>{title}</SectionTitle>
                <ErrorContainer>
                    <Alert severity="error" sx={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                        {error}
                    </Alert>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    // Rendu état vide
    if (collections.length === 0) {
        return (
            <SectionContainer>
                <SectionTitle>{title}</SectionTitle>
                <EmptyState>
                    <VideoLibrary sx={{ fontSize: '4rem', color: '#444', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                        Aucune collection trouvée
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                        Vos collections favorites apparaîtront ici
                    </Typography>
                </EmptyState>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionTitle>{title}</SectionTitle>

                    <CollectionsGrid>
                        {collections.map((collection, index) => {
                            const specialBadge = getSpecialBadge(collection);

                            return (
                                <Fade
                                    key={collection.id}
                                    in={true}
                                    timeout={1200 + (index * 150)}
                                >
                                    <CollectionCard onClick={() => handleCollectionClick(collection)}>
                                        <CollectionImage
                                            className="collection-image"
                                            image={getImageUrl(collection.image)}
                                            title={collection.titre}
                                        >
                                            <ImageOverlay className="collection-overlay">
                                                <PlayCircleOutline />
                                            </ImageOverlay>

                                            <BadgeContainer>
                                                {/* Badge principal */}
                                                <PremiumBadge
                                                    className="premium-badge"
                                                    label={getBadgeText(collection.type, collection)}
                                                    variant={getBadgeVariant(collection.type)}
                                                    size="small"
                                                />

                                                {/* ✨ NOUVEAU : Badges spéciaux pour les actrices */}
                                                {collection.type === 'actrice' && getActriceBadges(collection).map((badge, badgeIndex) => (
                                                    <PremiumBadge
                                                        key={badgeIndex}
                                                        label={badge.text}
                                                        variant={badge.variant}
                                                        size="small"
                                                    />
                                                ))}

                                                {/* Badge spécial général (HOT/NOUVEAU) - seulement si pas d'actrice */}
                                                {collection.type !== 'actrice' && specialBadge && (
                                                    <PremiumBadge
                                                        label={specialBadge.text}
                                                        variant={specialBadge.variant}
                                                        size="small"
                                                    />
                                                )}
                                            </BadgeContainer>
                                        </CollectionImage>

                                        <CollectionInfo>
                                            <CollectionTitle variant="h6">
                                                {collection.titre}
                                            </CollectionTitle>

                                            <StatsContainer>
                                                <StatItem>
                                                    <VideoLibrary fontSize="small" />
                                                    {collection.nb_videos} vidéos
                                                </StatItem>

                                                <StatItem>
                                                    <Visibility fontSize="small" />
                                                    {collection.nb_vues} vues
                                                </StatItem>
                                            </StatsContainer>
                                        </CollectionInfo>
                                    </CollectionCard>
                                </Fade>
                            );
                        })}
                    </CollectionsGrid>
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default CollectionsFavorites;