import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Tabs,
    Tab,
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    IconButton,
    Autocomplete
} from '@mui/material';
import { Add, Edit, Delete, Star, Visibility, Favorite } from '@mui/icons-material';
import axios from 'axios';

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AdminInterface() {
    const [tabValue, setTabValue] = useState(0);
    const [scenes, setScenes] = useState([]);
    const [actrices, setActrices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [scenesRes, actricesRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/api/scenes'),
                axios.get('http://127.0.0.1:5000/api/actrices')
            ]);
            setScenes(scenesRes.data);
            setActrices(actricesRes.data);
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar('Erreur lors du chargement des données', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const openAddDialog = (type) => {
        setCurrentItem({ type, isNew: true });
        setFormData(type === 'scene' ? {
            titre: '',
            chemin: '',
            synopsis: '',
            duree: '',
            qualite: 'HD',
            site: '',
            studio: '',
            note_perso: '',
            date_scene: '',
            image: '',
            actrice_ids: [],
            tags: []
        } : {
            nom: '',
            biographie: '',
            photo: '',
            tags_typiques: '',
            nationalite: '',
            commentaire: '',
            date_naissance: ''
        });
        setOpenDialog(true);
    };

    const openEditDialog = async (item, type) => {
        setCurrentItem({ ...item, type, isNew: false });

        if (type === 'scene') {
            try {
                // Charger les détails complets de la scène
                const response = await axios.get(`http://127.0.0.1:5000/api/scenes/${item.id}`);
                const sceneDetail = response.data;

                setFormData({
                    ...sceneDetail,
                    actrice_ids: sceneDetail.actrices ? sceneDetail.actrices.map(a => a.id) : [],
                    tags: sceneDetail.tags ? sceneDetail.tags.map(t => t.nom) : []
                });
            } catch (error) {
                console.error('Erreur chargement détails scène:', error);
                // Fallback si erreur
                setFormData({
                    ...item,
                    actrice_ids: [],
                    tags: []
                });
            }
        } else {
            setFormData(item);
        }
        setOpenDialog(true);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const url = currentItem.isNew
                ? `http://127.0.0.1:5000/api/${currentItem.type}s`
                : `http://127.0.0.1:5000/api/${currentItem.type}s/${currentItem.id}`;

            const method = currentItem.isNew ? 'POST' : 'PUT';

            // Préparer les données selon le type
            const submitData = { ...formData };

            // DEBUG: Ajouter un console.log pour voir ce qui est envoyé
            console.log("Données envoyées:", submitData);

            // Convertir la durée en nombre si c'est une scène
            if (currentItem.type === 'scene' && submitData.duree) {
                submitData.duree = parseInt(submitData.duree);
            }

            await axios({ method, url, data: submitData });

            setOpenDialog(false);
            loadData();
            showSnackbar(
                `${currentItem.type === 'scene' ? 'Scène' : 'Actrice'} ${currentItem.isNew ? 'ajoutée' : 'modifiée'} avec succès`
            );
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur lors de la sauvegarde: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) return;

        try {
            await axios.delete(`http://127.0.0.1:5000/api/${type}s/${id}`);
            loadData();
            showSnackbar('Élément supprimé avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur lors de la suppression: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const addToFavorites = async (sceneId) => {
        try {
            await axios.post('http://127.0.0.1:5000/api/favorites', { scene_id: sceneId });
            showSnackbar('Ajouté aux favoris');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const addToHistory = async (sceneId) => {
        try {
            await axios.post('http://127.0.0.1:5000/api/history', {
                scene_id: sceneId,
                note_session: 4.5
            });
            showSnackbar('Ajouté à l\'historique');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const removeFromFavorites = async (sceneId) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/favorites/${sceneId}`);
            showSnackbar('Retiré des favoris');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const removeFromHistory = async (sceneId) => {
        try {
            // Pour simplifier, on va supprimer TOUS les historiques de cette scène
            const histories = await axios.get('http://127.0.0.1:5000/api/history');
            const sceneHistories = histories.data.filter(h => h.scene_id === sceneId);

            for (const history of sceneHistories) {
                await axios.delete(`http://127.0.0.1:5000/api/history/${history.id}`);
            }
            showSnackbar('Retiré de l\'historique');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, background: '#1a1a1a', minHeight: '100vh', pt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#fff', textAlign: 'center', mb: 4 }}>
                🎬 Administration Intyma
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ '& .MuiTab-root': { color: '#fff' } }}>
                    <Tab label="Scènes" />
                    <Tab label="Actrices" />
                </Tabs>
            </Box>

            {/* ONGLET SCENES */}
            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#fff' }}>
                        Gestion des Scènes ({scenes.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => openAddDialog('scene')}
                        sx={{ background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}
                    >
                        Ajouter une scène
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {scenes.map((scene) => (
                        <Grid item xs={12} md={6} lg={4} key={scene.id}>
                            <Card sx={{ background: '#2a2a2a', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                                        {scene.titre || 'Sans titre'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
                                        {scene.qualite} • {scene.duree ? `${scene.duree} min` : 'Durée inconnue'}
                                    </Typography>
                                    {scene.site && (
                                        <Chip label={scene.site} size="small" sx={{ background: '#424242', color: '#fff', mr: 1, mb: 1 }} />
                                    )}
                                    {scene.studio && (
                                        <Chip label={scene.studio} size="small" sx={{ background: '#666', color: '#fff', mb: 1 }} />
                                    )}
                                    {scene.note_perso && (
                                        <Typography variant="body2" sx={{ mt: 1, color: '#ffa726' }}>
                                            Note: {scene.note_perso}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" display="block" sx={{ mt: 1, color: '#666', fontSize: '0.7rem' }}>
                                        {scene.chemin}
                                    </Typography>
                                    {scene.date_scene && (
                                        <Typography variant="caption" display="block" sx={{ color: '#888', fontSize: '0.7rem' }}>
                                            Date scène: {scene.date_scene}
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <IconButton
                                        size="small"
                                        onClick={() => openEditDialog(scene, 'scene')}
                                        sx={{ color: '#2196f3' }}
                                        title="Modifier"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(scene.id, 'scene')}
                                        sx={{ color: '#f44336' }}
                                        title="Supprimer"
                                    >
                                        <Delete />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => addToFavorites(scene.id)}
                                        sx={{ color: '#ff4569' }}
                                        title="Ajouter aux favoris"
                                    >
                                        <Favorite />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeFromFavorites(scene.id)}
                                        sx={{ color: '#ff8a95' }}
                                        title="Retirer des favoris"
                                    >
                                        💔
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => addToHistory(scene.id)}
                                        sx={{ color: '#4caf50' }}
                                        title="Marquer comme vu"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => removeFromHistory(scene.id)}
                                        sx={{ color: '#81c784' }}
                                        title="Retirer de l'historique"
                                    >
                                        🗑️
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* ONGLET ACTRICES */}
            <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#fff' }}>
                        Gestion des Actrices ({actrices.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => openAddDialog('actrice')}
                        sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
                    >
                        Ajouter une actrice
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {actrices.map((actrice) => (
                        <Grid item xs={12} md={6} lg={4} key={actrice.id}>
                            <Card sx={{ background: '#2a2a2a', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {actrice.nom}
                                    </Typography>
                                    {actrice.note_moyenne && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Star sx={{ color: '#ffa726', mr: 1 }} />
                                            <Typography variant="body2">
                                                {actrice.note_moyenne}/5
                                            </Typography>
                                        </Box>
                                    )}
                                    {actrice.nationalite && (
                                        <Typography variant="body2" sx={{ mb: 1, color: '#aaa' }}>
                                            🌍 {actrice.nationalite}
                                        </Typography>
                                    )}
                                    {actrice.commentaire && (
                                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: '#ccc' }}>
                                            "{actrice.commentaire.substring(0, 80)}..."
                                        </Typography>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <IconButton
                                        size="small"
                                        onClick={() => openEditDialog(actrice, 'actrice')}
                                        sx={{ color: '#2196f3' }}
                                        title="Modifier"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(actrice.id, 'actrice')}
                                        sx={{ color: '#f44336' }}
                                        title="Supprimer"
                                    >
                                        <Delete />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* DIALOG D'AJOUT/MODIFICATION */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ background: '#333', color: '#fff' }}>
                    {currentItem?.isNew ? 'Ajouter' : 'Modifier'} {currentItem?.type === 'scene' ? 'une scène' : 'une actrice'}
                </DialogTitle>
                <DialogContent sx={{ background: '#2a2a2a', color: '#fff' }}>
                    <Box sx={{ pt: 2 }}>
                        {currentItem?.type === 'scene' ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Titre"
                                        fullWidth
                                        value={formData.titre || ''}
                                        onChange={(e) => handleInputChange('titre', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Chemin du fichier"
                                        fullWidth
                                        value={formData.chemin || ''}
                                        onChange={(e) => handleInputChange('chemin', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Synopsis"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={formData.synopsis || ''}
                                        onChange={(e) => handleInputChange('synopsis', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Durée (minutes)"
                                        type="number"
                                        fullWidth
                                        value={formData.duree || ''}
                                        onChange={(e) => handleInputChange('duree', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#aaa' }}>Qualité</InputLabel>
                                        <Select
                                            value={formData.qualite || 'HD'}
                                            onChange={(e) => handleInputChange('qualite', e.target.value)}
                                            sx={{
                                                color: '#fff',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#999' },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196f3' }
                                            }}
                                        >
                                            <MenuItem value="720p">720p</MenuItem>
                                            <MenuItem value="HD">HD</MenuItem>
                                            <MenuItem value="Full HD">Full HD</MenuItem>
                                            <MenuItem value="4K">4K</MenuItem>
                                            <MenuItem value="1080p">1080p</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Site"
                                        fullWidth
                                        value={formData.site || ''}
                                        onChange={(e) => handleInputChange('site', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Studio"
                                        fullWidth
                                        value={formData.studio || ''}
                                        onChange={(e) => handleInputChange('studio', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Note personnelle"
                                        fullWidth
                                        value={formData.note_perso || ''}
                                        onChange={(e) => handleInputChange('note_perso', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Date de la scène"
                                        type="date"
                                        fullWidth
                                        value={formData.date_scene || ''}
                                        onChange={(e) => handleInputChange('date_scene', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Chemin de la miniature"
                                        fullWidth
                                        value={formData.image || ''}
                                        onChange={(e) => handleInputChange('image', e.target.value)}
                                        placeholder="ex: /Volumes/My Passport for Mac/Intyma/miniatures/ActriceName/scene.jpg"
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        options={actrices}
                                        getOptionLabel={(option) => option.nom}
                                        value={actrices.filter(a => formData.actrice_ids?.includes(a.id)) || []}
                                        onChange={(event, newValue) => {
                                            handleInputChange('actrice_ids', newValue.map(v => v.id));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Actrices"
                                                sx={{
                                                    '& .MuiInputBase-root': { color: '#fff' },
                                                    '& .MuiInputLabel-root': { color: '#aaa' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: '#666' },
                                                        '&:hover fieldset': { borderColor: '#999' },
                                                        '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                                    }
                                                }}
                                            />
                                        )}
                                        sx={{ '& .MuiChip-root': { color: '#fff', background: '#424242' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={[]} // Garde les options vides pour freeSolo
                                        value={formData.tags || []}
                                        onChange={(event, newValue) => {
                                            console.log("Tags modifiés:", newValue); // DEBUG
                                            handleInputChange('tags', newValue);
                                        }}
                                        onInputChange={(event, newInputValue, reason) => {
                                            // Ajouter le tag quand on appuie sur Entrée
                                            if (reason === 'input' && newInputValue.includes(',')) {
                                                const newTags = newInputValue.split(',').map(tag => tag.trim()).filter(tag => tag);
                                                const currentTags = formData.tags || [];
                                                const allTags = [...new Set([...currentTags, ...newTags])]; // Éviter les doublons
                                                handleInputChange('tags', allTags);
                                            }
                                        }}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    variant="outlined"
                                                    label={option}
                                                    {...getTagProps({ index })}
                                                    sx={{ color: '#fff', borderColor: '#666' }}
                                                />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Tags (tapez et appuyez sur Entrée, ou séparez par des virgules)"
                                                placeholder="ex: milf, blonde, sexy"
                                                sx={{
                                                    '& .MuiInputBase-root': { color: '#fff' },
                                                    '& .MuiInputLabel-root': { color: '#aaa' },
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': { borderColor: '#666' },
                                                        '&:hover fieldset': { borderColor: '#999' },
                                                        '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                                    }
                                                }}
                                            />
                                        )}
                                        sx={{ '& .MuiChip-root': { color: '#fff', background: '#666' } }}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Nom"
                                        fullWidth
                                        value={formData.nom || ''}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Biographie"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={formData.biographie || ''}
                                        onChange={(e) => handleInputChange('biographie', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Chemin de la photo"
                                        fullWidth
                                        value={formData.photo || ''}
                                        onChange={(e) => handleInputChange('photo', e.target.value)}
                                        placeholder="ex: /Volumes/My Passport for Mac/Intyma/images/ActriceName/photo.jpg"
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Nationalité"
                                        fullWidth
                                        value={formData.nationalite || ''}
                                        onChange={(e) => handleInputChange('nationalite', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Date de naissance"
                                        type="date"
                                        fullWidth
                                        value={formData.date_naissance || ''}
                                        onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Tags typiques (séparés par des virgules)"
                                        fullWidth
                                        value={formData.tags_typiques || ''}
                                        onChange={(e) => handleInputChange('tags_typiques', e.target.value)}
                                        placeholder="ex: brunette, milf, american"
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Commentaire"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={formData.commentaire || ''}
                                        onChange={(e) => handleInputChange('commentaire', e.target.value)}
                                        sx={{
                                            '& .MuiInputBase-root': { color: '#fff' },
                                            '& .MuiInputLabel-root': { color: '#aaa' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#666' },
                                                '&:hover fieldset': { borderColor: '#999' },
                                                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ background: '#333' }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#fff' }}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ ml: 2 }}>
                        {currentItem?.isNew ? 'Ajouter' : 'Modifier'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}