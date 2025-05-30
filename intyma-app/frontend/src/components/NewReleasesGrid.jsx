import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Fade,
    Grow,
    CircularProgress,
    Alert,
    Avatar
} from '@mui/material';
import {
    PlayCircleOutline,
    ArrowForward,
    Star,
    AccessTime,
    Person
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// =================== ANIMATIONS (reprises d'ActriceDuJour) ===================

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

// =================== STYLES PERSONNALISÉS (basés sur ActriceDuJour) ===================

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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',

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
    position: 'absolute',
    right: 0,
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

const ScenesGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',

    [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },

    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
    },

    [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: 'repeat(6, 1fr)',
    }
}));

const SceneCard = styled(Card)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '100%',

    '&:hover': {
        transform: 'translateY(-5px) scale(1.02)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.3), 0 0 20px rgba(218, 165, 32, 0.2)',
        borderColor: 'rgba(218, 165, 32, 0.3)',

        '& .scene-overlay': {
            opacity: 1
        },

        '& .scene-miniature': {
            transform: 'scale(1.08)',
            filter: 'brightness(1.1) contrast(1.1)'
        }
    }
});

const SceneMiniature = styled(Box)({
    position: 'relative',
    height: '160px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    backgroundColor: '#1a1a1a',

    // Image de fond floutée (même image pour remplir les espaces)
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

const SceneOverlay = styled(Box)({
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

const NewBadge = styled(Chip)({
    position: 'absolute',
    top: '8px',
    left: '8px',
    zIndex: 10,
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.7rem',
    height: '24px',
    borderRadius: '12px',
    animation: `${glow} 2s infinite`,

    '& .MuiChip-label': {
        padding: '0 8px',
    }
});

const SceneInfo = styled(CardContent)({
    padding: '12px',
    color: '#fff',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
});

const SceneTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '0.85rem',
    color: '#F5E6D3',
    marginBottom: '6px',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
});

const SceneStats = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '0.75rem',
    color: '#DAA520'
});

const PremiumTag = styled(Chip)(({ variant = 'default' }) => ({
    fontSize: '0.65rem',
    fontWeight: 600,
    height: '20px',
    border: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',

    ...(variant === 'premium' ? {
        background: 'linear-gradient(135deg, #DAA520, #B8860B)',
        color: '#000',
        '&:hover': {
            background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
            transform: 'scale(1.05)'
        }
    } : {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#DAA520',
        border: '1px solid rgba(218, 165, 32, 0.3)',
        '&:hover': {
            background: 'rgba(218, 165, 32, 0.1)',
            borderColor: '#DAA520'
        }
    }),

    transition: 'all 0.3s ease'
}));

const BottomSection = styled(Box)({
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
});

const ActressSection = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
});

const MetaSection = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
});

const MetaItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
});

const ActressAvatar = styled(Avatar)({
    width: '18px',
    height: '18px',
    border: '1px solid rgba(218, 165, 32, 0.5)',
    fontSize: '0.6rem',
    backgroundColor: '#DAA520',

    '& img': {
        objectFit: 'cover'
    }
});

const ActressName = styled(Typography)({
    color: '#F5E6D3',
    fontSize: '0.7rem',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1
});

const MetaText = styled(Typography)({
    color: '#B8860B',
    fontSize: '0.6rem',
    fontWeight: 400,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontStyle: 'italic'
});

const MiniTag = styled(Chip)({
    fontSize: '0.55rem',
    height: '16px',
    background: 'rgba(218, 165, 32, 0.15)',
    color: '#DAA520',
    border: '1px solid rgba(218, 165, 32, 0.3)',

    '& .MuiChip-label': {
        padding: '0 4px',
    }
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

// =================== UTILITY FUNCTIONS ===================

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    if (diffDays <= 30) return `Il y a ${Math.ceil(diffDays / 7)} semaines`;

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
    });
};

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

const isNewRelease = (dateString) => {
    if (!dateString) return false;
    const releaseDate = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return releaseDate > thirtyDaysAgo;
};

// =================== COMPOSANT PRINCIPAL ===================

