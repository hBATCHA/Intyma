import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    CircularProgress,
    Alert,
    Tooltip,
    IconButton,
    Chip,
    Container,
    Fade
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
    AutoAwesome,
    Info,
    PlayArrow,
    VideoLibrary,
    Schedule,
    Person,
    Visibility,
    Favorite,
    Star,
    TrendingUp,
    PlayCircleOutline,
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

const sparkle = keyframes`
    0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.8; }
    50% { transform: rotate(180deg) scale(1.2); opacity: 1; }
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
    marginBottom: '16px',
    color: '#F5E6D3',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',

    '& .MuiSvgIcon-root': {
        color: '#DAA520',
        fontSize: '2.2rem',
        animation: `${sparkle} 3s infinite`,
    }
}));

const SectionSubtitle = styled(Typography)({
    color: '#B8860B',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: '32px',
    fontSize: '1rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
});

const PremiumContainer = styled(Box)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '20px',
    border: '2px solid rgba(218, 165, 32, 0.3)',
    padding: '32px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.1), transparent)',
        animation: `${shimmer} 3s infinite`,
    },

    '&:hover': {
        borderColor: 'rgba(218, 165, 32, 0.5)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(218, 165, 32, 0.2)',
    }
});

const SurpriseButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520, #B8860B)',
    color: '#000',
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    fontSize: '1.2rem',
    padding: '16px 32px',
    borderRadius: '15px',
    textTransform: 'none',
    width: '100%',
    boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        transition: 'left 0.6s',
    },

    '&:hover': {
        background: 'linear-gradient(135deg, #B8860B, #DAA520)',
        transform: 'translateY(-3px) scale(1.02)',
        boxShadow: '0 12px 35px rgba(218, 165, 32, 0.6)',
        animation: `${glow} 2s infinite`,

        '&::before': {
            left: '100%',
        }
    },

    '&:disabled': {
        background: 'rgba(218, 165, 32, 0.3)',
        color: 'rgba(0, 0, 0, 0.5)',
        transform: 'none',
        animation: 'none'
    }
});

const SurpriseCard = styled(Card)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
    borderRadius: '15px',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    overflow: 'hidden',
    marginTop: '24px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
        borderColor: 'rgba(218, 165, 32, 0.5)',
    }
});

const SurpriseImage = styled(CardMedia)({
    height: 180,
    width: 260,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '18px',
    border: '3px solid rgba(218, 165, 32, 0.6)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
    flexShrink: 0,
    background: '#181818',

    // Ajout : image de fond floutée
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.4)',
        zIndex: 1,
    },
    // Ajout : image nette "contain" au centre
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
        zIndex: 2,
    }
});

const ActressImage = styled('div')(({ image }) => ({
    height: 200,
    width: 260,
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '4px solid rgba(218, 165, 32, 0.8)',
    boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
    background: '#181818',
    // Fond flouté
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -8,
        left: -8,
        right: -8,
        bottom: -8,
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.4)',
        zIndex: 1,
    },
    // Image nette "contain" au centre
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '92%',
        height: '92%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: `url(${image})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 2,
        borderRadius: '12px',
    }
}));

const StatsGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px',

    [theme.breakpoints.up('sm')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
    }
}));

const StatCard = styled(Box)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08), rgba(184, 134, 11, 0.04))',
    border: '1px solid rgba(218, 165, 32, 0.25)',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '120px',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #DAA520, #B8860B)',
    },

    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(218, 165, 32, 0.25)',
        borderColor: 'rgba(218, 165, 32, 0.5)',
    }
});

const StatIcon = styled(Box)(({ variant = 'primary' }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    marginBottom: '16px',
    background: variant === 'gold'
        ? 'linear-gradient(135deg, #DAA520, #B8860B)'
        : 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
    color: variant === 'gold' ? '#000' : '#fff',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)',

    '& .MuiSvgIcon-root': {
        fontSize: '1.8rem'
    }
}));

