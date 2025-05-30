import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
    Container,
    Fade
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
    Info,
    VideoLibrary,
    Schedule,
    Person,
    Visibility,
    Favorite,
    Star,
    WhatshotOutlined
} from '@mui/icons-material';
import axios from 'axios';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const sparkle = keyframes`
    0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.8; }
    50% { transform: rotate(180deg) scale(1.2); opacity: 1; }
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

const InfoTooltip = styled(IconButton)({
    color: '#DAA520',
    marginLeft: '8px',

    '&:hover': {
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
    }
});

// =================== COMPOSANT PRINCIPAL ===================

const StatsPersonnelles = ({ apiBaseUrl = "http://127.0.0.1:5000" }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les statistiques au montage
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiBaseUrl}/api/stats`);
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error("Erreur chargement stats:", err);
            setError(`Impossible de charger les statistiques: ${err.message}`);
        } finally {
            setLoading(false);
        }
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
    if (loading) {
        return (
            <SectionContainer>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520', fontFamily: '"Playfair Display", serif' }}>
                        Chargement de vos statistiques...
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
                    📊 Tes statistiques
                    <InfoTooltip size="small">
                        <Info fontSize="small" />
                    </InfoTooltip>
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
                    📊 Tes statistiques
                    <InfoTooltip size="small">
                        <Info fontSize="small" />
                    </InfoTooltip>
                </SectionTitle>
                <Box sx={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.08), rgba(184, 134, 11, 0.04))',
                    borderRadius: '15px',
                    border: '2px dashed rgba(218, 165, 32, 0.3)',
                }}>
                    <Typography variant="h6" sx={{ color: '#DAA520', mb: 1, fontFamily: '"Playfair Display", serif' }}>
                        Commence à explorer !
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#B8860B' }}>
                        Tes statistiques apparaîtront ici dès que tu auras regardé quelques vidéos ✨
                    </Typography>
                </Box>
            </SectionContainer>
        );
    }

    return (
        <SectionContainer maxWidth="xl">
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionTitle>
                        📊 Tes statistiques
                        <InfoTooltip size="small">
                            <Info fontSize="small" />
                        </InfoTooltip>
                    </SectionTitle>

                    <SectionSubtitle>
                        Découvre tes habitudes de visionnage et ton actrice favorite sur Intyma
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

                    {/* SECTION STATISTIQUES */}
                    <PremiumContainer>
                        <Grid container spacing={3} sx={{ maxWidth: '1000px', mx: 'auto', alignItems: 'stretch', minHeight: 520 }}>
                            {/* COLONNE STATS GAUCHE */}
                            <Grid item xs={12} md={6}>
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

                            <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', ml: {md: 10, xs: 0} }}>
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

export default StatsPersonnelles;