const NewReleasesGrid = ({
                             apiBaseUrl = "http://127.0.0.1:5000",
                             maxItems = 8,
                             onSceneClick = null,
                             onSeeAllClick = null
                         }) => {
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewReleases = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(`${apiBaseUrl}/api/scenes`);
                let scenesData = response.data;

                // Trier par date d'ajout (plus récent en premier)
                scenesData.sort((a, b) => {
                    const dateA = new Date(a.date_ajout || 0);
                    const dateB = new Date(b.date_ajout || 0);
                    return dateB - dateA;
                });

                // Limiter le nombre d'éléments
                scenesData = scenesData.slice(0, maxItems);

                setScenes(scenesData);
            } catch (err) {
                console.error('Erreur chargement nouvelles sorties:', err);
                setError('Impossible de charger les nouvelles sorties');
            } finally {
                setLoading(false);
            }
        };

        fetchNewReleases();
    }, [apiBaseUrl, maxItems]);

    const handleSceneClick = (scene) => {
        if (onSceneClick) {
            onSceneClick(scene);
        } else {
            console.log('Voir scène:', scene);
        }
    };

    const handleSeeAllClick = () => {
        if (onSeeAllClick) {
            onSeeAllClick();
        } else {
            console.log('Voir toutes les nouvelles sorties');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-scene.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return buildImageUrl(imagePath, apiBaseUrl);
    };

    const getActressImageUrl = (photoPath) => {
        if (!photoPath) return null;
        if (photoPath.startsWith('http')) return photoPath;
        return buildActressImageUrl(photoPath, apiBaseUrl);
    };

    // Rendu du loading (style ActriceDuJour)
    if (loading) {
        return (
            <SectionContainer maxWidth="xl">
                <SectionTitle>🌟 Nouvelles Sorties</SectionTitle>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement des nouvelles sorties...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // Rendu d'erreur (style ActriceDuJour)
    if (error) {
        return (
            <SectionContainer maxWidth="xl">
                <SectionTitle>🌟 Nouvelles Sorties</SectionTitle>
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
            <SectionContainer maxWidth="xl">
                <SectionTitle>🌟 Nouvelles Sorties</SectionTitle>
                <ErrorContainer>
                    <Typography variant="h6" sx={{ color: '#B8860B', fontStyle: 'italic' }}>
                        Aucune nouvelle sortie pour le moment
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mt: 1 }}>
                        De nouveaux contenus seront bientôt disponibles
                    </Typography>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionHeader>
                        <SectionTitle>🌟 Nouvelles Sorties</SectionTitle>
                        <SeeAllButton
                            endIcon={<ArrowForward />}
                            onClick={handleSeeAllClick}
                        >
                            Voir tout
                        </SeeAllButton>
                    </SectionHeader>

                    <ScenesGrid>
                        {scenes.map((scene, index) => {
                            const imageUrl = getImageUrl(scene.image);
                            const isNew = isNewRelease(scene.date_ajout);
                            const mainActress = scene.actrices && scene.actrices.length > 0 ? scene.actrices[0] : null;
                            const actressImageUrl = mainActress ? getActressImageUrl(mainActress.photo) : null;

                            return (
                                <Fade
                                    key={scene.id}
                                    in={true}
                                    timeout={1200 + (index * 200)}
                                >
                                    <SceneCard onClick={() => handleSceneClick(scene)}>
                                        {isNew && (
                                            <NewBadge
                                                label="🆕 NEW"
                                                size="small"
                                            />
                                        )}

                                        <SceneMiniature
                                            className="scene-miniature"
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
                                                    fontSize: '2rem'
                                                }}>
                                                    🎬
                                                </Box>
                                            )}

                                            <SceneOverlay className="scene-overlay">
                                                <PlayCircleOutline />
                                            </SceneOverlay>
                                        </SceneMiniature>

                                        <SceneInfo>
                                            <div>
                                                <SceneTitle>
                                                    {scene.titre || 'Sans titre'}
                                                </SceneTitle>

                                                <SceneStats>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTime fontSize="small" />
                                                        {scene.duree ? `${scene.duree} min` : '-- min'}
                                                    </Box>

                                                    {scene.note_perso && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Star fontSize="small" />
                                                            {scene.note_perso}
                                                        </Box>
                                                    )}
                                                </SceneStats>

                                                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                                                    {scene.qualite && (
                                                        <PremiumTag
                                                            label={scene.qualite}
                                                            variant={scene.qualite === '4K' ? 'premium' : 'default'}
                                                            size="small"
                                                        />
                                                    )}
                                                    {scene.date_ajout && (
                                                        <PremiumTag
                                                            label={formatDate(scene.date_ajout)}
                                                            size="small"
                                                        />
                                                    )}
                                                </Box>
                                            </div>

                                            <BottomSection>
                                                {mainActress && (
                                                    <ActressSection>
                                                        <ActressAvatar
                                                            src={actressImageUrl}
                                                            alt={mainActress.nom}
                                                        >
                                                            👤
                                                        </ActressAvatar>
                                                        <ActressName>
                                                            {mainActress.nom}
                                                        </ActressName>
                                                    </ActressSection>
                                                )}

                                                <MetaSection>
                                                    {scene.studio && (
                                                        <MetaItem>
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
                                                            <MetaText>
                                                                {scene.studio}
                                                            </MetaText>
                                                        </MetaItem>
                                                    )}

                                                    {scene.site && (
                                                        <MetaItem>
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
                                                            <MetaText>
                                                                {scene.site}
                                                            </MetaText>
                                                        </MetaItem>
                                                    )}

                                                    {scene.tags && scene.tags.slice(0, 2).map((tag, tagIndex) => (
                                                        <MiniTag
                                                            key={tagIndex}
                                                            label={typeof tag === 'object' ? tag.nom : tag}
                                                            size="small"
                                                        />
                                                    ))}
                                                </MetaSection>
                                            </BottomSection>
                                        </SceneInfo>
                                    </SceneCard>
                                </Fade>
                            );
                        })}
                    </ScenesGrid>
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default NewReleasesGrid;