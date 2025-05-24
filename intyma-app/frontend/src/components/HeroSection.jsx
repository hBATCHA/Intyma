import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Fade,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { PlayArrow, Explore } from '@mui/icons-material';
import axios from 'axios';

// Fonction pour styliser le titre avec "Intyma" en couleur différente
const formatTitle = (title) => {
    if (title.includes('Intyma')) {
        const parts = title.split('Intyma');
        return (
            <>
                {parts[0]}
                <span className="intyma-highlight">Intyma</span>
                {parts[1]}
            </>
        );
    }
    return title;
};

// =================== DONNÉES DES PHRASES PROVOCATRICES ===================

const sexyPhrases = [
    // Sensuel & provocateur
    {
        text: "Bienvenue dans ton club privé… Ici, tes fantasmes prennent vie.",
        intensity: "medium",
        replacements: [
            { word: "club privé", alternatives: ["antre secret", "univers intime", "espace réservé", "paradis discret"] },
            { word: "fantasmes", alternatives: ["désirs", "envies", "pulsions", "obsessions"] }
        ]
    },
    {
        text: "Plonge dans le regard de ta MILF favorite… Elle n’attend que toi.",
        intensity: "hot",
        replacements: [
            { word: "regard", alternatives: ["corps", "sourire", "silhouette", "courbes"] },
            { word: "MILF", alternatives: ["bombe", "femme fatale", "star", "déesse"] }
        ]
    },
    {
        text: "Ambiance tamisée, lumière cuivrée… Laisse-toi guider par tes envies.",
        intensity: "medium",
        replacements: [
            { word: "lumière cuivrée", alternatives: ["ombre luxueuse", "halo sensuel", "chaleur rouge", "nuit dorée"] }
        ]
    },
    {
        text: "Savoure chaque mouvement, chaque gémissement… prends ton temps.",
        intensity: "hot",
        replacements: [
            { word: "mouvement", alternatives: ["caresse", "regard", "baiser", "frottement"] },
            { word: "gémissement", alternatives: ["soupir", "plaisir", "halètement", "frisson"] }
        ]
    },
    {
        text: "Sélectionne, regarde, fantasme… tout reste entre nous.",
        intensity: "medium",
        replacements: [
            { word: "regarde", alternatives: ["découvre", "adore", "mate", "savoure"] }
        ]
    },
    {
        text: "Les MILF te font de l’œil, prêtes à t’envoûter… Tu vas craquer.",
        intensity: "hot",
        replacements: [
            { word: "MILF", alternatives: ["coquines", "déesse", "belles", "bombes"] }
        ]
    },

    // Hard, cru, dominant
    {
        text: "Mate ces MILF qui adorent se faire démonter le cul, c’est ton terrain de jeu.",
        intensity: "intense",
        replacements: [
            { word: "MILF", alternatives: ["bombe", "coquine", "salope", "pouffiasse"] },
            { word: "cul", alternatives: ["trou", "fesse", "chattoune", "gorge profonde"] }
        ]
    },
    {
        text: "Envie de baiser des chattes mouillées ? Clique, bande, défonce tout avec ta main.",
        intensity: "hot",
        replacements: [
            { word: "chattes", alternatives: ["minous", "fentes", "moufles", "petites foufounes"] },
            { word: "défonce", alternatives: ["pénètre", "bourre", "explose", "massacre"] }
        ]
    },
    {
        text: "Ce soir, c’est pipes profondes, levrettes sauvages, et éjac bien sale.",
        intensity: "intense",
        replacements: [
            { word: "pipes", alternatives: ["fellations", "sucettes", "gorges profondes", "sucements"] },
            { word: "levrettes", alternatives: ["doggystyles", "prises à quatre pattes", "sodomies", "baises bestiales"] },
            { word: "éjac", alternatives: ["foutre", "sperme", "giclée", "crème"] }
        ]
    },
    {
        text: "Des MILF prêtes à tout pour recevoir ta giclée en pleine bouche.",
        intensity: "intense",
        replacements: [
            { word: "MILF", alternatives: ["salope", "putain", "bombe", "femme mûre"] },
            { word: "bouche", alternatives: ["visage", "seins", "fesses", "langue"] }
        ]
    },
    {
        text: "Branle-toi sur des partouzes, gangbangs, sodomie XXL, et orgasmes bruyants.",
        intensity: "hot",
        replacements: [
            { word: "partouzes", alternatives: ["orgies", "trios", "gangbangs", "soirées privées"] },
            { word: "sodomie", alternatives: ["anal", "enculade", "prise profonde", "DP"] }
        ]
    },
    {
        text: "Fais-toi kiffer devant des pipes qui arrachent, des culs ouverts, des seins qui prennent cher.",
        intensity: "intense",
        replacements: [
            { word: "pipes", alternatives: ["fellations", "gorges profondes", "sucements", "branlettes espagnoles"] },
            { word: "culs", alternatives: ["fesses", "anus", "chattes", "orifices"] },
            { word: "seins", alternatives: ["nichons", "lolos", "poitrines", "pare-chocs"] }
        ]
    },
    {
        text: "Ici, c’est toi le patron : mate, bande, jouis, recommence autant que tu veux.",
        intensity: "hot",
        replacements: [
            { word: "patron", alternatives: ["roi", "mâle dominant", "chef de la branlette", "boss"] }
        ]
    },
    {
        text: "Aucune censure : MILF humides, facials dégoulinants, double péné explosive.",
        intensity: "intense",
        replacements: [
            { word: "MILF", alternatives: ["bombasses", "bitches", "stars", "putes"] },
            { word: "facials", alternatives: ["éjac sur le visage", "arrosages", "sperme partout", "giclées"] }
        ]
    },
    {
        text: "Mate-la s’ouvrir grand pour se faire remplir jusqu’au bout.",
        intensity: "intense",
        replacements: [
            { word: "s’ouvrir", alternatives: ["se dilater", "s’écarter", "s’offrir", "s’étirer"] },
            { word: "remplir", alternatives: ["arroser", "inonder", "bourrer", "déborder"] }
        ]
    },

    // Sexy chic & exclusif
    {
        text: "Chut… Ici, tout est secret. Personne ne saura ce que tu regardes.",
        intensity: "medium",
        replacements: [
            { word: "secret", alternatives: ["confidentiel", "intime", "réservé", "discret"] }
        ]
    },
    {
        text: "Laisse monter le désir, savoure la montée, perds-toi dans la luxure.",
        intensity: "hot",
        replacements: [
            { word: "désir", alternatives: ["tension", "excitation", "envie", "plaisir"] },
            { word: "luxure", alternatives: ["volupté", "folie", "débauche", "obsession"] }
        ]
    },
    {
        text: "Plus c’est cru, plus c’est bon. Ici, tout est permis.",
        intensity: "intense",
        replacements: [
            { word: "cru", alternatives: ["hard", "bestial", "brut", "explosif"] }
        ]
    },
    {
        text: "Tes fantasmes, ton club privé, ta branlette du siècle.",
        intensity: "medium",
        replacements: [
            { word: "club privé", alternatives: ["paradis du porno", "VIP du plaisir", "salon secret", "chambre forte"] }
        ]
    },
    {
        text: "Mate-les sucer, se faire baiser, jouir, gémir — et viens fort.",
        intensity: "hot",
        replacements: [
            { word: "sucer", alternatives: ["avaler", "branler", "lécher", "mordre"] },
            { word: "baiser", alternatives: ["démonter", "prendre", "exploser", "percer"] }
        ]
    },
    {
        text: "Ton foutre, leurs gueules, ton plaisir, leur récompense.",
        intensity: "intense",
        replacements: [
            { word: "foutre", alternatives: ["sperme", "jus", "crème", "semence"] },
            { word: "gueules", alternatives: ["bouches", "visages", "seins", "chattes"] }
        ]
    },
    {
        text: "Approche, mate ses courbes, imagine ta main sur ses fesses.",
        intensity: "hot",
        replacements: [
            { word: "courbes", alternatives: ["seins", "fesses", "hanche", "taille"] },
            { word: "main", alternatives: ["langue", "queue", "regard", "souffle"] }
        ]
    },
    {
        text: "Tes vidéos, tes règles : fais-lui tout ce que tu veux, sans aucun tabou.",
        intensity: "intense",
        replacements: [
            { word: "vidéos", alternatives: ["scènes", "MILF", "bitches", "collections"] },
            { word: "tabou", alternatives: ["limite", "interdit", "barrière", "filtre"] }
        ]
    },
    {
        text: "Ferme la porte, baisse ton froc, laisse-toi aller devant ta MILF favorite.",
        intensity: "intense",
        replacements: [
            { word: "MILF", alternatives: ["star", "bombasse", "femme mûre", "chienne"] }
        ]
    },
    {
        text: "Chuchote-lui à l’oreille ce que tu veux lui faire… ou crie-le devant l’écran.",
        intensity: "hot",
        replacements: [
            { word: "Chuchote-lui", alternatives: ["Murmure-lui", "Avoue-lui", "Hurle-lui", "Susurre-lui"] },
            { word: "l’oreille", alternatives: ["la bouche", "le cul", "le sein", "le cou"] }
        ]
    },
    {
        text: "Laisse-toi envoûter par son regard, puis retourne-la et prends-la à ton rythme.",
        intensity: "hot",
        replacements: [
            { word: "envoûter", alternatives: ["séduire", "allumer", "captiver", "chauffer"] },
            { word: "retourne-la", alternatives: ["domine-la", "prends-la", "fais-la gémir", "baise-la"] }
        ]
    },
    {
        text: "Fais glisser sa culotte, savoure le spectacle, explose sans complexe.",
        intensity: "intense",
        replacements: [
            { word: "culotte", alternatives: ["string", "dentelle", "tanga", "shorty"] },
            { word: "spectacle", alternatives: ["show", "danse", "corps", "exhibition"] }
        ]
    },
    {
        text: "Mate-la twerker, laisse-toi emporter et vise où tu veux finir.",
        intensity: "hot",
        replacements: [
            { word: "twerker", alternatives: ["s’exhiber", "danser", "mouvements de hanches", "se cambrer"] },
            { word: "finir", alternatives: ["gicler", "exploser", "décharger", "arroser"] }
        ]
    },
    {
        text: "Rêve de la sentir mouillée, chaude, offerte rien que pour toi.",
        intensity: "hot",
        replacements: [
            { word: "mouillée", alternatives: ["trempée", "lubrifiée", "glissante", "ouverte"] },
            { word: "offerte", alternatives: ["abandonnée", "soumise", "excitée", "prête"] }
        ]
    },
    {
        text: "Mate-les gémir, s’ouvrir, supplier d’en prendre encore.",
        intensity: "intense",
        replacements: [
            { word: "gémir", alternatives: ["hurler", "crier", "haleter", "supplie"] },
            { word: "s’ouvrir", alternatives: ["se livrer", "s’écarter", "se dilater", "se donner"] }
        ]
    },
    {
        text: "Savoure ce moment, prends ton temps, éclate-toi sans jamais regarder l’heure.",
        intensity: "medium",
        replacements: [
            { word: "moment", alternatives: ["soirée", "nuit", "session", "voyage"] },
            { word: "éclate-toi", alternatives: ["kiffe", "défonce-toi", "régale-toi", "jouis"] }
        ]
    },
    {
        text: "Regarde-moi cette salope qui suce comme une reine… Toi aussi, tu rêves de gicler dans sa bouche.",
        intensity: "intense",
        replacements: [
            { word: "salope", alternatives: ["MILF", "chienne", "bombe", "pute"] },
            { word: "reine", alternatives: ["pro", "experte", "dépravée", "déesse"] },
            { word: "bouche", alternatives: ["gorge", "visage", "seins", "langue"] }
        ]
    },
    {
        text: "Allez, branle-toi fort… mate-la s’exploser la chatte rien que pour toi.",
        intensity: "intense",
        replacements: [
            { word: "branle-toi", alternatives: ["défonce-toi", "régale-toi", "caresse-toi", "masturbe-toi"] },
            { word: "chatte", alternatives: ["minou", "fente", "foufoune", "petite chatte"] }
        ]
    },
    {
        text: "Parle-lui sale, imagine-la supplier pour ton sperme… Ici, tout est permis.",
        intensity: "intense",
        replacements: [
            { word: "Parle-lui sale", alternatives: ["Donne-lui des ordres", "Traite-la de salope", "Fais-la mouiller", "Fais-la crier"] },
            { word: "sperme", alternatives: ["foutre", "jus", "crème", "semence"] }
        ]
    },
    {
        text: "Jouis sur son visage, mate-la lécher chaque goutte, elle en redemande.",
        intensity: "intense",
        replacements: [
            { word: "visage", alternatives: ["langue", "seins", "fesses", "ventre"] },
            { word: "lécher", alternatives: ["avaler", "déguster", "gober", "ramasser"] }
        ]
    },
    {
        text: "Fais-la crier ton nom, remplis-la de foutre, et recommence encore.",
        intensity: "intense",
        replacements: [
            { word: "foutre", alternatives: ["sperme", "crème", "semence", "giclée"] }
        ]
    },
    {
        text: "Montre-lui qui commande, tire ses cheveux, explose-la comme tu aimes.",
        intensity: "intense",
        replacements: [
            { word: "commande", alternatives: ["domine", "mènes le jeu", "fais la loi", "impose-toi"] },
            { word: "explose-la", alternatives: ["défonce-la", "prends-la", "baise-la fort", "retourne-la"] }
        ]
    },
    {
        text: "Imagine-la à genoux, prête à tout avaler, le regard suppliant.",
        intensity: "hot",
        replacements: [
            { word: "à genoux", alternatives: ["soumise", "ouverte", "profonde", "éclatante"] },
            { word: "avaler", alternatives: ["prendre", "sucer", "gober", "déguster"] }
        ]
    },
    {
        text: "Ordre du jour : tu bandes, tu gicles, tu recommences.",
        intensity: "hot",
        replacements: [
            { word: "bandes", alternatives: ["exploses", "kiffes", "te régales", "jouis"] },
            { word: "gicles", alternatives: ["dégoulines", "débordes", "inondes", "craches"] }
        ]
    },
    {
        text: "Mate-la jouer avec ses doigts, offrir son cul, et t’inviter à tout lui faire.",
        intensity: "intense",
        replacements: [
            { word: "jouer avec ses doigts", alternatives: ["se caresser", "s’ouvrir", "se dilater", "jouer avec son gode"] },
            { word: "cul", alternatives: ["fente", "trou", "sphincter", "orifice"] }
        ]
    },
    {
        text: "Fais-lui bouffer ta queue virtuelle, mate-la jouir, et claque tout sur sa face.",
        intensity: "intense",
        replacements: [
            { word: "queue virtuelle", alternatives: ["bite", "gros chibre", "queue imaginaire", "bâton"] },
            { word: "claque tout", alternatives: ["décharge-toi", "explose", "gicle", "sors la crème"] }
        ]
    },
    {
        text: "Plus tu mates, plus tu banderas. Plus tu te branles, plus tu jouiras.",
        intensity: "medium",
        replacements: [
            { word: "mates", alternatives: ["regardes", "savoures", "baves", "admires"] },
            { word: "te branles", alternatives: ["te régales", "t’excites", "prends ton pied", "t’occupes de toi"] }
        ]
    }
];

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-8px) scale(1.02); }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 40px rgba(218, 165, 32, 0.6), 0 0 60px rgba(218, 165, 32, 0.3); }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0px);
    }
