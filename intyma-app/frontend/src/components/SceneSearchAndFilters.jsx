import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Chip,
    Button,
    Typography,
    InputAdornment,
    Rating,
    Fade,
    Grow
} from '@mui/material';
import {
    Search,
    Clear,
    FilterList,
    Person,
    LocalOffer,
    HighQuality,
    AccessTime,
    Star,
    Movie
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// =================== STYLES PERSONNALISÉS ===================

const SearchContainer = styled(Box)({
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    marginBottom: '32px',
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
    }
});

const StyledSearchField = styled(TextField)({
    '& .MuiInputBase-root': {
        color: '#fff',
        background: 'rgba(26, 26, 26, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(218, 165, 32, 0.3)',
        fontSize: '1rem',
        transition: 'all 0.3s ease',

        '&:hover': {
            borderColor: 'rgba(218, 165, 32, 0.5)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(218, 165, 32, 0.1)',
        },

        '&.Mui-focused': {
            borderColor: '#DAA520',
            boxShadow: '0 0 15px rgba(218, 165, 32, 0.3)',
            transform: 'translateY(-1px)',
        }
    },
    '& .MuiInputLabel-root': {
        color: '#B8860B',
        fontWeight: 500,
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

const StyledFilterSelect = styled(FormControl)({
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

const ResetButton = styled(Button)({
    color: '#B8860B',
    borderColor: 'rgba(184, 134, 11, 0.3)',
    textTransform: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '8px',

    '&:hover': {
        borderColor: '#DAA520',
        background: 'rgba(218, 165, 32, 0.1)',
        color: '#DAA520',
    }
});

const ResultsCounter = styled(Typography)({
    color: '#DAA520',
    fontWeight: 600,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const FilterChip = styled(Chip)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
    color: '#F4D03F',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    fontWeight: 500,
    fontSize: '0.8rem',

    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
    },

    '& .MuiChip-deleteIcon': {
        color: '#F4D03F',
        '&:hover': {
            color: '#fff',
        }
    }
});

// =================== COMPOSANT PRINCIPAL ===================

const SceneSearchAndFilters = ({
                              scenes,
                              actrices,
                              favorites = [],
                              history = [],
                              onFilteredResults,
                              initialFilters = {}
                          }) => {
    // État des filtres
    const [filters, setFilters] = useState({
        query: '',
        actrices: [],
        tags: [],
        qualite: 'Toutes',
        duree: 'Toutes',
        note: 'Toutes',
        studio: 'Toutes',
        nbActrices: 'Toutes',
        dateAjoutOrder: 'Toutes', // Pour date d'ajout
        dateSceneOrder: 'Toutes', // Pour date de scène
        dateAjoutFrom: '', // Filtre date d'ajout début
        dateAjoutTo: '', // Filtre date d'ajout fin
        dateSceneFrom: '', // Filtre date de scène début
        dateSceneTo: '', // Filtre date de scène fin
        favorisOnly: false,
        historyOnly: false,
        ...initialFilters
    });

    // Debounce pour la recherche
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, query: searchQuery }));
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Extraction des options uniques depuis les données
    const filterOptions = useMemo(() => {
        //console.log('🔍 Extraction des tags depuis les scènes:', scenes.length, 'scènes');

        const qualites = [...new Set(scenes.map(s => s.qualite).filter(Boolean))];
        const studios = [...new Set(scenes.map(s => s.studio).filter(Boolean))];

        const allTags = [];
        scenes.forEach((scene, index) => {
            //console.log(`📝 Scène ${index + 1}: "${scene.titre}"`, scene.tags);

            if (scene.tags && Array.isArray(scene.tags)) {
                scene.tags.forEach(tag => {
                    let tagName = null;

                    // Cas 1: tag est un objet avec propriété 'nom'
                    if (tag && typeof tag === 'object' && tag.nom) {
                        tagName = tag.nom;
                    }
                    // Cas 2: tag est directement une string
                    else if (typeof tag === 'string') {
                        tagName = tag;
                    }
                    // Cas 3: autre format, forcer en string
                    else if (tag) {
                        tagName = String(tag);
                    }

                    if (tagName && tagName.trim()) {
                        allTags.push(tagName.trim());
                    }
                });
            }
        });

        const uniqueTags = [...new Set(allTags)].filter(Boolean);
        //console.log('✅ Tags uniques extraits:', uniqueTags);

        return {
            qualites: ['Toutes', ...qualites.sort()],
            studios: ['Toutes', ...studios.sort()],
            tags: uniqueTags.sort()
        };
    }, [scenes]);

    // Logique de filtrage
    const filteredScenes = useMemo(() => {
        return scenes.filter(scene => {
            // Recherche textuelle
            if (filters.query) {
                const query = filters.query.toLowerCase();
                const matchesTitle = scene.titre?.toLowerCase().includes(query);
                const matchesTags = scene.tags?.some(tag => tag.nom?.toLowerCase().includes(query));
                const matchesActrices = scene.actrices?.some(actrice => actrice.nom?.toLowerCase().includes(query));
                const matchesPath = scene.chemin?.toLowerCase().includes(query);

                if (!matchesTitle && !matchesTags && !matchesActrices && !matchesPath) {
                    return false;
                }
            }

            // Filtre actrice
            if (filters.actrices.length > 0) {
                const sceneActriceIds = scene.actrices?.map(a => a.id) || [];
                if (!filters.actrices.some(filterActrice => sceneActriceIds.includes(filterActrice.id))) {
                    return false;
                }
            }

            // Filtre tags
            if (filters.tags.length > 0) {
                const sceneTags = scene.tags?.map(t => t.nom) || [];
                if (!filters.tags.every(tag => sceneTags.includes(tag))) {
                    return false;
                }
            }

            // Filtre nombre d'actrices
            if (filters.nbActrices !== 'Toutes') {
                const count = scene.actrices?.length || 0;
                if (filters.nbActrices === '4+') {
                    if (count < 4) return false;
                } else {
                    if (count !== parseInt(filters.nbActrices, 10)) return false;
                }
            }


            // Filtre qualité
            if (filters.qualite !== 'Toutes' && scene.qualite !== filters.qualite) {
                return false;
            }

            // Filtre durée
            if (filters.duree !== 'Toutes') {
                const duree = scene.duree || 0;
                switch (filters.duree) {
                    case '< 10 min':
                        if (duree >= 10) return false;
                        break;
                    case '10-20 min':
                        if (duree < 10 || duree > 20) return false;
                        break;
                    case '20-30 min':
                        if (duree < 20 || duree > 30) return false;
                        break;
                    case '> 30 min':
                        if (duree <= 30) return false;
                        break;
                }
            }

            // Filtre note
            if (filters.note !== 'Toutes') {
                const noteMin = parseInt(filters.note.replace(' ⭐', ''));
                const sceneNote = parseFloat(scene.note_perso) || 0;
                if (sceneNote < noteMin) return false;
            }

            // Filtre studio
            if (filters.studio !== 'Toutes' && scene.studio !== filters.studio) {
                return false;
            }

            // Filtre par date d'ajout
            if (filters.dateAjoutFrom || filters.dateAjoutTo) {
                const dateAjout = scene.date_ajout;
                if (dateAjout) {
                    const dateAjoutObj = new Date(dateAjout);
                    if (filters.dateAjoutFrom && dateAjoutObj < new Date(filters.dateAjoutFrom)) return false;
                    if (filters.dateAjoutTo && dateAjoutObj > new Date(filters.dateAjoutTo)) return false;
                } else if (filters.dateAjoutFrom || filters.dateAjoutTo) {
                    return false; // Exclure les scènes sans date d'ajout si on filtre par date d'ajout
                }
            }

            // Filtre par date de scène
            if (filters.dateSceneFrom || filters.dateSceneTo) {
                const dateScene = scene.date_scene;
                if (dateScene) {
                    const dateSceneObj = new Date(dateScene);
                    if (filters.dateSceneFrom && dateSceneObj < new Date(filters.dateSceneFrom)) return false;
                    if (filters.dateSceneTo && dateSceneObj > new Date(filters.dateSceneTo)) return false;
                } else if (filters.dateSceneFrom || filters.dateSceneTo) {
                    return false; // Exclure les scènes sans date de scène si on filtre par date de scène
                }
            }

            // Filtre favoris (tu devras passer favorites en props)
            if (filters.favorisOnly) {
                // Supposer que tu passes favorites comme prop
                const isFavorite = favorites.some(fav => fav.scene_id === scene.id);
                if (!isFavorite) return false;
            }

            // Filtre historique (tu devras passer history en props)
            if (filters.historyOnly) {
                // Supposer que tu passes history comme prop
                const isInHistory = history.some(hist => hist.scene_id === scene.id);
                if (!isInHistory) return false;
            }

            return true;
        }).sort((a, b) => {
            // Tri par date d'ajout en priorité
            if (filters.dateAjoutOrder !== 'Toutes') {
                const dateAjoutA = new Date(a.date_ajout || 0);
                const dateAjoutB = new Date(b.date_ajout || 0);

                if (filters.dateAjoutOrder === 'Plus récent') {
                    const ajoutSort = dateAjoutB - dateAjoutA;
                    if (ajoutSort !== 0) return ajoutSort;
                } else if (filters.dateAjoutOrder === 'Plus ancien') {
                    const ajoutSort = dateAjoutA - dateAjoutB;
                    if (ajoutSort !== 0) return ajoutSort;
                }
            }

            // Tri par date de scène en second
            if (filters.dateSceneOrder !== 'Toutes') {
                const dateSceneA = new Date(a.date_scene || 0);
                const dateSceneB = new Date(b.date_scene || 0);

                if (filters.dateSceneOrder === 'Plus récent') {
                    return dateSceneB - dateSceneA;
                } else if (filters.dateSceneOrder === 'Plus ancien') {
                    return dateSceneA - dateSceneB;
                }
            }

            return 0;
        });
    }, [scenes, filters]);

    // Notifier le parent des résultats filtrés
    useEffect(() => {
        onFilteredResults(filteredScenes);
    }, [filteredScenes, onFilteredResults]);

    // Réinitialiser les filtres
    const handleReset = () => {
        setFilters({
            query: '',
            actrices: [],
            tags: [],
            qualite: 'Toutes',
            duree: 'Toutes',
            note: 'Toutes',
            studio: 'Toutes',
            nbActrices: 'Toutes',
            dateAjoutOrder: 'Toutes',
            dateSceneOrder: 'Toutes',
            dateAjoutFrom: '',
            dateAjoutTo: '',
            dateSceneFrom: '',
            dateSceneTo: '',
            favorisOnly: false,
            historyOnly: false,
        });
        setSearchQuery('');
    };

    // Compter les filtres actifs
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'query') return value.length > 0;
        if (key === 'tags') return value.length > 0;
        if (key === 'actrices') return value.length > 0;
        if (key === 'favorisOnly' || key === 'historyOnly') return value === true;
        if (key === 'dateAjoutFrom' || key === 'dateAjoutTo' || key === 'dateSceneFrom' || key === 'dateSceneTo') return value.length > 0;
        if (key === 'dateAjoutOrder' || key === 'dateSceneOrder') return value !== 'Toutes';
        return value !== 'Toutes';
    }).length;

    return (
        <SearchContainer>
            {/* Ligne 1 : Recherche principale */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                <StyledSearchField
                    fullWidth
                    placeholder="Rechercher une scène (titre, tag, actrice, fichier…)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#DAA520' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <ResetButton
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleReset}
                    disabled={activeFiltersCount === 0}
                >
                    Réinitialiser
                </ResetButton>
            </Box>

            {/* Ligne 2 : Filtres */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                mb: 2
            }}>
                {/* Filtre Actrice */}
                <Autocomplete
                    sx={{ minWidth: 200 }}
                    size="small"
                    multiple
                    options={[...actrices].sort((a, b) => a.nom.localeCompare(b.nom))}
                    getOptionLabel={(option) => option.nom}
                    value={filters.actrices}
                    onChange={(event, newValue) => {
                        setFilters(prev => ({ ...prev, actrices: newValue }));
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <FilterChip
                                    key={key}
                                    variant="outlined"
                                    label={option.nom}
                                    size="small"
                                    {...tagProps}
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <StyledSearchField
                            {...params}
                            label="Actrices"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person sx={{ color: '#DAA520', fontSize: '1rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />

                {/* Filtre Tags */}
                <Autocomplete
                    sx={{ minWidth: 200 }}
                    size="small"
                    multiple
                    options={filterOptions.tags}
                    value={filters.tags}
                    onChange={(event, newValue) => {
                        setFilters(prev => ({ ...prev, tags: newValue }));
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <FilterChip
                                variant="outlined"
                                label={option}
                                size="small"
                                {...getTagProps({ index })}
                                key={index}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <StyledSearchField
                            {...params}
                            label="Tags"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalOffer sx={{ color: '#DAA520', fontSize: '1rem' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />

                {/* Filtre Qualité */}
                <StyledFilterSelect size="small">
                    <InputLabel>Qualité</InputLabel>
                    <Select
                        value={filters.qualite}
                        onChange={(e) => setFilters(prev => ({ ...prev, qualite: e.target.value }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <HighQuality sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        {filterOptions.qualites.map(qualite => (
                            <MenuItem key={qualite} value={qualite}>{qualite}</MenuItem>
                        ))}
                    </Select>
                </StyledFilterSelect>

                {/* Filtre Durée */}
                <StyledFilterSelect size="small">
                    <InputLabel>Durée</InputLabel>
                    <Select
                        value={filters.duree}
                        onChange={(e) => setFilters(prev => ({ ...prev, duree: e.target.value }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <AccessTime sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="Toutes">Toutes</MenuItem>
                        <MenuItem value="< 10 min">{'< 10 min'}</MenuItem>
                        <MenuItem value="10-20 min">10-20 min</MenuItem>
                        <MenuItem value="20-30 min">20-30 min</MenuItem>
                        <MenuItem value="> 30 min">{'> 30 min'}</MenuItem>
                    </Select>
                </StyledFilterSelect>

                {/* Filtre Note */}
                <StyledFilterSelect size="small">
                    <InputLabel>Note</InputLabel>
                    <Select
                        value={filters.note}
                        onChange={(e) => setFilters(prev => ({ ...prev, note: e.target.value }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <Star sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="Toutes">Toutes</MenuItem>
                        <MenuItem value="5 ⭐">5 ⭐</MenuItem>
                        <MenuItem value="4 ⭐">4 ⭐ et +</MenuItem>
                        <MenuItem value="3 ⭐">3 ⭐ et +</MenuItem>
                        <MenuItem value="2 ⭐">2 ⭐ et +</MenuItem>
                        <MenuItem value="1 ⭐">1 ⭐ et +</MenuItem>
                    </Select>
                </StyledFilterSelect>

                {/* Filtre Studio */}
                <StyledFilterSelect size="small">
                    <InputLabel>Studio</InputLabel>
                    <Select
                        value={filters.studio}
                        onChange={(e) => setFilters(prev => ({ ...prev, studio: e.target.value }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <Movie sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        {filterOptions.studios.map(studio => (
                            <MenuItem key={studio} value={studio}>{studio}</MenuItem>
                        ))}
                    </Select>
                </StyledFilterSelect>

                {/* Filtre Nombre d’actrices */}
                <StyledFilterSelect size="small">
                    <InputLabel>Nb d’actrices</InputLabel>
                    <Select
                        value={filters.nbActrices}
                        onChange={(e) => setFilters(prev => ({
                            ...prev,
                            nbActrices: e.target.value
                        }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <Person sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="Toutes">Toutes</MenuItem>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                        <MenuItem value="3">3</MenuItem>
                        <MenuItem value="4+">4+</MenuItem>
                    </Select>
                </StyledFilterSelect>

                {/* Ligne 3 : Filtres supplémentaires */}
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 2
                }}>
                    {/* === FILTRES DATE D'AJOUT === */}
                    <Typography variant="subtitle2" sx={{ color: '#B8860B', fontWeight: 600, mr: 1 }}>
                        Date d'ajout :
                    </Typography>

                    <StyledFilterSelect size="small">
                        <InputLabel>Tri ajout</InputLabel>
                        <Select
                            value={filters.dateAjoutOrder}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateAjoutOrder: e.target.value }))}
                        >
                            <MenuItem value="Toutes">Par défaut</MenuItem>
                            <MenuItem value="Plus récent">Plus récent d'abord</MenuItem>
                            <MenuItem value="Plus ancien">Plus ancien d'abord</MenuItem>
                        </Select>
                    </StyledFilterSelect>

                    <StyledSearchField
                        label="Ajouté depuis"
                        type="date"
                        size="small"
                        sx={{ minWidth: 140 }}
                        value={filters.dateAjoutFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateAjoutFrom: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />

                    <StyledSearchField
                        label="Ajouté jusqu'à"
                        type="date"
                        size="small"
                        sx={{ minWidth: 140 }}
                        value={filters.dateAjoutTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateAjoutTo: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* === SÉPARATEUR === */}
                    <Box sx={{ width: '1px', height: '40px', background: 'rgba(218, 165, 32, 0.3)', mx: 1 }} />

                    {/* === FILTRES DATE DE SCÈNE === */}
                    <Typography variant="subtitle2" sx={{ color: '#B8860B', fontWeight: 600, mr: 1 }}>
                        Date de scène :
                    </Typography>

                    <StyledFilterSelect size="small">
                        <InputLabel>Tri scène</InputLabel>
                        <Select
                            value={filters.dateSceneOrder}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateSceneOrder: e.target.value }))}
                        >
                            <MenuItem value="Toutes">Par défaut</MenuItem>
                            <MenuItem value="Plus récent">Plus récent d'abord</MenuItem>
                            <MenuItem value="Plus ancien">Plus ancien d'abord</MenuItem>
                        </Select>
                    </StyledFilterSelect>

                    <StyledSearchField
                        label="Scène depuis"
                        type="date"
                        size="small"
                        sx={{ minWidth: 140 }}
                        value={filters.dateSceneFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateSceneFrom: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />

                    <StyledSearchField
                        label="Scène jusqu'à"
                        type="date"
                        size="small"
                        sx={{ minWidth: 140 }}
                        value={filters.dateSceneTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateSceneTo: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* === SÉPARATEUR === */}
                    <Box sx={{ width: '1px', height: '40px', background: 'rgba(218, 165, 32, 0.3)', mx: 1 }} />

                    {/* Favoris seulement */}
                    <Button
                        variant={filters.favorisOnly ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setFilters(prev => ({ ...prev, favorisOnly: !prev.favorisOnly }))}
                        sx={{
                            borderColor: '#FF6B9D',
                            color: filters.favorisOnly ? '#fff' : '#FF6B9D',
                            background: filters.favorisOnly ? 'linear-gradient(135deg, #FF6B9D, #FF5722)' : 'transparent',
                            '&:hover': {
                                background: filters.favorisOnly ? 'linear-gradient(135deg, #FF7BAD, #FF6B9D)' : 'rgba(255, 107, 157, 0.1)',
                            }
                        }}
                    >
                        ❤️ Favoris uniquement
                    </Button>

                    {/* Historique seulement */}
                    <Button
                        variant={filters.historyOnly ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setFilters(prev => ({ ...prev, historyOnly: !prev.historyOnly }))}
                        sx={{
                            borderColor: '#4CAF50',
                            color: filters.historyOnly ? '#fff' : '#4CAF50',
                            background: filters.historyOnly ? 'linear-gradient(135deg, #4CAF50, #45A049)' : 'transparent',
                            '&:hover': {
                                background: filters.historyOnly ? 'linear-gradient(135deg, #5CBF60, #4CAF50)' : 'rgba(76, 175, 80, 0.1)',
                            }
                        }}
                    >
                        👁️ Vues uniquement
                    </Button>
                </Box>
            </Box>

            {/* Ligne 3 : Compteur de résultats */}
            <Fade in={true}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList sx={{ fontSize: '1rem', color: '#DAA520' }} />
                    <Typography variant="body1" sx={{ color: '#DAA520', fontWeight: 600, fontSize: '0.9rem' }}>
                        {filteredScenes.length} scène{filteredScenes.length !== 1 ? 's' : ''} trouvée{filteredScenes.length !== 1 ? 's' : ''}
                    </Typography>
                    {activeFiltersCount > 0 && (
                        <Chip
                            label={`${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''}`}
                            size="small"
                            sx={{
                                background: 'rgba(218, 165, 32, 0.2)',
                                color: '#DAA520',
                                fontSize: '0.7rem'
                            }}
                        />
                    )}
                </Box>
            </Fade>

            {/* Ligne 4 : Affichage des filtres actifs */}
            {(filters.actrices.length > 0 || filters.tags.length > 0 ||
                filters.qualite !== 'Toutes' || filters.duree !== 'Toutes' ||
                filters.note !== 'Toutes' || filters.studio !== 'Toutes' ||
                filters.nbActrices !== 'Toutes' ||
                filters.favorisOnly || filters.historyOnly ||
                filters.dateAjoutFrom || filters.dateAjoutTo ||
                filters.dateSceneFrom || filters.dateSceneTo ||
                filters.dateAjoutOrder !== 'Toutes' || filters.dateSceneOrder !== 'Toutes') && (
                <Fade in={true}>
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        background: 'rgba(42, 42, 42, 0.6)',
                        borderRadius: '12px',
                        border: '1px solid rgba(218, 165, 32, 0.1)'
                    }}>
                        <Typography variant="subtitle2" sx={{
                            color: '#B8860B',
                            mb: 1,
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            Filtres actifs :
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {/* Actrices sélectionnées */}
                            {filters.actrices.map((actrice) => (
                                <FilterChip
                                    key={actrice.id}
                                    label={`👤 ${actrice.nom}`}
                                    size="small"
                                    onDelete={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            actrices: prev.actrices.filter(a => a.id !== actrice.id)
                                        }));
                                    }}
                                />
                            ))}

                            {/* Tags sélectionnés */}
                            {filters.tags.map((tag) => (
                                <FilterChip
                                    key={tag}
                                    label={`🏷️ ${tag}`}
                                    size="small"
                                    onDelete={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            tags: prev.tags.filter(t => t !== tag)
                                        }));
                                    }}
                                />
                            ))}

                            {/* Autres filtres */}
                            {filters.qualite !== 'Toutes' && (
                                <FilterChip
                                    label={`📺 ${filters.qualite}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, qualite: 'Toutes' }))}
                                />
                            )}

                            {filters.duree !== 'Toutes' && (
                                <FilterChip
                                    label={`⏱️ ${filters.duree}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, duree: 'Toutes' }))}
                                />
                            )}

                            {filters.note !== 'Toutes' && (
                                <FilterChip
                                    label={`⭐ ${filters.note}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, note: 'Toutes' }))}
                                />
                            )}

                            {filters.studio !== 'Toutes' && (
                                <FilterChip
                                    label={`🎬 ${filters.studio}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, studio: 'Toutes' }))}
                                />
                            )}

                            {/* AJOUTER ces nouveaux filtres */}
                            {filters.favorisOnly && (
                                <FilterChip
                                    label="❤️ Favoris uniquement"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, favorisOnly: false }))}
                                />
                            )}

                            {filters.historyOnly && (
                                <FilterChip
                                    label="👁️ Vues uniquement"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, historyOnly: false }))}
                                />
                            )}

                            {/* Filtres de dates */}
                            {filters.dateAjoutFrom && (
                                <FilterChip
                                    label={`📅 Ajouté depuis ${filters.dateAjoutFrom}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateAjoutFrom: '' }))}
                                />
                            )}

                            {filters.dateAjoutTo && (
                                <FilterChip
                                    label={`📅 Ajouté jusqu'à ${filters.dateAjoutTo}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateAjoutTo: '' }))}
                                />
                            )}

                            {filters.dateSceneFrom && (
                                <FilterChip
                                    label={`📅 Scène depuis ${filters.dateSceneFrom}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateSceneFrom: '' }))}
                                />
                            )}

                            {filters.dateSceneTo && (
                                <FilterChip
                                    label={`📅 Scène jusqu'à ${filters.dateSceneTo}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateSceneTo: '' }))}
                                />
                            )}

                            {filters.dateAjoutOrder !== 'Toutes' && (
                                <FilterChip
                                    label={`📅 Tri ajout: ${filters.dateAjoutOrder}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateAjoutOrder: 'Toutes' }))}
                                />
                            )}

                            {filters.dateSceneOrder !== 'Toutes' && (
                                <FilterChip
                                    label={`📅 Tri scène: ${filters.dateSceneOrder}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, dateSceneOrder: 'Toutes' }))}
                                />
                            )}

                            {filters.nbActrices !== 'Toutes' && (
                                <FilterChip
                                    label={`👥 ${filters.nbActrices}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, nbActrices: 'Toutes' }))}
                                />
                            )}

                        </Box>
                    </Box>
                </Fade>
            )}
        </SearchContainer>
    );
};

export default SceneSearchAndFilters;