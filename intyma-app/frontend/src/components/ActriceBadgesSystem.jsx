import React, { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// =================== ANIMATIONS ===================

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
`;

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
`;

// =================== FONCTIONS UTILITAIRES POUR LES STATS ===================

// Calculer les stats favoris/historique d'une actrice
export const calculateActriceStats = (actrice, scenes, favorites, history) => {
    // Trouver toutes les scènes de cette actrice
    const actriceScenes = scenes.filter(scene =>
        scene.actrices && scene.actrices.some(a => a.id === actrice.id)
    );

    // Compter les scènes en favoris
    const scenesInFavorites = actriceScenes.filter(scene =>
        favorites.some(fav => fav.scene_id === scene.id)
    );

    // Compter les scènes dans l'historique
    const scenesInHistory = actriceScenes.filter(scene =>
        history.some(hist => hist.scene_id === scene.id)
    );

    return {
        totalScenes: actriceScenes.length,
        favoritesCount: scenesInFavorites.length,
        historyCount: scenesInHistory.length,
        favoritesPercentage: actriceScenes.length > 0 ? (scenesInFavorites.length / actriceScenes.length) * 100 : 0,
        historyPercentage: actriceScenes.length > 0 ? (scenesInHistory.length / actriceScenes.length) * 100 : 0
    };
};

export const calculateActriceViewStats = (actrice, scenes, history) => {
    // Récupérer toutes les scènes de cette actrice
    const actriceScenes = scenes.filter(scene =>
        scene.actrices && scene.actrices.some(sceneActrice => sceneActrice.id === actrice.id)
    );

    let totalViews = 0;
    let viewedScenesCount = 0;
    let maxViews = 0;
    let favoriteScenesViewed = 0;

    actriceScenes.forEach(scene => {
        // Trouver l'entrée d'historique pour cette scène
        const historyEntry = history.find(hist => hist.scene_id === scene.id);
        const viewCount = historyEntry ? (historyEntry.nb_vues || 1) : 0;

        if (viewCount > 0) {
            totalViews += viewCount;
            viewedScenesCount++;
            maxViews = Math.max(maxViews, viewCount);
        }
    });

    return {
        totalViews,
        viewedScenesCount,
        totalScenes: actriceScenes.length,
        maxViews,
        averageViews: viewedScenesCount > 0 ? Math.round(totalViews / viewedScenesCount * 10) / 10 : 0,
        viewRate: actriceScenes.length > 0 ? Math.round((viewedScenesCount / actriceScenes.length) * 100) : 0
    };
};

// Générer les badges favoris/historique pour une actrice
export const generateActriceFavHistoryBadges = (actrice, scenes, favorites, history) => {
    const stats = calculateActriceStats(actrice, scenes, favorites, history);
    const viewStats = calculateActriceViewStats(actrice, scenes, history);
    const badges = [];

    // 👑 Badge DÉESSE : Actrice ultra-populaire (beaucoup de favoris ET de vues)
    if (stats.favoritesCount >= 3 && viewStats.totalViews >= 20) {
        badges.push({
            key: 'goddess',
            variant: 'goddess',
            label: `👑 DÉESSE ${viewStats.totalViews}v`,
            priority: 1,
            tooltip: `${stats.favoritesCount} favoris, ${viewStats.totalViews} vues totales`
        });
    }
    // 🔥 Badge OBSESSION : Actrice très regardée
    else if (viewStats.totalViews >= 15 || viewStats.maxViews >= 7) {
        badges.push({
            key: 'obsession',
            variant: 'obsession',
            label: `🔥 OBSESSION ${viewStats.totalViews}v`,
            priority: 2,
            tooltip: `${viewStats.totalViews} vues totales (max ${viewStats.maxViews} sur une scène)`
        });
    }
    // ⭐ Badge STAR : Plusieurs favoris
    else if (stats.favoritesCount >= 2) {
        badges.push({
            key: 'star',
            variant: 'star',
            label: `⭐ STAR ${stats.favoritesCount}★`,
            priority: 3,
            tooltip: `${stats.favoritesCount} scènes en favoris`
        });
    }
    // ❤️ Badge FAVORITE : Au moins un favori
    else if (stats.favoritesCount >= 1) {
        badges.push({
            key: 'favorite',
            variant: 'favorite',
            label: `❤️ FAV`,
            priority: 4,
            tooltip: `${stats.favoritesCount} scène en favoris`
        });
    }

    // 🎬 Badge POPULAIRE : Beaucoup de scènes vues (mais pas de favoris)
    if (stats.favoritesCount === 0 && viewStats.viewedScenesCount >= 3) {
        badges.push({
            key: 'popular',
            variant: 'popular',
            label: `🎬 POPULAIRE ${viewStats.viewedScenesCount}/${viewStats.totalScenes}`,
            priority: 5,
            tooltip: `${viewStats.viewedScenesCount} scènes vues sur ${viewStats.totalScenes}`
        });
    }
    // 👁️ Badge VUE : Quelques scènes vues
    else if (stats.favoritesCount === 0 && viewStats.viewedScenesCount > 0) {
        badges.push({
            key: 'viewed',
            variant: 'viewed',
            label: `👁️ VUE ${viewStats.viewedScenesCount}x`,
            priority: 6,
            tooltip: `${viewStats.viewedScenesCount} scène(s) vue(s)`
        });
    }

    // ✅ NOUVEAU : Badge RÉGULARITÉ si l'actrice a un bon taux de visionnage
    if (viewStats.viewRate >= 80 && viewStats.totalScenes >= 3) {
        badges.push({
            key: 'consistent',
            variant: 'consistent',
            label: `🎯 RÉGULIÈRE ${viewStats.viewRate}%`,
            priority: 7,
            tooltip: `${viewStats.viewRate}% de ses scènes vues (${viewStats.viewedScenesCount}/${viewStats.totalScenes})`
        });
    }

    return badges.sort((a, b) => a.priority - b.priority);
};

// Générer les badges de qualité généraux pour une actrice
export const generateActriceBadges = (actrice, filters, scenes) => {
    const badges = [];

    // Badge note élevée
    if (actrice.note_moyenne && actrice.note_moyenne >= 4.5) {
        badges.push({
            key: 'high-rated',
            variant: 'high-rated',
            label: `⭐ ${actrice.note_moyenne}`,
            priority: 1
        });
    }

    // Badge beaucoup de scènes
    const sceneCount = scenes.filter(scene =>
        scene.actrices && scene.actrices.some(a => a.id === actrice.id)
    ).length;

    if (sceneCount >= 10) {
        badges.push({
            key: 'prolific',
            variant: 'prolific',
            label: `🎬 ${sceneCount}`,
            priority: 2
        });
    }

    // Badge actrice récente (dernière vue récente)
    if (actrice.derniere_vue) {
        const lastSeen = new Date(actrice.derniere_vue);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastSeen > thirtyDaysAgo) {
            badges.push({
                key: 'recent',
                variant: 'recent',
                label: '🆕 RÉCENT',
                priority: 3
            });
        }
    }

    return badges.sort((a, b) => a.priority - b.priority);
};

