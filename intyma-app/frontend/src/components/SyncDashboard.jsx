import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    LinearProgress,
    Grid,
    Chip,
    Alert,
    Paper,
    IconButton,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete
} from '@mui/material';
import {
    Refresh,
    Casino,
    PlayArrow,
    Visibility,
    Folder,
    VideoLibrary,
    Person,
    Warning,
    Add,
    Speed,
    Analytics,
    Movie,
    Delete
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
`;

const surprise = keyframes`
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-5deg) scale(1.1); }
    50% { transform: rotate(5deg) scale(1.1); }
    75% { transform: rotate(-3deg) scale(1.05); }
    100% { transform: rotate(0deg) scale(1); }
`;

// =================== STYLES ===================

const DashboardContainer = styled(Box)({
    background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #2D1810 50%, #1A1A1A 75%, #0F0F0F 100%)',
    minHeight: '100vh',
    padding: '32px',
    position: 'relative',

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

const StatsCard = styled(Card)({
    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    color: '#fff',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

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
        boxShadow: '0 12px 30px rgba(218, 165, 32, 0.3)',
    }
});

const SurpriseButton = styled(Button)({
    background: 'linear-gradient(135deg, #8A2BE2 0%, #9370DB 50%, #BA55D3 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.2rem',
    padding: '16px 32px',
    borderRadius: '50px',
    textTransform: 'none',
    boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease',
    },

    '&:hover': {
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 12px 35px rgba(138, 43, 226, 0.6)',
        animation: `${surprise} 0.6s ease`,

        '&::before': {
            left: '100%',
        }
    },

    '&:disabled': {
        opacity: 0.7,
        animation: `${pulse} 2s infinite`,
    }
});

const ScanButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 50%, #CD853F 100%)',
    color: '#000',
    fontWeight: 600,
    borderRadius: '12px',
    textTransform: 'none',
    padding: '12px 24px',
    boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
    transition: 'all 0.3s ease',

    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(218, 165, 32, 0.4)',
        background: 'linear-gradient(135deg, #F4D03F 0%, #DAA520 50%, #B8860B 100%)',
    },

    '&:disabled': {
        opacity: 0.7,
        animation: `${pulse} 2s infinite`,
    }
});

const VideoInfoCard = styled(Paper)({
    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(147, 112, 219, 0.1) 100%)',
    borderRadius: '16px',
    border: '2px solid rgba(138, 43, 226, 0.3)',
    padding: '24px',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    position: 'relative',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #8A2BE2, #9370DB, #BA55D3)',
        borderRadius: '16px 16px 0 0',
    }
});

const QuickAddButton = styled(Button)({
    background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
    color: '#fff',
    fontWeight: 600,
    borderRadius: '12px',
    textTransform: 'none',
    padding: '10px 20px',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
    transition: 'all 0.3s ease',

    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
    }
});

const StyledLinearProgress = styled(LinearProgress)({
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    '& .MuiLinearProgress-bar': {
        background: 'linear-gradient(90deg, #DAA520, #F4D03F)',
        borderRadius: 6,
    }
});

// =================== COMPOSANT PRINCIPAL ===================

const SyncDashboard = () => {
    const [scanData, setScanData] = useState(null);
    const [randomVideo, setRandomVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [quickAddDialog, setQuickAddDialog] = useState(false);
    const [actrices, setActrices] = useState([]);
    const [actressAnalysis, setActressAnalysis] = useState(null);
    const [analyzingActresses, setAnalyzingActresses] = useState(false);
    const [quickAddForm, setQuickAddForm] = useState({
        titre: '',
        synopsis: '',
        duree: '',
        qualite: 'HD',
        site: '',
        studio: '',
        note_perso: '',
        actress_id: null,
        tags: []
    });

    // Charger les actrices pour le formulaire rapide
    useEffect(() => {
        const loadActrices = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/actrices');
                setActrices(response.data);
            } catch (error) {
                console.error('Erreur chargement actrices:', error);
            }
        };
        loadActrices();
    }, []);

    // Scanner le disque
    const handleScan = async () => {
        setScanning(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/admin/scan-disk');
            setScanData(response.data);
        } catch (error) {
            console.error('Erreur scan:', error);
            alert('Erreur lors du scan: ' + (error.response?.data?.error || error.message));
        } finally {
            setScanning(false);
        }
    };

    // Vidéo surprise
    const handleRandomVideo = async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/admin/random-video');
            setRandomVideo(response.data);

            // Pré-remplir le formulaire
            const video = response.data.video;
            const actrice = actrices.find(a => a.nom === video.actress);

            setQuickAddForm({
                titre: video.suggested_title,
                synopsis: '',
                duree: '',
                qualite: 'HD',
                site: '',
                studio: '',
                note_perso: '',
                actress_id: actrice?.id || null,
                tags: []
            });

        } catch (error) {
            console.error('Erreur vidéo surprise:', error);
            alert('Erreur: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Ajout rapide
    const handleQuickAdd = async () => {
        if (!randomVideo) return;

        try {
            const submitData = {
                ...quickAddForm,
                relative_path: randomVideo.video.relative_path,
                suggested_title: randomVideo.video.suggested_title,
                actress_id: quickAddForm.actress_id
            };

            await axios.post('http://127.0.0.1:5000/api/admin/quick-add-scene', submitData);

            alert('✅ Scène ajoutée avec succès !');
            setQuickAddDialog(false);
            setRandomVideo(null);

            // Re-scanner pour mettre à jour les stats
            if (scanData) {
                handleScan();
            }

        } catch (error) {
            console.error('Erreur ajout rapide:', error);
            alert('Erreur: ' + (error.response?.data?.error || error.message));
        }
    };

    // Analyser les actrices
    const handleAnalyzeActresses = async () => {
        setAnalyzingActresses(true);
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/admin/analyze-actresses');
            setActressAnalysis(response.data);
        } catch (error) {
            console.error('Erreur analyse actrices:', error);
            alert('Erreur lors de l\'analyse: ' + (error.response?.data?.error || error.message));
        } finally {
            setAnalyzingActresses(false);
        }
    };

    return (
        <DashboardContainer>
            {/* En-tête */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 400,
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    background: 'linear-gradient(135deg, #DAA520 0%, #F4D03F 50%, #DAA520 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                }}>
                    📊 Dashboard de Synchronisation
                </Typography>

                <Typography variant="h6" sx={{ color: '#B8860B', mb: 4 }}>
                    Gérez l'import de votre collection depuis le disque dur
                </Typography>

                {/* Boutons d'action principaux */}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <ScanButton
                        startIcon={<Analytics />}
                        onClick={handleScan}
                        disabled={scanning}
                        size="large"
                    >
                        {scanning ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: '#DAA520' }} />
                                Scan en cours...
                            </>
                        ) : (
                            'Scanner le Disque'
                        )}
                    </ScanButton>

                    <SurpriseButton
                        startIcon={<Casino />}
                        onClick={handleRandomVideo}
                        disabled={loading}
                        size="large"
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                                Recherche...
                            </>
                        ) : (
                            '🎲 Vidéo Surprise'
                        )}
                    </SurpriseButton>

                    <Button
                        startIcon={<Person />}
                        onClick={handleAnalyzeActresses}
                        disabled={analyzingActresses}
                        size="large"
                        sx={{
                            background: 'linear-gradient(135deg, #FF6B9D 0%, #E91E63 50%, #C2185B 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1rem',
                            padding: '16px 24px',
                            borderRadius: '50px',
                            textTransform: 'none',
                            boxShadow: '0 6px 20px rgba(255, 107, 157, 0.4)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(255, 107, 157, 0.5)',
                            }
                        }}
                    >
                        {analyzingActresses ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                                Analyse...
                            </>
                        ) : (
                            '👥 Analyser Actrices'
                        )}
                    </Button>
                </Box>
            </Box>

            {/* Alert explicatif */}
            {scanData && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 4,
                        background: 'rgba(33, 150, 243, 0.1)',
                        border: '2px solid rgba(33, 150, 243, 0.3)',
                        borderRadius: '16px',
                        '& .MuiAlert-message': { color: '#fff', fontSize: '1rem' }
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#42A5F5' }}>
                        📊 Explication des Statistiques
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#90CAF9' }}>
                                📁 Vidéos totales sur disque :
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                {scanData.disk_stats.total_videos} fichiers vidéos trouvés physiquement
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#90CAF9' }}>
                                ✅ Scènes déjà importées :
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                {scanData.db_stats.imported_scenes} vidéos dans votre base Intyma
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#90CAF9' }}>
                                ⚠️ Vidéos restant à importer :
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                {scanData.disk_stats.total_videos - scanData.db_stats.imported_scenes} vidéos à ajouter à Intyma
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#90CAF9' }}>
                                👥 Dossiers d'actrices :
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#E3F2FD' }}>
                                {scanData.disk_stats.total_actresses} dossiers (possibles doublons/vides)
                            </Typography>
                        </Box>
                    </Box>
                </Alert>
            )}

            {/* Statistiques */}
            {scanData && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <StatsCard>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <VideoLibrary sx={{ fontSize: '3rem', color: '#DAA520', mb: 2 }} />
                                <Typography variant="h4" sx={{ color: '#F4D03F', fontWeight: 600, mb: 1 }}>
                                    {scanData.disk_stats.total_videos}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    📁 Vidéos totales sur disque
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <StatsCard>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Movie sx={{ fontSize: '3rem', color: '#4CAF50', mb: 2 }} />
                                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 600, mb: 1 }}>
                                    {scanData.db_stats.imported_scenes}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    ✅ Scènes déjà importées
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <StatsCard>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Person sx={{ fontSize: '3rem', color: '#FF6B9D', mb: 2 }} />
                                <Typography variant="h4" sx={{ color: '#FF6B9D', fontWeight: 600, mb: 1 }}>
                                    {scanData.disk_stats.total_actresses}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    👥 Dossiers d'actrices sur disque
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                                    ({scanData.db_stats.imported_actresses} importées en BDD)
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <StatsCard>
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Warning sx={{ fontSize: '3rem', color: '#FF4444', mb: 2 }} />
                                <Typography variant="h4" sx={{ color: '#FF4444', fontWeight: 600, mb: 1 }}>
                                    {scanData.disk_stats.total_videos - scanData.db_stats.imported_scenes}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    ⚠️ Vidéos restant à importer
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                                    (Échantillon de {scanData.comparison.missing_videos.length} affiché)
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                </Grid>
            )}

            {/* Barres de progression */}
            {scanData && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <StatsCard>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ color: '#F4D03F', mb: 2 }}>
                                    📹 Progression Vidéos
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <StyledLinearProgress
                                            variant="determinate"
                                            value={scanData.progress.videos_percent}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 35 }}>
                                        <Typography variant="body2" sx={{ color: '#DAA520', fontWeight: 600 }}>
                                            {scanData.progress.videos_percent}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#B8860B' }}>
                                    {scanData.db_stats.imported_scenes} / {scanData.disk_stats.total_videos} vidéos importées
                                    <br />
                                    <Typography component="span" sx={{ color: '#FF4444', fontWeight: 600 }}>
                                        ({scanData.disk_stats.total_videos - scanData.db_stats.imported_scenes} restant à importer)
                                    </Typography>
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <StatsCard>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ color: '#F4D03F', mb: 2 }}>
                                    👥 Progression Actrices
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <StyledLinearProgress
                                            variant="determinate"
                                            value={scanData.progress.actresses_percent}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 35 }}>
                                        <Typography variant="body2" sx={{ color: '#DAA520', fontWeight: 600 }}>
                                            {scanData.progress.actresses_percent}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#B8860B' }}>
                                    {scanData.db_stats.imported_actresses} / {scanData.disk_stats.total_actresses} actrices importées
                                    <br />
                                    <Typography component="span" sx={{ color: '#FFA726', fontWeight: 600 }}>
                                        (⚠️ Vérifiez les doublons : {scanData.disk_stats.total_actresses} dossiers trouvés)
                                    </Typography>
                                </Typography>
                            </CardContent>
                        </StatsCard>
                    </Grid>
                </Grid>
            )}

            {/* Vidéo Surprise */}
            {randomVideo && (
                <VideoInfoCard sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{
                        color: '#BA55D3',
                        fontWeight: 600,
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        🎲 Vidéo Surprise Sélectionnée !
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    👤 Actrice
                                </Typography>
                                <Typography variant="h6" sx={{ color: '#fff' }}>
                                    {randomVideo.video.actress}
                                </Typography>
                                {randomVideo.actress_info.exists_in_db && (
                                    <Chip
                                        label={`✅ En BDD (${randomVideo.actress_info.actress_scenes_count} scènes)`}
                                        size="small"
                                        sx={{
                                            mt: 1,
                                            background: 'rgba(76, 175, 80, 0.2)',
                                            color: '#4CAF50'
                                        }}
                                    />
                                )}
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    📁 Nom du fichier
                                </Typography>
                                <Typography variant="body1" sx={{
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    wordBreak: 'break-all'
                                }}>
                                    {randomVideo.video.filename}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    🎬 Titre suggéré
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#F4D03F', fontWeight: 500 }}>
                                    {randomVideo.video.suggested_title}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    📂 Chemin relatif
                                </Typography>
                                <Typography variant="body2" sx={{
                                    color: '#ccc',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    wordBreak: 'break-all'
                                }}>
                                    {randomVideo.video.relative_path}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    💾 Taille
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                    {randomVideo.video.size_mb} MB
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ color: '#9370DB', fontWeight: 600, mb: 1 }}>
                                    📊 Statut
                                </Typography>
                                <Alert
                                    severity={randomVideo.open_result.opened ? "success" : "error"}
                                    sx={{ fontSize: '0.9rem' }}
                                >
                                    {randomVideo.open_result.message}
                                </Alert>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: 'rgba(186, 85, 211, 0.3)' }} />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <QuickAddButton
                            startIcon={<Add />}
                            onClick={() => setQuickAddDialog(true)}
                        >
                            🚀 Ajout Rapide
                        </QuickAddButton>

                        <Button
                            startIcon={<PlayArrow />}
                            onClick={() => {
                                // Réouvrir la vidéo si besoin
                                axios.post('http://127.0.0.1:5000/api/scenes/open-video', {
                                    chemin: randomVideo.video.full_path
                                });
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: '12px',
                                textTransform: 'none',
                                padding: '10px 20px',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            🎥 Réouvrir
                        </Button>

                        <Button
                            startIcon={<Casino />}
                            onClick={handleRandomVideo}
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: '12px',
                                textTransform: 'none',
                                padding: '10px 20px',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            🎲 Autre Surprise
                        </Button>

                        <Button
                            startIcon={<Delete />}
                            onClick={() => {
                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement cette vidéo ?\n\n${randomVideo.video.filename}\n\nCette action est irréversible !`)) {
                                    axios.post('http://127.0.0.1:5000/api/admin/delete-video', {
                                        video_path: randomVideo.video.full_path
                                    }).then(() => {
                                        alert('✅ Vidéo supprimée avec succès !');
                                        setRandomVideo(null); // Masquer la carte
                                        // Re-scanner si on a des données de scan
                                        if (scanData) {
                                            handleScan();
                                        }
                                    }).catch(error => {
                                        alert('❌ Erreur lors de la suppression: ' + (error.response?.data?.error || error.message));
                                    });
                                }
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: '12px',
                                textTransform: 'none',
                                padding: '10px 20px',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    background: 'linear-gradient(135deg, #E57373, #F44336)',
                                }
                            }}
                        >
                            🗑️ Supprimer Vidéo
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#888' }}>
                            📈 {randomVideo.stats.total_unimported} vidéos restantes à importer
                        </Typography>
                    </Box>
                </VideoInfoCard>
            )}

            {/* Alerts et infos supplémentaires */}
            {scanData && (
                <Grid container spacing={3}>
                    {scanData.comparison.missing_actresses.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Alert
                                severity="warning"
                                sx={{
                                    background: 'rgba(255, 152, 0, 0.1)',
                                    border: '1px solid rgba(255, 152, 0, 0.3)',
                                    '& .MuiAlert-message': { color: '#fff' }
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    👥 {scanData.comparison.missing_actresses.length} Actrices manquantes
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {scanData.comparison.missing_actresses.slice(0, 5).map((actress, index) => (
                                        <Chip
                                            key={index}
                                            label={`${actress.name} (${actress.video_count})`}
                                            size="small"
                                            sx={{
                                                background: 'rgba(255, 152, 0, 0.2)',
                                                color: '#FFA726',
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    ))}
                                    {scanData.comparison.missing_actresses.length > 5 && (
                                        <Typography variant="caption" sx={{ color: '#FFA726', alignSelf: 'center' }}>
                                            +{scanData.comparison.missing_actresses.length - 5} autres...
                                        </Typography>
                                    )}
                                </Box>
                            </Alert>
                        </Grid>
                    )}

                    {scanData.comparison.orphan_scenes.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Alert
                                severity="error"
                                sx={{
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    border: '1px solid rgba(244, 67, 54, 0.3)',
                                    '& .MuiAlert-message': { color: '#fff' }
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    🗂️ {scanData.comparison.orphan_scenes.length} Scènes orphelines
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#F44336' }}>
                                    Fichiers en BDD mais introuvables sur disque
                                </Typography>
                            </Alert>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Analyse des Actrices */}
            {actressAnalysis && (
                <VideoInfoCard sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{
                        color: '#FF6B9D',
                        fontWeight: 600,
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        👥 Analyse des Actrices Terminée !
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="h4" sx={{ color: '#FF6B9D', fontWeight: 600 }}>
                                    {actressAnalysis?.total_actresses}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    Total Actrices
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                                    {actressAnalysis?.actresses_with_scenes}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    Avec Scènes
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="h4" sx={{ color: '#FF4444', fontWeight: 600 }}>
                                    {actressAnalysis?.actresses_without_scenes}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    Sans Scènes
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="h4" sx={{ color: '#DAA520', fontWeight: 600 }}>
                                    {actressAnalysis?.top_actresses?.[0]?.scene_count || 0}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#B8860B' }}>
                                    Max Scènes
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 107, 157, 0.3)' }} />

                    <Typography variant="h6" sx={{ color: '#FF6B9D', mb: 2 }}>
                        🏆 Top 5 Actrices
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(actressAnalysis.top_actresses || []).slice(0, 5).map((actress, index) => (
                            <Chip
                                key={index}
                                label={`${actress.name} (${actress.scene_count} scènes)`}
                                sx={{
                                    background: 'rgba(255, 107, 157, 0.2)',
                                    color: '#FF6B9D',
                                    fontWeight: 600
                                }}
                            />
                        ))}
                    </Box>
                </VideoInfoCard>
            )}

            {/* Dialog d'ajout rapide */}
            <Dialog
                open={quickAddDialog}
                onClose={() => setQuickAddDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                        borderRadius: '20px',
                        border: '1px solid rgba(218, 165, 32, 0.3)',
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(42, 42, 42, 0.8))',
                    color: '#BA55D3',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(186, 85, 211, 0.3)'
                }}>
                    🚀 Ajout Rapide - {randomVideo?.video?.filename}
                </DialogTitle>

                <DialogContent sx={{ background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', color: '#fff', pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Titre"
                                fullWidth
                                value={quickAddForm.titre}
                                onChange={(e) => setQuickAddForm(prev => ({ ...prev, titre: e.target.value }))}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                        '&.Mui-focused': {
                                            color: '#DAA520',
                                        }
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Durée (minutes)"
                                type="number"
                                fullWidth
                                value={quickAddForm.duree}
                                onChange={(e) => setQuickAddForm(prev => ({ ...prev, duree: e.target.value }))}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                        '&.Mui-focused': {
                                            color: '#DAA520',
                                        }
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{
                                    color: '#B8860B',
                                    '&.Mui-focused': { color: '#DAA520' }
                                }}>
                                    Qualité
                                </InputLabel>
                                <Select
                                    value={quickAddForm.qualite}
                                    onChange={(e) => setQuickAddForm(prev => ({ ...prev, qualite: e.target.value }))}
                                    sx={{
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&:hover': { borderColor: 'rgba(218, 165, 32, 0.5)' },
                                        '&.Mui-focused': {
                                            borderColor: '#DAA520',
                                            boxShadow: '0 0 10px rgba(218, 165, 32, 0.3)'
                                        }
                                    }}
                                >
                                    <MenuItem value="720p">720p</MenuItem>
                                    <MenuItem value="HD">HD</MenuItem>
                                    <MenuItem value="Full HD">Full HD</MenuItem>
                                    <MenuItem value="4K">4K</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                options={actrices}
                                getOptionLabel={(option) => option.nom}
                                value={actrices.find(a => a.id === quickAddForm.actress_id) || null}
                                onChange={(event, newValue) => {
                                    setQuickAddForm(prev => ({ ...prev, actress_id: newValue?.id || null }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Actrice"
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                color: '#fff',
                                                background: 'rgba(26, 26, 26, 0.6)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                                '&.Mui-focused': {
                                                    color: '#DAA520',
                                                }
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    border: 'none',
                                                }
                                            }
                                        }}
                                    />
                                )}
                                sx={{
                                    '& .MuiChip-root': {
                                        color: '#fff',
                                        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                                        border: '1px solid rgba(218, 165, 32, 0.5)'
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Studio"
                                fullWidth
                                value={quickAddForm.studio}
                                onChange={(e) => setQuickAddForm(prev => ({ ...prev, studio: e.target.value }))}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                        '&.Mui-focused': {
                                            color: '#DAA520',
                                        }
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Site"
                                fullWidth
                                value={quickAddForm.site}
                                onChange={(e) => setQuickAddForm(prev => ({ ...prev, site: e.target.value }))}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                        '&.Mui-focused': {
                                            color: '#DAA520',
                                        }
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        }
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Synopsis (optionnel)"
                                fullWidth
                                multiline
                                rows={3}
                                value={quickAddForm.synopsis}
                                onChange={(e) => setQuickAddForm(prev => ({ ...prev, synopsis: e.target.value }))}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        color: '#fff',
                                        background: 'rgba(26, 26, 26, 0.6)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(218, 165, 32, 0.3)',
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
                                        '&.Mui-focused': {
                                            color: '#DAA520',
                                        }
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            border: 'none',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                    borderTop: '1px solid rgba(186, 85, 211, 0.3)',
                    p: 3
                }}>
                    <Button
                        onClick={() => setQuickAddDialog(false)}
                        sx={{
                            color: '#B8860B',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'rgba(184, 134, 11, 0.1)'
                            }
                        }}
                    >
                        Annuler
                    </Button>
                    <QuickAddButton onClick={handleQuickAdd}>
                        ✅ Ajouter la Scène
                    </QuickAddButton>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default SyncDashboard;