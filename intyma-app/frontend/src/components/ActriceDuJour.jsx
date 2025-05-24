import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Grid,
    Container,
    Fade,
    CircularProgress,
    Alert,
    Rating,
    Skeleton
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
    Person,
    PlayCircleOutline,
    Star,
    AccessTime,
    Visibility,
    FavoriteOutlined
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

const ActriceCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',

    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(218, 165, 32, 0.3)',
        borderColor: 'rgba(218, 165, 32, 0.4)',
    },

    [theme.breakpoints.down('md')]: {
        marginBottom: '24px'
    }
}));

const ActricePhoto = styled(CardMedia)({
    position: 'relative',
    width: '100%',
    height: 380,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',

    // Fond flouté (cover)
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        backgroundImage: `inherit`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 18%',
        filter: 'blur(10px) brightness(0.5)',
        zIndex: 1,
    },

    // Image nette centrée (contain)
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '93%',
        height: '93%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: `inherit`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 2,
        borderRadius: '14px',
    }
});

const ActriceInfo = styled(CardContent)({
    padding: '24px',
    color: '#fff',
});

const ActriceName = styled(Typography)({
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: '1.6rem',
    color: '#F5E6D3',
    marginBottom: '8px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
});

const StatsContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap'
});

const StatItem = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#DAA520',
    fontSize: '0.9rem',
    fontWeight: 500
});

const TagContainer = styled(Box)({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px'
});

const PremiumTag = styled(Chip)(({ variant = 'default' }) => ({
    fontSize: '0.75rem',
    fontWeight: 600,
    height: '24px',
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

const ActionButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520, #B8860B)',
    color: '#000',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '50px',
    textTransform: 'none',
    fontSize: '1rem',
    width: '100%',
    marginTop: '8px',
    position: 'relative',
    overflow: 'hidden',

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
});

const ScenesGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',

    [theme.breakpoints.up('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
    },

    [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
    },

    [theme.breakpoints.up('xl')]: {
        gridTemplateColumns: 'repeat(4, 1fr)',
    }
}));

