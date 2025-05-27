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
    Slider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Search,
    Clear,
    FilterList,
    Person,
    LocalOffer,
    Star,
    Public,
    Cake,
    Movie,
    VisibilityOutlined,
    Photo,
    Description,
    Favorite
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

const StyledSlider = styled(Slider)({
    color: '#DAA520',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
        background: 'linear-gradient(90deg, #DAA520, #F4D03F)',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#F4D03F',
        border: '2px solid #DAA520',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        lineHeight: 1.2,
        fontSize: 12,
        background: 'linear-gradient(135deg, #DAA520, #B8860B)',
        padding: '6px 12px',
        borderRadius: '8px',
        '&:before': { display: 'none' },
    },
});

const StyledSwitch = styled(Switch)({
    '& .MuiSwitch-switchBase': {
        color: '#B8860B',
        '&.Mui-checked': {
            color: '#DAA520',
            '& + .MuiSwitch-track': {
                backgroundColor: '#DAA520',
                opacity: 0.7,
            },
        },
    },
    '& .MuiSwitch-track': {
        backgroundColor: 'rgba(184, 134, 11, 0.3)',
    },
});

// =================== COMPOSANT PRINCIPAL ===================

const ActriceSearchAndFilters = ({
                                     actrices,
                                     scenes,
                                     favorites = [],
                                     history = [],
                                     onFilteredResults,
                                     initialFilters = {}
                                 }) => {
    // Calculer l'âge à partir de la date de naissance
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // Compter le nombre de scènes par actrice
    const countScenesByActrice = (actriceId) => {
        return scenes.filter(scene =>
            scene.actrices && scene.actrices.some(actrice => actrice.id === actriceId)
        ).length;
    };

    // État des filtres
    const [filters, setFilters] = useState({
        query: '',
        nationalite: 'Toutes',
        ageRange: [18, 65], // Valeurs par défaut temporaires
        noteMinimum: 0,
        nbScenesMin: 0,
        tagsTypiques: [],
        hasPhoto: false,
        hasBiographie: false,
        hasCommentaire: false,
        sortBy: 'nom',
        sortOrder: 'asc',
        favoritesOnly: false,
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
        // ✅ CORRECTION : Vérifier que actrices et scenes existent et ne sont pas vides
        if (!actrices || !Array.isArray(actrices) || actrices.length === 0) {
            console.log('⚠️ Actrices pas encore chargées ou vides');
            return {
                nationalites: ['Toutes'],
                tagsTypiques: [],
                ageMin: 18,
                ageMax: 65,
                scenesMax: 10
            };
        }

        if (!scenes || !Array.isArray(scenes)) {
            console.log('⚠️ Scènes pas encore chargées');
            return {
                nationalites: ['Toutes'],
                tagsTypiques: [],
                ageMin: 18,
                ageMax: 65,
                scenesMax: 10
            };
        }

        console.log('🔍 Extraction des options depuis les actrices:', actrices.length);

        const nationalites = [...new Set(actrices.map(a => a.nationalite).filter(Boolean))];

        const allTagsTypiques = [];
        actrices.forEach((actrice) => {
            if (actrice.tags_typiques) {
                const tags = actrice.tags_typiques.split(',').map(tag => tag.trim()).filter(Boolean);
                allTagsTypiques.push(...tags);
            }
        });

        const uniqueTagsTypiques = [...new Set(allTagsTypiques)].sort();

        // Calculer les plages min/max pour les sliders
        const ages = actrices.map(a => calculateAge(a.date_naissance)).filter(Boolean);
        const ageMin = ages.length > 0 ? Math.min(...ages) : 18;
        const ageMax = ages.length > 0 ? Math.max(...ages) : 65;

        const nbScenes = actrices.map(a => countScenesByActrice(a.id));
        const scenesMax = nbScenes.length > 0 ? Math.max(...nbScenes) : 10;

        console.log('✅ Options extraites:', { nationalites, uniqueTagsTypiques, ageMin, ageMax, scenesMax });

        return {
            nationalites: ['Toutes', ...nationalites.sort()],
            tagsTypiques: uniqueTagsTypiques,
            ageMin,
            ageMax,
            scenesMax
        };
    }, [actrices, scenes]);

    // ✅ Mettre à jour les plages par défaut quand les données sont chargées
    useEffect(() => {
        if (filterOptions.ageMin !== undefined && filterOptions.ageMax !== undefined) {
            setFilters(prev => ({
                ...prev,
                ageRange: [filterOptions.ageMin, filterOptions.ageMax]
            }));
        }
    }, [filterOptions.ageMin, filterOptions.ageMax]);

    // Logique de filtrage
    const filteredActrices = useMemo(() => {
        // ✅ CORRECTION : Vérifier que actrices existe avant de filtrer
        if (!actrices || !Array.isArray(actrices) || actrices.length === 0) {
            console.log('⚠️ Actrices pas encore chargées pour le filtrage');
            return [];
        }

        if (!scenes || !Array.isArray(scenes)) {
            console.log('⚠️ Scènes pas encore chargées pour le filtrage');
            return actrices; // Retourner au moins les actrices même sans scènes
        }

        return actrices.filter(actrice => {
            // Recherche textuelle
            if (filters.query) {
                const query = filters.query.toLowerCase();
                const matchesNom = actrice.nom?.toLowerCase().includes(query);
                const matchesBiographie = actrice.biographie?.toLowerCase().includes(query);
                const matchesCommentaire = actrice.commentaire?.toLowerCase().includes(query);
                const matchesTagsTypiques = actrice.tags_typiques?.toLowerCase().includes(query);

                if (!matchesNom && !matchesBiographie && !matchesCommentaire && !matchesTagsTypiques) {
                    return false;
                }
            }

            // Filtre nationalité
            if (filters.nationalite !== 'Toutes' && actrice.nationalite !== filters.nationalite) {
                return false;
            }

            // Filtre âge
            const age = calculateAge(actrice.date_naissance);
            if (age !== null) {
                if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
                    return false;
                }
            }

            // Filtre note minimum
            if (filters.noteMinimum > 0) {
                const noteActrice = actrice.note_moyenne || 0;
                if (noteActrice < filters.noteMinimum) {
                    return false;
                }
            }

            // Filtre nombre de scènes minimum
            if (filters.nbScenesMin > 0) {
                const nbScenes = countScenesByActrice(actrice.id);
                if (nbScenes < filters.nbScenesMin) {
                    return false;
                }
            }

            // Filtre tags typiques
            if (filters.tagsTypiques.length > 0) {
                const actriceTagsTypiques = actrice.tags_typiques ?
                    actrice.tags_typiques.split(',').map(tag => tag.trim().toLowerCase()) : [];

                const hasAllTags = filters.tagsTypiques.every(filterTag =>
                    actriceTagsTypiques.includes(filterTag.toLowerCase())
                );

                if (!hasAllTags) {
                    return false;
                }
            }

            // Filtre photo
            if (filters.hasPhoto && !actrice.photo) {
                return false;
            }

            // Filtre biographie
            if (filters.hasBiographie && !actrice.biographie) {
                return false;
            }

            // Filtre commentaire
            if (filters.hasCommentaire && !actrice.commentaire) {
                return false;
            }

            // Filtre actrices aimées (au moins une scène en favoris)
            if (filters.favoritesOnly) {
                const isLoved = scenes.some(scene =>
                    scene.actrices && scene.actrices.some(a => a.id === actrice.id)
                    && favorites.some(fav => fav.scene_id === scene.id)
                );
                if (!isLoved) return false;
            }

            // Filtre actrices vues (au moins une scène dans l’historique)
            if (filters.historyOnly) {
                const isSeen = scenes.some(scene =>
                    scene.actrices && scene.actrices.some(a => a.id === actrice.id)
                    && history.some(hist => hist.scene_id === scene.id)
                );
                if (!isSeen) return false;
            }

            return true;
        }).sort((a, b) => {
            let compareValue = 0;

            switch (filters.sortBy) {
                case 'nom':
                    compareValue = a.nom.localeCompare(b.nom);
                    break;
                case 'age':
                    const ageA = calculateAge(a.date_naissance) || 0;
                    const ageB = calculateAge(b.date_naissance) || 0;
                    compareValue = ageA - ageB;
                    break;
                case 'note':
                    compareValue = (a.note_moyenne || 0) - (b.note_moyenne || 0);
                    break;
                case 'scenes':
                    const scenesA = countScenesByActrice(a.id);
                    const scenesB = countScenesByActrice(b.id);
                    compareValue = scenesA - scenesB;
                    break;
                case 'nationalite':
                    compareValue = (a.nationalite || '').localeCompare(b.nationalite || '');
                    break;
                case 'derniere_vue':
                    const dateA = new Date(a.derniere_vue || 0);
                    const dateB = new Date(b.derniere_vue || 0);
                    compareValue = dateA - dateB;
                    break;
                default:
                    compareValue = 0;
            }

            return filters.sortOrder === 'desc' ? -compareValue : compareValue;
        });
    }, [actrices, scenes, filters]);

    // Notifier le parent des résultats filtrés
    useEffect(() => {
        onFilteredResults(filteredActrices);
    }, [filteredActrices, onFilteredResults]);

    // Réinitialiser les filtres
    const handleReset = () => {
        setFilters({
            query: '',
            nationalite: 'Toutes',
            ageRange: [filterOptions.ageMin || 18, filterOptions.ageMax || 65], // ✅ Utiliser les vraies valeurs
            noteMinimum: 0,
            nbScenesMin: 0,
            tagsTypiques: [],
            hasPhoto: false,
            hasBiographie: false,
            hasCommentaire: false,
            sortBy: 'nom',
            sortOrder: 'asc',
        });
        setSearchQuery('');
    };

    // Compter les filtres actifs
    const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
        if (key === 'query') return value.length > 0;
        if (key === 'tagsTypiques') return value.length > 0;
        if (key === 'nationalite') return value !== 'Toutes';
        // ✅ CORRECTION : Comparer avec les vraies valeurs min/max calculées
        if (key === 'ageRange') {
            const realMin = filterOptions.ageMin || 18;
            const realMax = filterOptions.ageMax || 65;
            return value[0] !== realMin || value[1] !== realMax;
        }
        if (key === 'noteMinimum') return value > 0;
        if (key === 'nbScenesMin') return value > 0;
        if (key === 'hasPhoto' || key === 'hasBiographie' || key === 'hasCommentaire') return value === true;
        if (key === 'sortBy') return value !== 'nom';
        if (key === 'sortOrder') return value !== 'asc';
        // ✅ AJOUTER CES LIGNES
        if (key === 'favoritesOnly' || key === 'historyOnly') return value === true;
        return false;
    }).length;

    return (
        <SearchContainer>
            {/* Ligne 1 : Recherche principale */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
                <StyledSearchField
                    fullWidth
                    placeholder="Rechercher une actrice (nom, biographie, tags…)"
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

            {/* Ligne 2 : Filtres de base */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                mb: 2
            }}>
                {/* Nationalité */}
                <StyledFilterSelect size="small">
                    <InputLabel>Nationalité</InputLabel>
                    <Select
                        value={filters.nationalite}
                        onChange={(e) => setFilters(prev => ({ ...prev, nationalite: e.target.value }))}
                        startAdornment={
                            <InputAdornment position="start">
                                <Public sx={{ color: '#DAA520', fontSize: '1rem' }} />
                            </InputAdornment>
                        }
                    >
                        {filterOptions.nationalites.map(nationalite => (
                            <MenuItem key={nationalite} value={nationalite}>{nationalite}</MenuItem>
                        ))}
                    </Select>
                </StyledFilterSelect>

                {/* Tags typiques */}
                <Autocomplete
                    sx={{ minWidth: 200 }}
                    size="small"
                    multiple
                    options={filterOptions.tagsTypiques}
                    value={filters.tagsTypiques}
                    onChange={(event, newValue) => {
                        setFilters(prev => ({ ...prev, tagsTypiques: newValue }));
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <FilterChip
                                    key={key}
                                    variant="outlined"
                                    label={option}
                                    size="small"
                                    {...tagProps}
                                />
                            );
                        })
                    }
                    renderInput={(params) => (
                        <StyledSearchField
                            {...params}
                            label="Tags typiques"
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

                {/* Tri */}
                <StyledFilterSelect size="small">
                    <InputLabel>Trier par</InputLabel>
                    <Select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    >
                        <MenuItem value="nom">Nom</MenuItem>
                        <MenuItem value="age">Âge</MenuItem>
                        <MenuItem value="note">Note moyenne</MenuItem>
                        <MenuItem value="scenes">Nombre de scènes</MenuItem>
                        <MenuItem value="nationalite">Nationalité</MenuItem>
                        <MenuItem value="derniere_vue">Dernière vue</MenuItem>
                    </Select>
                </StyledFilterSelect>

                <StyledFilterSelect size="small">
                    <InputLabel>Ordre</InputLabel>
                    <Select
                        value={filters.sortOrder}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                    >
                        <MenuItem value="asc">Croissant</MenuItem>
                        <MenuItem value="desc">Décroissant</MenuItem>
                    </Select>
                </StyledFilterSelect>
            </Box>

            {/* Ligne 3 : Sliders et switches */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 3,
                mb: 2
            }}>
                {/* Slider âge */}
                <Box>
                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Cake sx={{ fontSize: '1rem' }} />
                        Âge : {filters.ageRange[0]} - {filters.ageRange[1]} ans
                    </Typography>
                    <StyledSlider
                        value={filters.ageRange}
                        onChange={(event, newValue) => setFilters(prev => ({ ...prev, ageRange: newValue }))}
                        valueLabelDisplay="auto"
                        min={filterOptions.ageMin || 18}
                        max={filterOptions.ageMax || 65}
                        step={1}
                    />
                </Box>

                {/* Slider note minimum */}
                <Box>
                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star sx={{ fontSize: '1rem' }} />
                        Note minimum : {filters.noteMinimum}/5
                    </Typography>
                    <StyledSlider
                        value={filters.noteMinimum}
                        onChange={(event, newValue) => setFilters(prev => ({ ...prev, noteMinimum: newValue }))}
                        valueLabelDisplay="auto"
                        min={0}
                        max={5}
                        step={0.5}
                    />
                </Box>

                {/* Slider nombre de scènes minimum */}
                <Box>
                    <Typography variant="subtitle2" sx={{ color: '#B8860B', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Movie sx={{ fontSize: '1rem' }} />
                        Scènes minimum : {filters.nbScenesMin}
                    </Typography>
                    <StyledSlider
                        value={filters.nbScenesMin}
                        onChange={(event, newValue) => setFilters(prev => ({ ...prev, nbScenesMin: newValue }))}
                        valueLabelDisplay="auto"
                        min={0}
                        max={filterOptions.scenesMax || 10}
                        step={1}
                    />
                </Box>
            </Box>

            {/* Ligne 4 : Switches */}
            <Box sx={{
                display: 'flex',
                gap: 3,
                alignItems: 'center',
                flexWrap: 'wrap',
                mb: 2
            }}>
                <FormControlLabel
                    control={
                        <StyledSwitch
                            checked={filters.hasPhoto}
                            onChange={(e) => setFilters(prev => ({ ...prev, hasPhoto: e.target.checked }))}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B8860B' }}>
                            <Photo sx={{ fontSize: '1rem' }} />
                            Avec photo
                        </Box>
                    }
                />

                <FormControlLabel
                    control={
                        <StyledSwitch
                            checked={filters.hasBiographie}
                            onChange={(e) => setFilters(prev => ({ ...prev, hasBiographie: e.target.checked }))}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B8860B' }}>
                            <Description sx={{ fontSize: '1rem' }} />
                            Avec biographie
                        </Box>
                    }
                />

                <FormControlLabel
                    control={
                        <StyledSwitch
                            checked={filters.hasCommentaire}
                            onChange={(e) => setFilters(prev => ({ ...prev, hasCommentaire: e.target.checked }))}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B8860B' }}>
                            <VisibilityOutlined sx={{ fontSize: '1rem' }} />
                            Avec commentaire
                        </Box>
                    }
                />

                <FormControlLabel
                    control={
                        <StyledSwitch
                            checked={filters.favoritesOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, favoritesOnly: e.target.checked }))}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B8860B' }}>
                            <Favorite sx={{ fontSize: '1rem', color: '#FF6B9D' }} />
                            Actrices aimées uniquement
                        </Box>
                    }
                />

                <FormControlLabel
                    control={
                        <StyledSwitch
                            checked={filters.historyOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, historyOnly: e.target.checked }))}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#B8860B' }}>
                            <VisibilityOutlined sx={{ fontSize: '1rem', color: '#4CAF50' }} />
                            Actrices vues uniquement
                        </Box>
                    }
                />

            </Box>

            {/* Ligne 5 : Compteur de résultats */}
            <Fade in={true}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ResultsCounter>
                        <FilterList sx={{ fontSize: '1rem' }} />
                        {filteredActrices.length} actrice{filteredActrices.length !== 1 ? 's' : ''} trouvée{filteredActrices.length !== 1 ? 's' : ''}
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
                    </ResultsCounter>
                </Box>
            </Fade>

            {/* Ligne 6 : Affichage des filtres actifs */}
            {activeFiltersCount > 0 && (
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
                            {/* Tags typiques sélectionnés */}
                            {filters.tagsTypiques.map((tag) => (
                                <FilterChip
                                    key={tag}
                                    label={`🏷️ ${tag}`}
                                    size="small"
                                    onDelete={() => {
                                        setFilters(prev => ({
                                            ...prev,
                                            tagsTypiques: prev.tagsTypiques.filter(t => t !== tag)
                                        }));
                                    }}
                                />
                            ))}

                            {/* Autres filtres */}
                            {filters.nationalite !== 'Toutes' && (
                                <FilterChip
                                    label={`🌍 ${filters.nationalite}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, nationalite: 'Toutes' }))}
                                />
                            )}

                            {/* ✅ CORRECTION : Comparer avec les vraies valeurs min/max */}
                            {(filters.ageRange[0] !== (filterOptions.ageMin || 18) || filters.ageRange[1] !== (filterOptions.ageMax || 65)) && (
                                <FilterChip
                                    label={`🎂 ${filters.ageRange[0]}-${filters.ageRange[1]} ans`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({
                                        ...prev,
                                        ageRange: [filterOptions.ageMin || 18, filterOptions.ageMax || 65]
                                    }))}
                                />
                            )}

                            {filters.noteMinimum > 0 && (
                                <FilterChip
                                    label={`⭐ Note ≥ ${filters.noteMinimum}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, noteMinimum: 0 }))}
                                />
                            )}

                            {filters.nbScenesMin > 0 && (
                                <FilterChip
                                    label={`🎬 Scènes ≥ ${filters.nbScenesMin}`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, nbScenesMin: 0 }))}
                                />
                            )}

                            {filters.hasPhoto && (
                                <FilterChip
                                    label="📷 Avec photo"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, hasPhoto: false }))}
                                />
                            )}

                            {filters.hasBiographie && (
                                <FilterChip
                                    label="📄 Avec biographie"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, hasBiographie: false }))}
                                />
                            )}

                            {filters.hasCommentaire && (
                                <FilterChip
                                    label="💬 Avec commentaire"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, hasCommentaire: false }))}
                                />
                            )}

                            {filters.sortBy !== 'nom' && (
                                <FilterChip
                                    label={`🔄 Tri: ${filters.sortBy} (${filters.sortOrder === 'asc' ? 'croissant' : 'décroissant'})`}
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, sortBy: 'nom', sortOrder: 'asc' }))}
                                />
                            )}

                            {filters.sortOrder !== 'asc' && filters.sortBy === 'nom' && (
                                <FilterChip
                                    label="🔄 Ordre décroissant"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                                />
                            )}

                            {/* ✅ AJOUTER CES LIGNES MANQUANTES */}
                            {filters.favoritesOnly && (
                                <FilterChip
                                    label="❤️ Aimées uniquement"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, favoritesOnly: false }))}
                                />
                            )}

                            {filters.historyOnly && (
                                <FilterChip
                                    label="👁️ Vues uniquement"
                                    size="small"
                                    onDelete={() => setFilters(prev => ({ ...prev, historyOnly: false }))}
                                />
                            )}
                        </Box>
                    </Box>
                </Fade>
            )}
        </SearchContainer>
    );
};

export default ActriceSearchAndFilters;