`;

const typewriterBlink = keyframes`
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
`;

// =================== STYLES PERSONNALISÉS ===================

const HeroContainer = styled(Box)({
    position: 'relative',
    width: '100vw',
    height: '60vh',
    minHeight: '400px',
    maxHeight: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    marginLeft: 'calc(-50vw + 50%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',

    // Overlay sombre réduit pour voir plus l'image
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(26,26,26,0.5) 30%, rgba(45,24,16,0.3) 70%, rgba(0,0,0,0.4) 100%)',
        zIndex: 1,
    },

    // Effet de vignette plus subtil
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.2) 100%)',
        zIndex: 2,
    }
});

const ContentContainer = styled(Container)({
    position: 'relative',
    zIndex: 3,
    textAlign: 'left',
    color: '#fff',
    maxWidth: '1200px',
    padding: '0 40px',
    width: '100%',
    marginLeft: '40px', // Décale un peu vers la droite depuis le bord
});

const MainTitle = styled(Typography)({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 400,
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    lineHeight: 1.3,
    marginBottom: '16px',
    color: '#F5E6D3', // Beige/écru pour "Entrez dans l'univers"
    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
    letterSpacing: '0.5px',
    maxWidth: '800px',

    // Style spécial pour "Intyma..."
    '& .intyma-highlight': {
        color: '#D4A574', // Couleur cuivrée/dorée pour "Intyma"
        fontWeight: 500,
    },

    '@media (max-width: 768px)': {
        fontSize: 'clamp(2rem, 8vw, 2.8rem)',
        marginBottom: '12px',
    }
});

const Subtitle = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'intensity'
})(({ intensity = 'medium' }) => {
    const getIntensityColor = () => {
        switch(intensity) {
            case 'intense':
                return '#FF6B9D'; // Rose intense/rouge sexy
            case 'hot':
                return '#FF8A65'; // Orange sensuel
            default: // medium
                return '#FFB3BA'; // Rose doux
        }
    };

    return {
        fontFamily: '"Inter", "Roboto", sans-serif',
        fontWeight: 300,
        fontSize: 'clamp(1rem, 2vw, 1.2rem)',
        lineHeight: 1.6,
        marginBottom: '32px',
        color: getIntensityColor(),
        textShadow: `0 1px 3px rgba(0,0,0,0.5), 0 0 10px ${getIntensityColor()}33`,
        letterSpacing: '0.3px',
        maxWidth: '600px',
        minHeight: '60px',
        transition: 'color 0.5s ease, text-shadow 0.5s ease',

        '@media (max-width: 768px)': {
            fontSize: 'clamp(0.95rem, 4vw, 1.1rem)',
            marginBottom: '24px',
            minHeight: '50px',
        }
    };
});

const TypewriterCursor = styled('span', {
    shouldForwardProp: (prop) => prop !== 'intensity'
})(({ intensity = 'medium' }) => {
    const getCursorColor = () => {
        switch(intensity) {
            case 'intense':
                return '#FF1744'; // Rouge vif
            case 'hot':
                return '#FF5722'; // Orange vif
            default: // medium
                return '#FF6B9D'; // Rose vif
        }
    };

    return {
        animation: `${typewriterBlink} 1s infinite`,
        color: getCursorColor(),
        fontWeight: 'bold',
        textShadow: `0 0 8px ${getCursorColor()}`,
    };
});

const CTAButton = styled(Button)(({ variant = 'primary' }) => ({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1.1rem',
    textTransform: 'none',
    padding: '16px 40px',
    borderRadius: '50px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px',
    minWidth: '200px',
    margin: '0 12px',

    ...(variant === 'primary' ? {
        background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 30%, #CD853F 70%, #DAA520 100%)',
        color: '#000',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4), 0 4px 10px rgba(0,0,0,0.3)',
        border: 'none',

        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
            animation: `${shimmer} 2s infinite`,
        },

        '&:hover': {
            transform: 'translateY(-4px) scale(1.05)',
            background: 'linear-gradient(135deg, #F4D03F 0%, #DAA520 30%, #B8860B 70%, #CD853F 100%)',
            boxShadow: '0 12px 35px rgba(218, 165, 32, 0.5), 0 6px 15px rgba(0,0,0,0.4)',
            animation: `${glowPulse} 2s infinite`,
        }
    } : {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#DAA520',
        border: '2px solid rgba(218, 165, 32, 0.5)',
        backdropFilter: 'blur(10px)',

        '&:hover': {
            background: 'rgba(218, 165, 32, 0.1)',
            borderColor: '#DAA520',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(218, 165, 32, 0.3)',
        }
    }),

    '&:active': {
        transform: variant === 'primary' ? 'translateY(-2px) scale(1.02)' : 'translateY(0px)',
    },

    '@media (max-width: 768px)': {
        padding: '14px 32px',
        fontSize: '1rem',
        margin: '8px',
        minWidth: '180px',
    }
}));

const ButtonContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'flex-start', // Aligné à gauche
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',

    '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'flex-start', // Aligné à gauche même en mobile
        gap: '12px',
    }
});

const LoadingContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#DAA520',
    fontSize: '1.1rem',
    fontWeight: 500,
});

// =================== COMPOSANT PRINCIPAL ===================

const HeroSection = ({
                         title = "Entrez dans l'univers Intyma...",
                         subtitle = "",
                         backgroundImage = "/silhouette-hero.jpg",
                         primaryButtonText = "Explorer maintenant !",
                         secondaryButtonText = "Surprends-moi !",
                         onPrimaryAction = () => console.log("Navigation vers Découvrir"),
                         onSecondaryAction = null,
                         showSecondaryButton = true,
                         typewriterSpeed = 80,
                         pauseBetweenPhrases = 3000,
                         showReplacementAnimation = true, // Nouvelle prop pour activer les animations de remplacement
                         height = "60vh",
                         apiBaseUrl = "http://127.0.0.1:5000"
                     }) => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // États pour l'animation typewriter
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [isReplacing, setIsReplacing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [currentIntensity, setCurrentIntensity] = useState('medium');

    // États pour l'animation de remplacement de mots
    const [originalText, setOriginalText] = useState('');
    const [currentWordToReplace, setCurrentWordToReplace] = useState(null);
    const [replacementWord, setReplacementWord] = useState('');

    // Fonction pour démarrer une animation de remplacement
    const startReplacementAnimation = () => {
        if (!showReplacementAnimation) return false;

        const currentPhrase = sexyPhrases[currentPhraseIndex];

        // 40% de chance de faire une animation de remplacement si la phrase a des mots remplaçables
        if (Math.random() < 0.4 && currentPhrase.replacements && currentPhrase.replacements.length > 0) {
            const randomReplacement = currentPhrase.replacements[Math.floor(Math.random() * currentPhrase.replacements.length)];
            const randomAlternative = randomReplacement.alternatives[Math.floor(Math.random() * randomReplacement.alternatives.length)];

            setOriginalText(currentPhrase.text);
            setCurrentWordToReplace(randomReplacement);
            setReplacementWord(randomAlternative);
            setIsReplacing(true);
            setIsErasing(false);

            return true;
        }
        return false;
    };

    // Animation typewriter principale
    useEffect(() => {
        if (isReplacing) {
            // Animation de remplacement de mot dans la phrase
            const words = originalText.split(' ');

            // Recherche plus flexible du mot à remplacer
            const wordIndex = words.findIndex(word => {
                const cleanWord = word.toLowerCase().replace(/[.,!?;:…]/g, '');
                const targetWord = currentWordToReplace.word.toLowerCase();
                return cleanWord === targetWord || cleanWord.includes(targetWord);
            });

            if (wordIndex !== -1) {
                if (!isErasing) {
                    // Phase d'effacement : on efface le mot actuel caractère par caractère
                    const beforeWord = words.slice(0, wordIndex).join(' ') + (wordIndex > 0 ? ' ' : '');
                    const afterWord = (wordIndex < words.length - 1 ? ' ' : '') + words.slice(wordIndex + 1).join(' ');

                    // Calculer combien de caractères du mot on doit encore afficher
                    const currentDisplayedWord = displayedText.slice(beforeWord.length, displayedText.length - afterWord.length);

                    if (currentDisplayedWord.length > 0) {
                        const timer = setTimeout(() => {
                            const newDisplayedWord = currentDisplayedWord.slice(0, -1);
                            setDisplayedText(beforeWord + newDisplayedWord + afterWord);
                        }, 80);
                        return () => clearTimeout(timer);
                    } else {
                        // Mot complètement effacé, commencer à taper le nouveau
                        setIsErasing(true);
                    }
                } else {
                    // Phase de frappe : on tape le nouveau mot
                    const beforeWord = words.slice(0, wordIndex).join(' ') + (wordIndex > 0 ? ' ' : '');
                    const afterWord = (wordIndex < words.length - 1 ? ' ' : '') + words.slice(wordIndex + 1).join(' ');
                    const currentTypedWord = displayedText.slice(beforeWord.length, displayedText.length - afterWord.length);

                    if (currentTypedWord.length < replacementWord.length) {
                        const timer = setTimeout(() => {
                            const newTypedWord = replacementWord.slice(0, currentTypedWord.length + 1);
                            setDisplayedText(beforeWord + newTypedWord + afterWord);
                        }, typewriterSpeed);
                        return () => clearTimeout(timer);
                    } else {
                        // Remplacement terminé, pause puis passer à la phrase suivante
                        const timer = setTimeout(() => {
                            setIsReplacing(false);
                            setIsErasing(false);
                            setDisplayedText('');
                            setCurrentWordToReplace(null);
                            setReplacementWord('');
                            setOriginalText('');
                            setCurrentPhraseIndex((prev) => (prev + 1) % sexyPhrases.length);
                        }, pauseBetweenPhrases);
                        return () => clearTimeout(timer);
                    }
                }
            } else {
                // Si le mot n'est pas trouvé, passer à la phrase suivante
                console.log(`Mot "${currentWordToReplace.word}" non trouvé dans "${originalText}"`);
                const timer = setTimeout(() => {
                    setIsReplacing(false);
                    setIsErasing(false);
                    setDisplayedText('');
                    setCurrentWordToReplace(null);
                    setReplacementWord('');
                    setOriginalText('');
                    setCurrentPhraseIndex((prev) => (prev + 1) % sexyPhrases.length);
                }, 500);
                return () => clearTimeout(timer);
            }
        } else {
            // Animation typewriter normale
            const currentPhrase = sexyPhrases[currentPhraseIndex];
            setCurrentIntensity(currentPhrase.intensity);

            if (isTyping) {
                if (displayedText.length < currentPhrase.text.length) {
                    const timer = setTimeout(() => {
                        setDisplayedText(currentPhrase.text.slice(0, displayedText.length + 1));
                    }, typewriterSpeed);
                    return () => clearTimeout(timer);
                } else {
                    // Phrase complète, décider de l'animation suivante
                    const timer = setTimeout(() => {
                        if (startReplacementAnimation()) {
                            // Animation de remplacement lancée
                            setIsTyping(false);
                        } else {
                            // Animation normale - passer à la phrase suivante
                            setIsTyping(false);
                            setDisplayedText('');
                            setCurrentPhraseIndex((prev) => (prev + 1) % sexyPhrases.length);
                        }
                    }, pauseBetweenPhrases);
                    return () => clearTimeout(timer);
                }
            } else if (!isReplacing) {
                // Redémarrer la frappe normale
                setIsTyping(true);
            }
        }
    }, [displayedText, isTyping, isReplacing, isErasing, currentPhraseIndex, typewriterSpeed, pauseBetweenPhrases, showReplacementAnimation, originalText, currentWordToReplace, replacementWord]);

    // Fonction pour appeler l'API surprends_moi
    const handleSurprendsMoi = async () => {
        if (onSecondaryAction) {
            onSecondaryAction();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${apiBaseUrl}/api/surprends_moi`);
            const surprise = response.data;

            setNotification({
                open: true,
                message: `🎲 ${surprise.message} - "${surprise.titre}" (${surprise.duree} min)`,
                severity: 'success'
            });

            // Optionnel : rediriger vers la scène ou l'afficher dans un modal
            console.log('Scène surprise:', surprise);

        } catch (error) {
            console.error('Erreur API surprends_moi:', error);
            setNotification({
                open: true,
                message: '😔 Oups ! Impossible de récupérer une suggestion pour le moment.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <>
            <HeroContainer
                sx={{
                    height,
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 50%, #1a1a1a 100%)',
                }}
            >
                <ContentContainer maxWidth={false}>
                    <Fade in={true} timeout={1000}>
                        <div>
                            <MainTitle variant="h1">
                                {formatTitle(title)}
                            </MainTitle>

                            <Subtitle variant="h5" intensity={currentIntensity}>
                                {displayedText}
                                {showCursor && <TypewriterCursor intensity={currentIntensity}>|</TypewriterCursor>}
                            </Subtitle>

                            <ButtonContainer>
                                <CTAButton
                                    variant="primary"
                                    size="large"
                                    startIcon={<Explore />}
                                    onClick={onPrimaryAction}
                                    disabled={loading}
                                >
                                    {primaryButtonText}
                                </CTAButton>

                                {showSecondaryButton && (
                                    <CTAButton
                                        variant="secondary"
                                        size="large"
                                        startIcon={loading ? null : <PlayArrow />}
                                        onClick={handleSurprendsMoi}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <LoadingContainer>
                                                <CircularProgress size={20} color="inherit" />
                                                Recherche...
                                            </LoadingContainer>
                                        ) : (
                                            secondaryButtonText
                                        )}
                                    </CTAButton>
                                )}
                            </ButtonContainer>
                        </div>
                    </Fade>
                </ContentContainer>
            </HeroContainer>

            {/* Notification pour les résultats de l'API */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{
                        background: notification.severity === 'success'
                            ? 'linear-gradient(135deg, #DAA520, #B8860B)'
                            : undefined,
                        color: notification.severity === 'success' ? '#000' : undefined,
                        fontWeight: 500
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default HeroSection;