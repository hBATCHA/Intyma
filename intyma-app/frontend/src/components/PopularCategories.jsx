import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Chip,
    Container,
    Fade,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    LocalOffer,
    Explore
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.6), 0 0 40px rgba(218, 165, 32, 0.3); }
`;

const sparkle = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
`;

// =================== STYLES ===================

const SectionContainer = styled(Container)(({ theme }) => ({
    padding: '40px 20px',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    maxWidth: 'none !important',
    width: '100vw',
    marginLeft: 'calc(-50vw + 50%)',
    marginRight: 'calc(-50vw + 50%)',
    overflow: 'hidden',

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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto 32px auto',
    padding: '0 20px',

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
    right: '20px',
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

const CategoriesWrapper = styled(Box)({
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '20px',
    padding: '0 20px',

    '@media (max-width: 600px)': {
        padding: '0 10px',
    }
});

const CategoriesContainer = styled(Box)({
    display: 'flex',
    transition: 'transform 0.5s ease-in-out',
    gap: '16px',
    padding: '20px 0',
    alignItems: 'center',
    width: 'fit-content',
});

const ScrollContainer = styled(Box)({
    display: 'flex',
    gap: '16px',
    flex: 1,
});

const CategoryBadge = styled(Chip, {
    shouldForwardProp: (prop) => !['isPopular', 'hasSparkle', 'sexyColors'].includes(prop)
})(({ isPopular, hasSparkle, sexyColors }) => ({
    ...(sexyColors || {}),
    borderRadius: '20px',
    padding: '4px 8px',
    height: '36px',
    fontSize: '0.85rem',
    fontWeight: isPopular ? 700 : 600,
    fontFamily: '"Inter", "Roboto", sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 'fit-content',
    backdropFilter: 'blur(10px)',

    ...(hasSparkle && {
        animation: `${sparkle} 2s infinite`,
    }),

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        transition: 'left 0.5s ease',
    },

    '&:hover': {
        transform: 'translateY(-3px) scale(1.05)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        filter: 'brightness(1.1) saturate(1.2)',
        animation: isPopular ? `${glow} 1.5s infinite` : 'none',

        '&::before': {
            left: '100%',
        }
    },

    '&:focus': {
        outline: '2px solid #DAA520',
        outlineOffset: '2px',
    },

    '& .MuiChip-label': {
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
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

const CategoriesControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    maxWidth: '1200px',
    margin: '0 auto 16px auto',
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

const CategoriesProgress = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#B8860B',
    fontSize: '0.9rem',
    fontWeight: 500
});

const SelectedCategoriesContainer = styled(Box)({
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
});

const SelectedTag = styled(Chip)({
    background: 'rgba(218, 165, 32, 0.2)',
    color: '#DAA520',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    fontSize: '0.8rem',
    height: '28px',

    '&:hover': {
        background: 'rgba(218, 165, 32, 0.3)',
        transform: 'scale(1.05)',
    },

    '& .MuiChip-deleteIcon': {
        color: '#DAA520',
        '&:hover': {
            color: '#fff',
        }
    }
});

const ClearAllButton = styled(Button)({
    background: 'transparent',
    color: '#FF6B35',
    border: '1px solid rgba(255, 107, 53, 0.3)',
    borderRadius: '12px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    textTransform: 'none',
    minWidth: 'auto',

    '&:hover': {
        background: 'rgba(255, 107, 53, 0.1)',
        borderColor: 'rgba(255, 107, 53, 0.5)',
    }
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    color: '#DAA520'
});

const ErrorContainer = styled(Box)({
    textAlign: 'center',
    padding: '40px 20px',
    color: '#FF6B6B'
});

// =================== COMPOSANT PRINCIPAL ===================

const PopularCategories = ({
                               apiBaseUrl = 'http://127.0.0.1:5000',
                               maxItems = 12,
                               onCategoryClick = () => {},
                               showItemCount = true,
                               enableMultiSelect = false,
                               className = ''
                           }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoplay, setAutoplay] = useState(true);
    const scrollRef = useRef(null);
    const autoplayRef = useRef(null);

    // =============== DATA FETCHING ===============

    useEffect(() => {
        fetchCategories();
    }, [apiBaseUrl]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            //console.log('🔍 Fetching tags from:', `${apiBaseUrl}/api/tags`);

            // Récupérer les tags ET les scènes en parallèle
            const [tagsResponse, scenesResponse] = await Promise.all([
                fetch(`${apiBaseUrl}/api/tags`),
                fetch(`${apiBaseUrl}/api/scenes`)
            ]);

            if (!tagsResponse.ok) {
                throw new Error(`Erreur tags: ${tagsResponse.status}`);
            }
            if (!scenesResponse.ok) {
                throw new Error(`Erreur scènes: ${scenesResponse.status}`);
            }

            const tagsData = await tagsResponse.json();
            const scenesData = await scenesResponse.json();

            //console.log('📊 Tags récupérés:', tagsData.length);
            //console.log('🎬 Scènes récupérées:', scenesData.length);

            // Compter les vraies occurrences de chaque tag dans les scènes
            const tagCounts = {};

            scenesData.forEach(scene => {
                if (scene.tags && Array.isArray(scene.tags)) {
                    scene.tags.forEach(sceneTag => {
                        const tagName = sceneTag.nom || sceneTag.name || sceneTag;
                        if (tagName) {
                            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                        }
                    });
                }
            });

            //console.log('📈 Compteurs de tags:', tagCounts);

            // Créer les catégories avec les vrais compteurs
            let processedCategories = [];

            if (Array.isArray(tagsData)) {
                processedCategories = tagsData
                    .map((tag, index) => {
                        const tagName = tag.nom || tag.name || tag;
                        const count = tagCounts[tagName] || 0;

                        return {
                            id: `category-${tag.id || index}-${tagName.replace(/[^a-zA-Z0-9]/g, '')}`, // ID vraiment unique
                            name: tagName,
                            count: count,
                            isPopular: false, // Sera défini après le tri
                            hasSparkle: false // Sera défini après le tri
                        };
                    })
                    .filter(cat => cat.count > 0) // Garder seulement les tags utilisés
                    .sort((a, b) => b.count - a.count); // Trier par popularité

                // Assigner les statuts après le tri
                processedCategories = processedCategories.map((cat, index) => ({
                    ...cat,
                    isPopular: index < 3,
                    hasSparkle: index === 0
                }));

                //console.log('✅ Catégories traitées:', processedCategories.slice(0, 8).map(c => `${c.name} (${c.count})`));
            }

            // Limiter le nombre d'items
            processedCategories = processedCategories.slice(0, maxItems);

            setCategories(processedCategories);

        } catch (error) {
            console.error('Error fetching categories:', error);
            setError(error.message);

            // Données de fallback réalistes
            setCategories([
                { id: 'fallback-1', name: 'brunette', count: 12, isPopular: true, hasSparkle: true },
                { id: 'fallback-2', name: 'milfs', count: 8, isPopular: true, hasSparkle: false },
                { id: 'fallback-3', name: 'missionnaire', count: 6, isPopular: true, hasSparkle: false },
                { id: 'fallback-4', name: 'spanking', count: 4, isPopular: false, hasSparkle: false },
                { id: 'fallback-5', name: 'insertion', count: 3, isPopular: false, hasSparkle: false },
                { id: 'fallback-6', name: 'masturbation', count: 2, isPopular: false, hasSparkle: false },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // =============== CATEGORY ICONS ===============

    const getCategoryIcon = (category) => {
        const categoryLower = category.toLowerCase();

        if (categoryLower.includes('hot') || categoryLower.includes('trending')) return '🔥';
        if (categoryLower.includes('star') || categoryLower.includes('top')) return '⭐';
        if (categoryLower.includes('favorite') || categoryLower.includes('love')) return '❤️';
        if (categoryLower.includes('popular') || categoryLower.includes('view')) return '👁️';
        if (categoryLower.includes('movie') || categoryLower.includes('scene')) return '🎬';
        if (categoryLower.includes('photo') || categoryLower.includes('pic')) return '📸';
        if (categoryLower.includes('art') || categoryLower.includes('creative')) return '🎨';
        if (categoryLower.includes('premium') || categoryLower.includes('exclusive')) return '💎';
        if (categoryLower.includes('new') || categoryLower.includes('recent')) return '🆕';
        if (categoryLower.includes('elegant') || categoryLower.includes('classy')) return '✨';

        return '🏷️';
    };

    // =============== AUTOPLAY ===============

    useEffect(() => {
        if (autoplay && categories.length > 6) {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    const maxIndex = Math.max(0, categories.length - 6);
                    return prev >= maxIndex ? 0 : prev + 1;
                });
            }, 3000); // Défile toutes les 3 secondes
        }

        return () => {
            if (autoplayRef.current) {
                clearInterval(autoplayRef.current);
            }
        };
    }, [autoplay, categories.length]);

    // =============== COULEURS SEXY POUR LES BADGES ===============

    const getSexyColors = (index, isPopular, isSelected) => {
        if (isSelected) {
            return {
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF8C42 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 107, 53, 0.5)',
            };
        }

        if (isPopular) {
            const popularColors = [
                {
                    background: 'linear-gradient(135deg, #DAA520 0%, #FFD700 50%, #B8860B 100%)',
                    color: '#000',
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                },
                {
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF1493 50%, #C71585 100%)',
                    color: '#fff',
                    border: '1px solid rgba(255, 107, 157, 0.5)',
                },
                {
                    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 50%, #673AB7 100%)',
                    color: '#fff',
                    border: '1px solid rgba(156, 39, 176, 0.5)',
                }
            ];
            return popularColors[index % popularColors.length];
        }

        // Couleurs sexy pour les badges normaux
        const sexyColors = [
            {
                background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 87, 34, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
                color: '#fff',
                border: '1px solid rgba(63, 81, 181, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                color: '#fff',
                border: '1px solid rgba(76, 175, 80, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #E91E63 0%, #FF5722 100%)',
                color: '#fff',
                border: '1px solid rgba(233, 30, 99, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                color: '#fff',
                border: '1px solid rgba(156, 39, 176, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                color: '#000',
                border: '1px solid rgba(255, 152, 0, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
                color: '#fff',
                border: '1px solid rgba(0, 188, 212, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #795548 0%, #8D6E63 100%)',
                color: '#fff',
                border: '1px solid rgba(121, 85, 72, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                color: '#fff',
                border: '1px solid rgba(96, 125, 139, 0.4)',
            },
            {
                background: 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
                color: '#fff',
                border: '1px solid rgba(244, 67, 54, 0.4)',
            }
        ];

        return sexyColors[index % sexyColors.length];
    };

    // =============== EVENT HANDLERS ===============

    const handleCategoryClick = (category) => {
        if (enableMultiSelect) {
            setSelectedCategories(prev => {
                const isSelected = prev.some(cat => cat.id === category.id);
                if (isSelected) {
                    return prev.filter(cat => cat.id !== category.id);
                } else {
                    return [...prev, category];
                }
            });
        } else {
            setSelectedCategories([category]);
        }

        onCategoryClick(category, enableMultiSelect ? selectedCategories : [category]);
    };

    const handleSeeAllClick = () => {
        onCategoryClick(null, selectedCategories);
    };

    const scrollLeft = () => {
        setAutoplay(false);
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, categories.length - 6);
            return prev > 0 ? prev - 1 : maxIndex;
        });
        setTimeout(() => setAutoplay(true), 5000);
    };

    const scrollRight = () => {
        setAutoplay(false);
        setCurrentIndex(prev => {
            const maxIndex = Math.max(0, categories.length - 6);
            return prev < maxIndex ? prev + 1 : 0;
        });
        setTimeout(() => setAutoplay(true), 5000);
    };

    // =============== LOADING STATE ===============

    if (loading) {
        return (
            <SectionContainer className={className}>
                <SectionHeader>
                    <SectionTitle>🌈 Catégories Populaires</SectionTitle>
                </SectionHeader>
                <LoadingContainer>
                    <CircularProgress size={60} sx={{ color: '#DAA520' }} />
                    <Typography sx={{ ml: 2, color: '#DAA520' }}>
                        Chargement des catégories...
                    </Typography>
                </LoadingContainer>
            </SectionContainer>
        );
    }

    // =============== ERROR STATE ===============

    if (error && categories.length === 0) {
        return (
            <SectionContainer className={className}>
                <SectionHeader>
                    <SectionTitle>🌈 Catégories Populaires</SectionTitle>
                </SectionHeader>
                <ErrorContainer>
                    <Alert severity="error" sx={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                        Catégories temporairement indisponibles
                    </Alert>
                    <Button
                        onClick={fetchCategories}
                        sx={{ mt: 2, color: '#DAA520' }}
                        startIcon={<Explore />}
                    >
                        Réessayer
                    </Button>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    // =============== EMPTY STATE ===============

    if (categories.length === 0) {
        return (
            <SectionContainer className={className}>
                <SectionHeader>
                    <SectionTitle>🌈 Catégories Populaires</SectionTitle>
                </SectionHeader>
                <ErrorContainer>
                    <Typography variant="h6" sx={{ color: '#B8860B', fontStyle: 'italic' }}>
                        Aucune catégorie trouvée
                    </Typography>
                </ErrorContainer>
            </SectionContainer>
        );
    }

    // Calculer les données pour les contrôles
    const visibleCount = 6;
    const maxIndex = Math.max(0, categories.length - visibleCount);

    // =============== MAIN RENDER ===============

    return (
        <SectionContainer className={className}>
            <Fade in={true} timeout={1000}>
                <div>
                    <SectionHeader>
                        <SectionTitle>🌈 Catégories Populaires</SectionTitle>
                        <SeeAllButton
                            endIcon={<Explore />}
                            onClick={handleSeeAllClick}
                        >
                            Tout Voir
                        </SeeAllButton>
                    </SectionHeader>

                    {/* Contrôles en haut */}
                    {categories.length > visibleCount && (
                        <CategoriesControls>
                            <CategoriesProgress>
                                {currentIndex + 1} - {Math.min(currentIndex + visibleCount, categories.length)} sur {categories.length}
                            </CategoriesProgress>

                            <NavButtonsGroup>
                                <TopNavButton onClick={scrollLeft} disabled={currentIndex === 0}>
                                    <ChevronLeft />
                                </TopNavButton>
                                <TopNavButton
                                    onClick={scrollRight}
                                    disabled={currentIndex >= maxIndex}
                                >
                                    <ChevronRight />
                                </TopNavButton>
                            </NavButtonsGroup>
                        </CategoriesControls>
                    )}

                    <CategoriesWrapper>
                        <CategoriesContainer
                            ref={scrollRef}
                            sx={{
                                transform: `translateX(-${currentIndex * 180}px)`
                            }}
                        >
                            <ScrollContainer>
                                {categories.map((category, index) => {
                                    const isSelected = selectedCategories.some(cat => cat.id === category.id);
                                    const uniqueKey = `cat-${index}-${category.id}`;
                                    const sexyColors = getSexyColors(index, category.isPopular, isSelected);

                                    return (
                                        <CategoryBadge
                                            key={uniqueKey}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span>{getCategoryIcon(category.name)}</span>
                                                    <span>{category.name}</span>
                                                    {showItemCount && (
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                opacity: 0.9,
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            ({category.count})
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            onClick={() => handleCategoryClick(category)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleCategoryClick(category);
                                                }
                                            }}
                                            isPopular={category.isPopular || isSelected}
                                            hasSparkle={category.hasSparkle && !isSelected}
                                            sexyColors={sexyColors}
                                            tabIndex={0}
                                            aria-label={`Filtrer par catégorie ${category.name}${showItemCount ? `, ${category.count} éléments` : ''}`}
                                            sx={{
                                                minWidth: '160px',
                                            }}
                                        />
                                    );
                                })}
                            </ScrollContainer>
                        </CategoriesContainer>
                    </CategoriesWrapper>

                    {enableMultiSelect && selectedCategories.length > 0 && (
                        <SelectedCategoriesContainer>
                            <Typography variant="body2" sx={{ color: '#B8860B', fontWeight: 600 }}>
                                Sélectionnées :
                            </Typography>
                            {selectedCategories.map((cat, index) => (
                                <SelectedTag
                                    key={`selected-${index}-${cat.id}`}
                                    label={cat.name}
                                    size="small"
                                    onDelete={() => handleCategoryClick(cat)}
                                />
                            ))}
                            <ClearAllButton
                                onClick={() => setSelectedCategories([])}
                            >
                                Tout Effacer
                            </ClearAllButton>
                        </SelectedCategoriesContainer>
                    )}
                </div>
            </Fade>
        </SectionContainer>
    );
};

export default PopularCategories;