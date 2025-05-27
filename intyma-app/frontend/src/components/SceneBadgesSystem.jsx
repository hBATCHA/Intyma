import React, { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// =================== ANIMATIONS (réutilisées) ===================

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
`;

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
`;

// =================== FONCTIONS UTILITAIRES POUR LES SCÈNES ===================

// ✅ MISE À JOUR : Calculer les stats favoris/historique d'une scène avec le nouveau système de comptage
export const calculateSceneStats = (scene, favorites, history) => {
    const isFavorite = favorites.some(fav => fav.scene_id === scene.id);

    // ✅ NOUVEAU : Trouver l'entrée d'historique pour cette scène
    const historyEntry = history.find(hist => hist.scene_id === scene.id);
    const isInHistory = !!historyEntry;

    // ✅ NOUVEAU : Utiliser nb_vues de l'historique ou compter les occurrences
    let viewCount = 0;
    if (historyEntry) {
        // Si nb_vues existe, l'utiliser, sinon compter les occurrences (fallback)
        viewCount = historyEntry.nb_vues || history.filter(hist => hist.scene_id === scene.id).length;
    }

    return {
        isFavorite,
        isInHistory,
        viewCount
    };
};

// ✅ MISE À JOUR : Générer les badges favoris/historique avec le nouveau système de comptage
export const generateSceneFavHistoryBadges = (scene, favorites, history) => {
    const stats = calculateSceneStats(scene, favorites, history);
    const badges = [];

    // ✅ MISE À JOUR : Nouveaux seuils et badges plus granulaires

    // 🏆 Badge LÉGENDE : En favoris ET vue 10+ fois
    if (stats.isFavorite && stats.viewCount >= 10) {
        badges.push({
            key: 'legend',
            variant: 'legend',
            label: `🏆 LÉGENDE ${stats.viewCount}x`,
            priority: 1,
            tooltip: `Scène légendaire ! En favoris et vue ${stats.viewCount} fois`
        });
    }
    // 🔥 Badge SUPER HIT : En favoris ET vue 5-9 fois
    else if (stats.isFavorite && stats.viewCount >= 5) {
        badges.push({
            key: 'super-hit',
            variant: 'super-hit',
            label: `🔥 HIT ${stats.viewCount}x`,
            priority: 2,
            tooltip: `En favoris et vue ${stats.viewCount} fois`
        });
    }
    // ⭐ Badge TOP FAVORITE : En favoris ET vue 1-4 fois
    else if (stats.isFavorite) {
        const label = stats.viewCount > 1 ? `❤️ FAV ${stats.viewCount}x` : `❤️ FAV`;
        badges.push({
            key: 'favorite',
            variant: 'favorite',
            label: label,
            priority: 3,
            tooltip: stats.viewCount > 1 ?
                `En favoris et vue ${stats.viewCount} fois` :
                'Scène favorite'
        });
    }

    // ✅ NOUVEAU : Badges pour les scènes très vues (mais pas en favoris)
    if (!stats.isFavorite && stats.viewCount >= 7) {
        badges.push({
            key: 'addiction',
            variant: 'addiction',
            label: `🎯 OBSESSION ${stats.viewCount}x`,
            priority: 4,
            tooltip: `Vue ${stats.viewCount} fois - Une vraie obsession !`
        });
    }
    // 🎬 Badge POPULAIRE : Vue 4-6 fois (mais pas en favoris)
    else if (!stats.isFavorite && stats.viewCount >= 4) {
        badges.push({
            key: 'popular',
            variant: 'popular',
            label: `🎬 POPULAIRE ${stats.viewCount}x`,
            priority: 5,
            tooltip: `Vue ${stats.viewCount} fois`
        });
    }
    // ✅ NOUVEAU : Badge REVISITÉE : Vue 2-3 fois
    else if (!stats.isFavorite && stats.viewCount >= 2) {
        badges.push({
            key: 'revisited',
            variant: 'revisited',
            label: `🔄 REVISITÉE ${stats.viewCount}x`,
            priority: 6,
            tooltip: `Vue ${stats.viewCount} fois`
        });
    }
    // 👁️ Badge VUE : Vue 1 fois seulement
    else if (stats.isInHistory && stats.viewCount === 1) {
        badges.push({
            key: 'viewed',
            variant: 'viewed',
            label: `👁️ VUE`,
            priority: 7,
            tooltip: 'Vue une fois'
        });
    }

    return badges.sort((a, b) => a.priority - b.priority);
};

// ✅ INCHANGÉ : Générer les badges de qualité pour une scène
export const generateSceneBadges = (scene, filters) => {
    const badges = [];

    // Badge note élevée
    const noteValue = parseFloat(scene.note_perso) || 0;
    if (noteValue >= 4.5) {
        badges.push({
            key: 'high-rated',
            variant: 'high-rated',
            label: `⭐ ${noteValue}`,
            priority: 1
        });
    }

    // Badge qualité premium
    if (scene.qualite && ['4K', 'Full HD'].includes(scene.qualite)) {
        badges.push({
            key: 'hq',
            variant: 'high-quality',
            label: scene.qualite === '4K' ? '🎯 4K' : '🎯 HD',
            priority: 2
        });
    }

    // Badge durée longue
    if (scene.duree && scene.duree >= 45) {
        badges.push({
            key: 'long-duration',
            variant: 'long-duration',
            label: `⏱️ ${scene.duree}min`,
            priority: 3
        });
    }

    // Badge récent (ajouté récemment)
    if (scene.date_ajout) {
        const dateAjout = new Date(scene.date_ajout);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (dateAjout > thirtyDaysAgo) {
            badges.push({
                key: 'recent',
                variant: 'recent',
                label: '🆕 NEW',
                priority: 4
            });
        }
    }

    // Badge actrice multiple
    if (scene.actrices && scene.actrices.length > 1) {
        badges.push({
            key: 'multi-actress',
            variant: 'multi-actress',
            label: `👥 ${scene.actrices.length}`,
            priority: 5
        });
    }

    return badges.sort((a, b) => a.priority - b.priority);
};

// ✅ INCHANGÉ : Générer les badges de tags pour une scène
export const generateSceneTagsBadges = (scene, filters) => {
    if (!scene.tags || !Array.isArray(scene.tags)) return [];

    const sceneTags = scene.tags.map(tag =>
        typeof tag === 'object' ? tag.nom : tag
    ).filter(Boolean);

    const filterTags = filters?.tags || [];

    return sceneTags.slice(0, 4).map(tag => ({
        key: `tag-${tag}`,
        label: tag,
        isMatching: filterTags.includes(tag)
    }));
};

// =================== STYLES POUR LES BADGES SCÈNES ===================

export const SceneFavHistoryBadge = styled(Chip)(({ variant = 'default' }) => {
    const getVariantStyle = () => {
        switch(variant) {
            case 'legend':
                return {
                    background: 'linear-gradient(135deg, #FFD700, #FF6B35, #8A2BE2, #FFD700)',
                    color: '#000',
                    fontWeight: 900,
                    animation: `${glowPulse} 1s infinite, ${floatAnimation} 2s ease-in-out infinite`,
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
                    border: '2px solid #FFD700',
                    transform: 'scale(1.1)', // ✅ NOUVEAU : Plus grand
                };
            case 'super-hit':
                return {
                    background: 'linear-gradient(135deg, #FF6B35, #FFD700, #FF1493)',
                    color: '#000',
                    fontWeight: 800,
                    animation: `${glowPulse} 1.5s infinite, ${floatAnimation} 3s ease-in-out infinite`,
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
                    border: '2px solid #FFD700',
                };
            case 'favorite':
                return {
                    background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: '#fff',
                    fontWeight: 700,
                    animation: `${glowPulse} 2s infinite`,
                    boxShadow: '0 0 12px rgba(255, 20, 147, 0.5)',
                };
            case 'addiction': // ✅ NOUVEAU
                return {
                    background: 'linear-gradient(135deg, #8A2BE2, #4B0082, #9400D3)',
                    color: '#fff',
                    fontWeight: 700,
                    animation: `${glowPulse} 2.5s infinite`,
                    boxShadow: '0 0 12px rgba(138, 43, 226, 0.6)',
                };
            case 'popular':
                return {
                    background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'revisited': // ✅ NOUVEAU
                return {
                    background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'viewed':
                return {
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: '#fff',
                    fontWeight: 500,
                };
            default:
                return {
                    background: 'rgba(26, 26, 26, 0.8)',
                    color: '#DAA520',
                    fontWeight: 500,
                };
        }
    };

    return {
        ...getVariantStyle(),
        fontSize: variant === 'legend' ? '0.75rem' : '0.7rem', // ✅ NOUVEAU : Police plus grande pour légende
        height: variant === 'legend' ? '26px' : '22px', // ✅ NOUVEAU : Plus haut pour légende
        borderRadius: variant === 'legend' ? '13px' : '11px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        '& .MuiChip-label': {
            padding: variant === 'legend' ? '0 10px' : '0 8px', // ✅ NOUVEAU : Plus de padding pour légende
        },
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: variant === 'legend' ? 'scale(1.15)' : 'scale(1.05)', // ✅ NOUVEAU : Effet hover différent
        }
    };
});

// ✅ INCHANGÉ : Reste du code identique
export const SceneInfoBadge = styled(Chip)(({ variant = 'default' }) => {
    const getVariantStyle = () => {
        switch(variant) {
            case 'high-rated':
                return {
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontWeight: 600,
                };
            case 'high-quality':
                return {
                    background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'long-duration':
                return {
                    background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'recent':
                return {
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'multi-actress':
                return {
                    background: 'linear-gradient(135deg, #E91E63, #AD1457)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'tag':
                return {
                    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                    color: '#F4D03F',
                    border: '1px solid rgba(218, 165, 32, 0.5)',
                    fontWeight: 600,
                };
            default:
                return {
                    background: 'rgba(26, 26, 26, 0.6)',
                    color: '#B8860B',
                    border: '1px solid rgba(218, 165, 32, 0.2)',
                    fontWeight: 500,
                };
        }
    };

    return {
        ...getVariantStyle(),
        fontSize: '0.7rem',
        height: '20px',
        borderRadius: '10px',
        backdropFilter: 'blur(4px)',
        '& .MuiChip-label': {
            padding: '0 6px',
        },
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.05)',
        }
    };
});

// ✅ INCHANGÉ : Conteneurs et composants tooltip
export const SceneBadgeContainer = styled(Box)({
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    maxWidth: '120px',
    justifyContent: 'flex-end',
});

export const SceneTagsBadgeContainer = styled(Box)({
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    right: '8px',
    zIndex: 10,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px',
    justifyContent: 'flex-start',
});

export const SceneBadgeWithTooltip = ({ badge, children }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Box
            sx={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}
            {showTooltip && badge.tooltip && (
                <Box sx={{
                    position: 'absolute',
                    top: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        border: '4px solid transparent',
                        borderTopColor: 'rgba(0, 0, 0, 0.9)',
                    }
                }}>
                    {badge.tooltip}
                </Box>
            )}
        </Box>
    );
};