const SceneCard = styled(Card)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(218, 165, 32, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',

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

// ✨ CORRIGÉ : Miniature avec contain + fond flou pour masquer les espaces
const SceneMiniature = styled(Box)({
    position: 'relative',
    height: '120px',
    overflow: 'hidden',
    transition: 'all 0.4s ease',
    backgroundColor: '#1a1a1a', // Fond de secours

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
    zIndex: 20, // Z-index encore plus élevé pour passer au-dessus de tout

    '& .MuiSvgIcon-root': {
        fontSize: '3rem',
        color: '#000',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
        animation: `${pulse} 2s infinite`
    }
});

const SceneInfo = styled(CardContent)({
    padding: '16px',
    color: '#fff'
});

const SceneTitle = styled(Typography)({
    fontWeight: 600,
    fontSize: '0.9rem',
    color: '#F5E6D3',
    marginBottom: '8px',
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
    marginBottom: '8px',
    fontSize: '0.8rem',
    color: '#DAA520'
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

// =================== COMPOSANT PRINCIPAL ===================

const ActriceDuJour = ({
                           apiBaseUrl = "http://127.0.0.1:5000",
                           onActriceClick = null,
                           onSceneClick = null
                       }) => {
    // États
    const [actrice, setActrice] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chargement des données
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Appels API parallèles
                const [actriceResponse, scenesResponse] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/actrice_du_jour`),
                    axios.get(`${apiBaseUrl}/api/scenes_du_jour`)
                ]);

                setActrice(actriceResponse.data);
                setScenes(scenesResponse.data);
            } catch (err) {
                console.error('Erreur chargement données:', err);
                setError('Impossible de charger les données du jour');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [apiBaseUrl]);

    // Gestion des clics
    const handleActriceClick = () => {
        if (onActriceClick) {
            onActriceClick(actrice);
        } else {
            console.log('Voir fiche actrice:', actrice);
        }
    };

    const handleSceneClick = (scene) => {
        if (onSceneClick) {
            onSceneClick(scene);
        } else {
            console.log('Voir scène:', scene);
        }
    };

    // Construction de l'URL de l'image
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/placeholder-actress.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        return `${apiBaseUrl}${imagePath}`;
    };

    // Rendu du loading
    if (loading) {
        return (
            <SectionContainer>
                <SectionTitle>✨ Sélection du Jour</SectionTitle>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement de la sélection...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // Rendu d'erreur
    if (error) {
        return (
            <SectionContainer>
                <SectionTitle>✨ Sélection du Jour</SectionTitle>
                <ErrorContainer>
                    <Alert severity="error" sx={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                        {error}
                    </Alert>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionTitle>✨ Sélection du Jour</SectionTitle>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },  // Colonne sur mobile, ligne sur desktop
                        gap: 4,
                        alignItems: 'flex-start'
                    }}>
                        {/* Carte Actrice - GAUCHE */}
                        <Box sx={{
                            flex: { xs: '1', md: '0 0 400px' },  // Pleine largeur sur mobile
                            minWidth: { xs: 'auto', md: '350px' },  // Pas de minWidth sur mobile
                            width: { xs: '100%', md: 'auto' }  // 100% sur mobile
                        }}>
                            <Fade in={true} timeout={1200}>
                                <ActriceCard>
                                    {actrice?.photo && (
                                        <ActricePhoto
                                            image={getImageUrl(actrice.photo)}
                                            title={actrice.nom}
                                        />
                                    )}

                                    <ActriceInfo>
                                        <ActriceName variant="h5">
                                            {actrice?.nom || 'Actrice mystère'}
                                        </ActriceName>

                                        <StatsContainer>
                                            <StatItem>
                                                <PlayCircleOutline fontSize="small" />
                                                {actrice?.nb_scenes || 0} scènes
                                            </StatItem>

                                            {actrice?.note_moyenne && (
                                                <StatItem>
                                                    <Star fontSize="small" />
                                                    {actrice.note_moyenne.toFixed(1)}
                                                </StatItem>
                                            )}
                                        </StatsContainer>

                                        {actrice?.tags && (
                                            <TagContainer>
                                                {actrice.tags.slice(0, 3).map((tag, index) => (
                                                    <PremiumTag
                                                        key={index}
                                                        label={tag}
                                                        variant={index === 0 ? 'premium' : 'default'}
                                                        size="small"
                                                    />
                                                ))}
                                            </TagContainer>
                                        )}

                                        {actrice?.bio && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#ccc',
                                                    lineHeight: 1.5,
                                                    mb: 2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {actrice.bio}
                                            </Typography>
                                        )}

                                        <ActionButton
                                            onClick={handleActriceClick}
                                            startIcon={<Person />}
                                        >
                                            Voir la fiche
                                        </ActionButton>
                                    </ActriceInfo>
                                </ActriceCard>
                            </Fade>
                        </Box>

                        {/* Scènes - DROITE */}
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#F5E6D3',
                                    mb: 3,
                                    fontWeight: 600,
                                    fontSize: '1.3rem'
                                }}
                            >
                                🔥 Scènes en vedette
                            </Typography>

                            <ScenesGrid>
                                {scenes.map((scene, index) => (
                                    <Fade
                                        key={scene.id}
                                        in={true}
                                        timeout={1400 + (index * 200)}
                                    >
                                        <SceneCard onClick={() => handleSceneClick(scene)}>
                                            {/* ✨ NOUVEAU : Utilisation de backgroundImage au lieu d'img */}
                                            <SceneMiniature
                                                className="scene-miniature"
                                                sx={{
                                                    backgroundImage: `url(${getImageUrl(scene.miniature)})`
                                                }}
                                            >
                                                <SceneOverlay className="scene-overlay">
                                                    <PlayCircleOutline />
                                                </SceneOverlay>
                                            </SceneMiniature>

                                            <SceneInfo>
                                                <SceneTitle variant="subtitle2">
                                                    {scene.titre}
                                                </SceneTitle>

                                                <SceneStats>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AccessTime fontSize="small" />
                                                        {scene.duree} min
                                                    </Box>

                                                    {scene.note && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Star fontSize="small" />
                                                            {scene.note.toFixed(1)}
                                                        </Box>
                                                    )}
                                                </SceneStats>

                                                {scene.tags && (
                                                    <TagContainer>
                                                        {scene.tags.slice(0, 2).map((tag, tagIndex) => (
                                                            <PremiumTag
                                                                key={tagIndex}
                                                                label={tag}
                                                                variant={tag === 'premium' || tag === 'hot' ? 'premium' : 'default'}
                                                                size="small"
                                                            />
                                                        ))}
                                                    </TagContainer>
                                                )}
                                            </SceneInfo>
                                        </SceneCard>
                                    </Fade>
                                ))}
                            </ScenesGrid>
                        </Box>
                    </Box>
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default ActriceDuJour;