const StatLabel = styled(Typography)({
    color: '#B8860B',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
});

const StatValue = styled(Typography)({
    color: '#F5E6D3',
    fontSize: '1.8rem',
    fontWeight: 700,
    fontFamily: '"Playfair Display", serif',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    lineHeight: 1.2
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 20px',
    color: '#DAA520'
});

const EmptyState = styled(Box)({
    textAlign: 'center',
    padding: '60px 20px',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08), rgba(184, 134, 11, 0.04))',
    borderRadius: '15px',
    border: '2px dashed rgba(218, 165, 32, 0.3)',

    '& .MuiSvgIcon-root': {
        fontSize: '4rem',
        color: '#DAA520',
        marginBottom: '16px',
        animation: `${sparkle} 3s infinite`
    }
});

const InfoTooltip = styled(Tooltip)({
    '& .MuiTooltip-tooltip': {
        backgroundColor: 'rgba(218, 165, 32, 0.95)',
        color: '#000',
        fontSize: '0.9rem',
        fontWeight: 500,
        borderRadius: '8px',
        padding: '12px 16px',
        maxWidth: '300px',
        textAlign: 'center'
    }
});

// =================== COMPOSANT PRINCIPAL ===================

const SuggestionsSidebar = ({
                                apiBaseUrl = "http://127.0.0.1:5000",
                                onShowSurprise
                            }) => {
    const [surprise, setSurprise] = useState(null);
    const [stats, setStats] = useState(null);
    const [loadingSurprise, setLoadingSurprise] = useState(false);
    const [loadingStats, setLoadingStats] = useState(true);
    const [error, setError] = useState(null);

    // Charger les statistiques au montage
    useEffect(() => {
        //console.log("SuggestionsSidebar: Chargement des stats...");
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            //console.log("Fetching stats from:", `${apiBaseUrl}/api/stats`);
            const response = await axios.get(`${apiBaseUrl}/api/stats`);
            //console.log("Stats reçues:", response.data);
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error("Erreur chargement stats:", err);
            console.error("Détails erreur:", err.response);
            setError(`Impossible de charger les statistiques: ${err.message}`);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleSurpriseMe = async () => {
        try {
            setLoadingSurprise(true);
            setError(null);
            //console.log("Demande surprise à:", `${apiBaseUrl}/api/surprends_moi`);
            const response = await axios.post(`${apiBaseUrl}/api/surprends_moi`);
            //console.log("Surprise reçue:", response.data);
            setSurprise(response.data);

            // Callback optionnel
            if (onShowSurprise) {
                onShowSurprise(response.data);
            }
        } catch (err) {
            console.error("Erreur surprise:", err);
            console.error("Détails erreur:", err.response);
            setError(`Impossible de générer une suggestion: ${err.message}`);
        } finally {
            setLoadingSurprise(false);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

    const formatViewingTime = (totalHours) => {
        if (!totalHours) return "0h 0min";

        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        if (hours === 0) return `${minutes}min`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}min`;
    };

    // Rendu du loading
    if (loadingStats) {
        return (
            <SectionContainer>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520', fontFamily: '"Playfair Display", serif' }}>
                        Chargement de vos suggestions...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // Rendu d'erreur
    if (!stats && error) {
        return (
            <SectionContainer>
                <SectionTitle>
                    <AutoAwesome />
                    🔮 Suggestions personnalisées
                </SectionTitle>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="error" sx={{ background: 'rgba(255, 107, 107, 0.1)', mb: 3 }}>
                        {error}
                    </Alert>
                    <Button
                        onClick={fetchStats}
                        sx={{
                            color: '#DAA520',
                            borderColor: '#DAA520',
                            '&:hover': { borderColor: '#B8860B', backgroundColor: 'rgba(218, 165, 32, 0.1)' }
                        }}
                        variant="outlined"
                    >
                        Réessayer
                    </Button>
                </Box>
            </SectionContainer>
        );
    }

    // Rendu état vide
    if (stats && stats.total_videos === 0) {
        return (
            <SectionContainer>
                <SectionTitle>
                    <AutoAwesome />
                    🔮 Suggestions personnalisées
                </SectionTitle>
                <EmptyState>
                    <AutoAwesome />
                    <Typography variant="h6" sx={{ color: '#DAA520', mb: 1, fontFamily: '"Playfair Display", serif' }}>
                        Commence à explorer !
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#B8860B' }}>
                        Tes premières suggestions personnalisées apparaîtront ici
                        <br />
                        dès que tu auras regardé quelques vidéos ✨
                    </Typography>
                </EmptyState>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionTitle>
                        <AutoAwesome />
                        🔮 Suggestions personnalisées
                        <InfoTooltip
                            title="Nos algorithmes analysent ton historique, tes actrices préférées et tes habitudes de visionnage pour te proposer des contenus parfaitement adaptés à tes goûts."
                            arrow
                        >
                            <IconButton size="small" sx={{ color: '#DAA520', ml: 1 }}>
                                <Info fontSize="small" />
                            </IconButton>
                        </InfoTooltip>
                    </SectionTitle>

                    <SectionSubtitle>
                        Ta recommandation du jour est basée sur : ton historique, tes actrices préférées, et la magie d'Intyma ✨
                    </SectionSubtitle>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                background: 'rgba(255, 107, 107, 0.1)',
                                borderColor: 'rgba(255, 107, 107, 0.3)'
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* SECTION 1 : SURPRISE DU JOUR */}
                    <PremiumContainer sx={{ mb: 4 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#F5E6D3',
                                mb: 3,
                                fontFamily: '"Playfair Display", serif',
                                fontWeight: 600,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                            }}
                        >
                            🎲 Ta surprise du jour
                        </Typography>

                        <Box sx={{mx: 'auto' }}>
                            <SurpriseButton
                                onClick={handleSurpriseMe}
                                disabled={loadingSurprise}
                                startIcon={loadingSurprise ?
                                    <CircularProgress size={24} color="inherit" /> :
                                    <AutoAwesome />
                                }
                                sx={{ mb: 4 }}
                            >
                                {loadingSurprise ? "Magie en cours..." : "Surprends-moi !"}
                            </SurpriseButton>

                            {/* Zone de surprise */}
                            <Box sx={{ minHeight: '300px' }}>
                                {surprise ? (
                                    <Fade in={true} timeout={800}>
                                        <SurpriseCard>
                                            <Box sx={{ display: 'flex', gap: 4, p: 3, alignItems: 'stretch' }}>
                                                {/* ACTRICE À GAUCHE - EN GRAND */}
                                                {surprise.actrices_data && surprise.actrices_data.length > 0 && (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        minWidth: '200px',
                                                        p: 3,
                                                        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15), rgba(184, 134, 11, 0.1))',
                                                        borderRadius: '20px',
                                                        border: '2px solid rgba(218, 165, 32, 0.3)'
                                                    }}>
                                                        <Typography
                                                            variant="overline"
                                                            sx={{
                                                                color: '#B8860B',
                                                                textTransform: 'uppercase',
                                                                fontWeight: 700,
                                                                letterSpacing: '2px',
                                                                mb: 2,
                                                                fontSize: '0.9rem'
                                                            }}
                                                        >
                                                            Actrice vedette
                                                        </Typography>

                                                        <ActressImage
                                                            image={`${apiBaseUrl}${surprise.actrices_data[0].photo}`}
                                                            alt={surprise.actrices_data[0].nom}
                                                        />

                                                        <Typography
                                                            variant="h4"
                                                            sx={{
                                                                color: '#F5E6D3',
                                                                fontWeight: 700,
                                                                fontFamily: '"Playfair Display", serif',
                                                                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                                                                textAlign: 'center',
                                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                                                mt: 4
                                                            }}
                                                        >
                                                            {surprise.actrices_data[0].nom}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* SCÈNE À DROITE - AVEC INFOS */}
                                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    {/* Miniature + infos principales */}
                                                    <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'flex-start' }}>
                                                        <SurpriseImage
                                                            image={surprise.image ? `${apiBaseUrl}${surprise.image}` : "https://via.placeholder.com/200x140?text=No+Image"}
                                                            title={surprise.titre}
                                                        />

                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography
                                                                variant="h4"
                                                                sx={{
                                                                    color: '#F5E6D3',
                                                                    fontWeight: 700,
                                                                    mb: 2,
                                                                    fontFamily: '"Playfair Display", serif',
                                                                    fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                                                                    lineHeight: 1.2
                                                                }}
                                                            >
                                                                {surprise.titre}
                                                            </Typography>

                                                            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                                                                <Chip
                                                                    label={formatDuration(surprise.duree)}
                                                                    size="medium"
                                                                    sx={{
                                                                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                                                                        color: '#fff',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                />
                                                                <Chip
                                                                    label={surprise.qualite || 'HD'}
                                                                    size="medium"
                                                                    sx={{
                                                                        background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
                                                                        color: '#000',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.9rem'
                                                                    }}
                                                                />
                                                                {/* ➜ Affichage des tags */}
                                                                {Array.isArray(surprise.tags) && surprise.tags.slice(0,10).map((tag) => (
                                                                    <Chip
                                                                        key={tag}
                                                                        label={tag}
                                                                        size="medium"
                                                                        sx={{
                                                                            background: 'rgba(255,255,255,0.08)',
                                                                            color: '#DAA520',
                                                                            fontWeight: 700,
                                                                            fontSize: '0.87rem',
                                                                            border: '1.5px solid #DAA520',
                                                                            letterSpacing: '0.5px'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    {/* Informations studio et bouton */}
                                                    <Box sx={{
                                                        p: 3,
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(218, 165, 32, 0.2)'
                                                    }}>
                                                        {/* Studio et/ou site si disponibles */}
                                                        {(surprise.studio || surprise.site) && (
                                                            <Typography
                                                                variant="body1"
                                                                sx={{
                                                                    color: '#B8860B',
                                                                    mb: 2,
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1
                                                                }}
                                                            >
                                                                {surprise.studio && (
                                                                    <>
                                                                        🎬 Studio : <span style={{ color: '#F5E6D3' }}>{surprise.studio}</span>
                                                                    </>
                                                                )}
                                                                {surprise.studio && surprise.site && (
                                                                    <span style={{ margin: '0 8px', color: '#B8860B', fontWeight: 700 }}>•</span>
                                                                )}
                                                                {surprise.site && (
                                                                    <>
                                                                        🌐 Site : <span style={{ color: '#4FC3F7' }}>{surprise.site}</span>
                                                                    </>
                                                                )}
                                                            </Typography>
                                                        )}

                                                        {/* Synopsis si disponible */}
                                                        {surprise.synopsis && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#ccc',
                                                                    mb: 3,
                                                                    lineHeight: 1.5,
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 3,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                {surprise.synopsis}
                                                            </Typography>
                                                        )}

                                                        <Button
                                                            size="large"
                                                            startIcon={<PlayArrow />}
                                                            sx={{
                                                                color: '#DAA520',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                fontSize: '1.1rem',
                                                                py: 1.5,
                                                                px: 3,
                                                                background: 'rgba(218, 165, 32, 0.1)',
                                                                borderRadius: '10px',
                                                                '&:hover': {
                                                                    background: 'rgba(218, 165, 32, 0.2)',
                                                                    transform: 'translateX(5px)'
                                                                },
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        >
                                                            Voir la fiche complète
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </SurpriseCard>
                                    </Fade>
                                ) : (
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: '#888',
                                        fontSize: '1.3rem',
                                        textAlign: 'center',
                                        p: 4,
                                        border: '2px dashed rgba(218, 165, 32, 0.3)',
                                        borderRadius: '20px',
                                        background: 'rgba(218, 165, 32, 0.05)'
                                    }}>
                                        Cliquez sur "Surprends-moi !" pour découvrir une suggestion premium 🎯
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </PremiumContainer>

                    {/* SECTION 2 : STATISTIQUES */}
                    <PremiumContainer>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#F5E6D3',
                                mb: 4,
                                fontFamily: '"Playfair Display", serif',
                                fontWeight: 600,
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                            }}
                        >
                            📊 Tes statistiques
                        </Typography>

                        <Grid container spacing={3} sx={{ maxWidth: '1000px', mx: 'auto', alignItems: 'stretch', minHeight: 520 }}>
                            {/* COLONNE STATS GAUCHE */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, height: '100%' }}>
                                    <StatCard>
                                        <StatIcon variant="primary">
                                            <VideoLibrary />
                                        </StatIcon>
                                        <StatLabel>Collection</StatLabel>
                                        <StatValue>{stats?.total_videos || 0} vidéos</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon variant="primary">
                                            <Schedule />
                                        </StatIcon>
                                        <StatLabel>Temps de visionnage</StatLabel>
                                        <StatValue>{formatViewingTime(stats?.heures_visionnage)}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon variant="primary">
                                            <Visibility />
                                        </StatIcon>
                                        <StatLabel>Vidéos regardées</StatLabel>
                                        <StatValue>{stats?.videos_regardees || 0}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon variant="gold">
                                            <Favorite />
                                        </StatIcon>
                                        <StatLabel>Favoris</StatLabel>
                                        <StatValue>{stats?.nb_favoris || 0}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon variant="primary">
                                            <Person />
                                        </StatIcon>
                                        <StatLabel>Actrices</StatLabel>
                                        <StatValue>{stats?.total_actrices || 0}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon variant="primary">
                                            <WhatshotOutlined />
                                        </StatIcon>
                                        <StatLabel>Nouvelles scènes</StatLabel>
                                        <StatValue>{stats?.nouvelles_scenes || 0}</StatValue>
                                    </StatCard>
                                </Box>
                            </Grid>

                            <Grid size={{xs: 12, md: 5}} sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', ml: {md: 10, xs: 0} }}>
                                {/* Carte actrice favorite, agrandie */}
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 4,
                                    background: 'linear-gradient(135deg, rgba(218,165,32,0.10), rgba(184,134,11,0.07))',
                                    borderRadius: '25px',
                                    border: '2.5px solid rgba(218, 165, 32, 0.5)',
                                    minWidth: 290,
                                    maxWidth: 340,
                                    width: '100%',
                                    boxShadow: '0 18px 40px rgba(0,0,0,0.25)'
                                }}>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            color: '#B8860B',
                                            textTransform: 'uppercase',
                                            fontWeight: 700,
                                            letterSpacing: '2px',
                                            mb: 2,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Actrice favorite
                                    </Typography>
                                    <ActressImage
                                        image={`${apiBaseUrl}${stats.top_actrice.portrait}`}
                                        alt={stats.top_actrice.nom}
                                        style={{ height: '100%', width: '100%' }}
                                    />
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: '#F5E6D3',
                                            fontWeight: 700,
                                            fontFamily: '"Playfair Display", serif',
                                            fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
                                            textAlign: 'center',
                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                            mt: 3,
                                        }}
                                    >
                                        {stats.top_actrice.nom}
                                    </Typography>
                                    <Typography sx={{
                                        color: '#B8860B',
                                        fontSize: '1.2rem',
                                        fontWeight: 600,
                                        mt: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1
                                    }}>
                                        <Star sx={{ color: '#DAA520', fontSize: '1.6rem' }} />
                                        {stats.top_actrice.nb_vues} vues
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </PremiumContainer>
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default SuggestionsSidebar;