// Générer les badges de tags pour une actrice
export const generateTagsBadges = (actrice, filters) => {
    if (!actrice.tags_typiques) return [];

    const actriceTags = actrice.tags_typiques.split(',').map(tag => tag.trim());
    const filterTags = filters?.tagsTypiques || [];

    return actriceTags.slice(0, 4).map(tag => ({
        key: `tag-${tag}`,
        label: tag,
        isMatching: filterTags.includes(tag)
    }));
};

// =================== STYLES POUR LES BADGES ===================

export const FavHistoryBadge = styled(Chip)(({ variant = 'default' }) => {
    const getVariantStyle = () => {
        switch(variant) {
            case 'goddess': // ✅ NOUVEAU
                return {
                    background: 'linear-gradient(135deg, #FFD700, #FF1493, #8A2BE2, #FFD700)',
                    color: '#000',
                    fontWeight: 900,
                    animation: `${glowPulse} 0.8s infinite, ${floatAnimation} 2s ease-in-out infinite`,
                    boxShadow: '0 0 25px rgba(255, 215, 0, 0.9)',
                    border: '2px solid #FFD700',
                    transform: 'scale(1.15)',
                };
            case 'obsession': // ✅ NOUVEAU
                return {
                    background: 'linear-gradient(135deg, #8A2BE2, #FF1493, #4B0082)',
                    color: '#fff',
                    fontWeight: 800,
                    animation: `${glowPulse} 1.5s infinite`,
                    boxShadow: '0 0 15px rgba(138, 43, 226, 0.7)',
                };
            case 'star':
                return {
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontWeight: 700,
                    animation: `${glowPulse} 2s infinite`,
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
                };
            case 'favorite':
                return {
                    background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'popular':
                return {
                    background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'viewed':
                return {
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    color: '#fff',
                    fontWeight: 500,
                };
            case 'consistent': // ✅ NOUVEAU
                return {
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    color: '#fff',
                    fontWeight: 600,
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
        fontSize: variant === 'goddess' ? '0.75rem' : '0.7rem',
        height: variant === 'goddess' ? '26px' : '22px',
        borderRadius: variant === 'goddess' ? '13px' : '11px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        '& .MuiChip-label': {
            padding: variant === 'goddess' ? '0 10px' : '0 8px',
        },
        cursor: 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: variant === 'goddess' ? 'scale(1.2)' : 'scale(1.05)',
        }
    };
});

export const InfoBadge = styled(Chip)(({ variant = 'default' }) => {
    const getVariantStyle = () => {
        switch(variant) {
            case 'high-rated':
                return {
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontWeight: 600,
                };
            case 'prolific':
                return {
                    background: 'linear-gradient(135deg, #9C27B0, #673AB7)',
                    color: '#fff',
                    fontWeight: 600,
                };
            case 'recent':
                return {
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
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

// =================== CONTENEURS POUR LES BADGES ===================

export const BadgeContainer = styled(Box)({
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

export const TagsBadgeContainer = styled(Box)({
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

// =================== COMPOSANT TOOLTIP POUR LES BADGES ===================

export const BadgeWithTooltip = ({ badge, children }) => {
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