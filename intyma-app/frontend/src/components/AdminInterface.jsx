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
    Autocomplete,
    Paper,
    Fade,
    Grow,
    Modal,
    Backdrop,
    Rating
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Star,
    Visibility,
    Favorite,
    PlayArrow,
    Movie,
    Person,
    Close,
    Save,
    Cancel,
    AccessTime,
    HighQuality,
    CalendarToday, CalendarMonth, ArrowBack
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';

// =================== ANIMATIONS ===================

const shimmer = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
`;

const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); }
    50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
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

// =================== STYLES PERSONNALISÉS ===================

const AdminContainer = styled(Container)({
    background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 25%, #2D1810 50%, #1A1A1A 75%, #0F0F0F 100%)',
    minHeight: '100vh',
    paddingTop: '40px',
    paddingBottom: '40px',
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

const MainTitle = styled(Typography)({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 400,
    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
    background: 'linear-gradient(135deg, #DAA520 0%, #F4D03F 50%, #DAA520 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
    marginBottom: '40px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    letterSpacing: '1px',
    position: 'relative',

    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '120px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
    }
});

const StyledTabs = styled(Tabs)({
    marginBottom: '40px',
    '& .MuiTabs-indicator': {
        background: 'linear-gradient(90deg, #DAA520, #F4D03F)',
        height: '3px',
        borderRadius: '2px',
    },
    '& .MuiTab-root': {
        fontFamily: '"Inter", "Roboto", sans-serif',
        fontWeight: 600,
        fontSize: '1.1rem',
        color: '#B8860B',
        textTransform: 'none',
        padding: '16px 32px',
        margin: '0 8px',
        borderRadius: '50px 50px 0 0',
        background: 'rgba(218, 165, 32, 0.05)',
        border: '1px solid rgba(218, 165, 32, 0.2)',
        borderBottom: 'none',
        transition: 'all 0.3s ease',

        '&:hover': {
            background: 'rgba(218, 165, 32, 0.1)',
            color: '#DAA520',
        },

        '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(244, 208, 63, 0.1))',
            color: '#F4D03F',
            borderColor: '#DAA520',
        }
    }
});

const TabPanel = styled(Box)({
    background: 'rgba(26, 26, 26, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    position: 'relative',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, transparent 50%, rgba(218, 165, 32, 0.05) 100%)',
        pointerEvents: 'none',
    }
});

const SectionHeader = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    position: 'relative',
    zIndex: 1,
});

const SectionTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1.8rem',
    color: '#F5E6D3',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',

    '& .MuiSvgIcon-root': {
        color: '#DAA520',
        fontSize: '2rem',
    }
});

const AddButton = styled(Button)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none',
    padding: '12px 24px',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 30%, #CD853F 70%, #DAA520 100%)',
    color: '#000',
    border: 'none',
    boxShadow: '0 6px 20px rgba(218, 165, 32, 0.4)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

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
        transform: 'translateY(-2px)',
        background: 'linear-gradient(135deg, #F4D03F 0%, #DAA520 30%, #B8860B 70%, #CD853F 100%)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.5)',
        animation: `${glowPulse} 2s infinite`,
    }
});

const StyledCard = styled(Card)({
    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    color: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
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
        boxShadow: '0 12px 30px rgba(218, 165, 32, 0.3), 0 6px 15px rgba(0,0,0,0.4)',
        animation: `${floatAnimation} 3s ease-in-out infinite`,

        '&::before': {
            height: '4px',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.5)',
        }
    }
});

const SceneImageContainer = styled(Box)({
    width: '200px',
    height: '130px',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px 0 0 12px',
    transition: 'all 0.4s ease',

    // Image de fond floutée (même image pour remplir les espaces)
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.3)',
        zIndex: 0,
        borderRadius: '12px 0 0 12px',
    },

    // Image principale nette au centre
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '95%',
        height: '95%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    },

    '&:hover::after': {
        transform: 'translate(-50%, -50%) scale(1.05)',
    }
});

const PlaceholderIcon = styled(Movie)({
    fontSize: '3rem',
    color: 'rgba(218, 165, 32, 0.4)',
    opacity: 0.6,
});

const ErrorIndicator = styled(Box)({
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    color: '#fff',
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    zIndex: 5,
    fontWeight: 'bold'
});

const CardTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1.2rem',
    color: '#F4D03F',
    marginBottom: '8px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
});

const CardSubtitle = styled(Typography)({
    color: '#B8860B',
    fontSize: '0.9rem',
    marginBottom: '12px',
    fontWeight: 500,
});

const StyledChip = styled(Chip)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(184, 134, 11, 0.2))',
    color: '#F4D03F',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    fontWeight: 500,
    fontSize: '0.8rem',
    margin: '2px',

    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
        borderColor: '#DAA520',
    }
});

const ActionButton = styled(IconButton)(({ variant = 'edit' }) => {
    const getVariantStyle = () => {
        switch(variant) {
            case 'delete':
                return {
                    color: '#FF4444',
                    '&:hover': {
                        background: 'rgba(255, 68, 68, 0.1)',
                        boxShadow: '0 0 10px rgba(255, 68, 68, 0.3)'
                    }
                };
            case 'favorite':
                return {
                    color: '#FF6B9D',
                    '&:hover': {
                        background: 'rgba(255, 107, 157, 0.1)',
                        boxShadow: '0 0 10px rgba(255, 107, 157, 0.3)'
                    }
                };
            case 'view':
                return {
                    color: '#4CAF50',
                    '&:hover': {
                        background: 'rgba(76, 175, 80, 0.1)',
                        boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
                    }
                };
            default: // edit
                return {
                    color: '#2196F3',
                    '&:hover': {
                        background: 'rgba(33, 150, 243, 0.1)',
                        boxShadow: '0 0 10px rgba(33, 150, 243, 0.3)'
                    }
                };
        }
    };

    return {
        ...getVariantStyle(),
        transition: 'all 0.3s ease',
        border: '1px solid currentColor',
        borderRadius: '8px',
        margin: '2px',

        '& .MuiSvgIcon-root': {
            fontSize: '1.2rem',
        }
    };
});

const StyledDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(218, 165, 32, 0.3)',
        backdropFilter: 'blur(10px)'
    }
});

const DialogTitleStyled = styled(DialogTitle)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(42, 42, 42, 0.8))',
    color: '#F4D03F',
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1.5rem',
    borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
});

const StyledTextField = styled(TextField)({
    '& .MuiInputBase-root': {
        color: '#fff',
        background: 'rgba(26, 26, 26, 0.6)',
        borderRadius: '12px',
        border: '1px solid rgba(218, 165, 32, 0.3)',
        transition: 'all 0.3s ease',

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
        fontWeight: 500,

        '&.Mui-focused': {
            color: '#DAA520',
        }
    },
    '& .MuiFormHelperText-root': {
        color: '#B8860B',
        fontSize: '0.75rem',
        marginTop: '8px',
        fontWeight: 400,
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        }
    }
});

// =================== CARTES COMPACTES ===================
const CompactCard = styled(Card)({
    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    color: '#fff',
    height: '400px', // Hauteur fixe plus grande
    width: '100%', // Largeur fixe
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',

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
        boxShadow: '0 12px 30px rgba(218, 165, 32, 0.3), 0 6px 15px rgba(0,0,0,0.4)',
        animation: `${floatAnimation} 3s ease-in-out infinite`,

        '&::before': {
            height: '4px',
            boxShadow: '0 0 10px rgba(218, 165, 32, 0.5)',
        }
    }
});

const CompactImageContainer = styled(Box)({
    width: '100%',
    height: '200px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px 12px 0 0',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.3)',
        zIndex: 0,
    },

    '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '95%',
        height: '95%',
        transform: 'translate(-50%, -50%)',
        backgroundImage: 'inherit',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 1,
        borderRadius: '8px',
        transition: 'transform 0.3s ease',
    },

    '&:hover::after': {
        transform: 'translate(-50%, -50%) scale(1.05)',
    }
});

const CompactCardContent = styled(CardContent)({
    padding: '16px',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
});

const CompactTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    color: '#F4D03F',
    marginBottom: '8px',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const CompactSubtitle = styled(Typography)({
    color: '#B8860B',
    fontSize: '0.8rem',
    marginBottom: '8px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

// =================== MODAL DE DÉTAILS ===================
const DetailModal = styled(Modal)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

});

const DetailModalContent = styled(Box)({
    background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    backdropFilter: 'blur(10px)',
    color: '#fff',
    width: '90vw',
    maxWidth: '800px',
    maxHeight: '95vh',
    minWidth: '600px',
    overflow: 'auto',
    outline: 'none',
    position: 'relative',
});

const DetailHeader = styled(Box)({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(42, 42, 42, 0.8))',
    padding: '24px',
    borderBottom: '1px solid rgba(218, 165, 32, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '20px 20px 0 0',
});

const DetailTitle = styled(Typography)({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 600,
    fontSize: '1.8rem',
    color: '#F4D03F',
});

const DetailImageContainer = styled(Box)({
    width: '100%',
    height: '300px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    margin: '24px 0',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'inherit',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px) brightness(0.3)',
        zIndex: 0,
    },

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
        zIndex: 1,
        borderRadius: '12px',
    }
});

function TabPanelContent({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Fade in={true} timeout={500}>
                    <TabPanel>{children}</TabPanel>
                </Fade>
            )}
        </div>
    );
}

export default function AdminInterface({ onBack }) {

    const MINIATURES_PREFIX = '/Volumes/My Passport for Mac/Intyma/miniatures/';
    const VIDEOS_PREFIX = '/Volumes/My Passport for Mac/Privé/M364TR0N/';

    const PHOTOS_PREFIX = '/Volumes/My Passport for Mac/Intyma/images/';

    const extractShortPath = (fullPath, prefix) => {
        if (!fullPath) return '';
        return fullPath.startsWith(prefix) ? fullPath.substring(prefix.length) : fullPath;
    };

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

    // Fonction de débogage - ajoute ça temporairement
    const countScenesByActrice = (actriceId) => {
        console.log('🔍 Recherche scènes pour actrice ID:', actriceId);
        console.log('📊 Toutes les scènes:', scenes);

        const matchingScenes = scenes.filter(scene => {
            console.log('🎬 Scene:', scene.titre, 'Actrices:', scene.actrices);

            // Vérifier différentes structures possibles
            if (scene.actrices) {
                // Si c'est un tableau d'objets avec id
                if (Array.isArray(scene.actrices) && scene.actrices.length > 0 && typeof scene.actrices[0] === 'object') {
                    return scene.actrices.some(actrice => actrice.id === actriceId);
                }
                // Si c'est un tableau d'IDs
                if (Array.isArray(scene.actrices) && scene.actrices.length > 0 && typeof scene.actrices[0] === 'number') {
                    return scene.actrices.includes(actriceId);
                }
            }

            // Si c'est dans actrice_ids
            if (scene.actrice_ids && Array.isArray(scene.actrice_ids)) {
                return scene.actrice_ids.includes(actriceId);
            }

            return false;
        });

        console.log('✅ Scènes trouvées:', matchingScenes.length);
        return matchingScenes.length;
    };

    // Fonction pour obtenir les scènes d'une actrice
    const getScenesByActrice = (actriceId) => {
        return scenes.filter(scene =>
            scene.actrices && scene.actrices.some(actrice => actrice.id === actriceId)
        );
    };

    const [tabValue, setTabValue] = useState(0);
    const [scenes, setScenes] = useState([]);
    const [actrices, setActrices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imageErrors, setImageErrors] = useState(new Set());
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [scenesRes, actricesRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/api/scenes'),
                axios.get('http://127.0.0.1:5000/api/actrices')
            ]);

            // Inverser l'ordre pour afficher les plus récentes en premier
            setScenes(scenesRes.data.reverse());
            setActrices(actricesRes.data.reverse());
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar('Erreur lors du chargement des données', 'error');
        }
    };

    // Fonction améliorée pour construire l'URL de l'image
    const buildImageUrl = (imagePath, type = 'scene') => {
        if (!imagePath) {
            console.log('❌ Pas d\'image définie:', imagePath);
            return null;
        }

        try {
            // Si l'image commence par http, l'utiliser directement
            if (imagePath.startsWith('http')) {
                console.log('✅ URL directe:', imagePath);
                return imagePath;
            }

            // Normaliser le chemin
            const normalizedPath = imagePath.trim();
            let actriceName, fileName;

            // Pour les actrices, utiliser le endpoint /images/ au lieu de /miniatures/
            const isActricePhoto = type === 'actrice';
            const endpoint = isActricePhoto ? '/images/' : '/miniatures/';

            if (normalizedPath.includes(endpoint)) {
                const index = normalizedPath.indexOf(endpoint);
                const afterEndpoint = normalizedPath.substring(index + endpoint.length);
                const parts = afterEndpoint.split('/');
                if (parts.length >= 2) {
                    actriceName = parts[0];
                    fileName = parts[parts.length - 1];
                }
            } else {
                // Essayer d'extraire depuis la fin du chemin
                const pathParts = normalizedPath.split('/');
                if (pathParts.length >= 2) {
                    fileName = pathParts[pathParts.length - 1];
                    actriceName = pathParts[pathParts.length - 2];
                }
            }

            if (actriceName && fileName) {
                const cleanActriceName = actriceName.trim();
                const cleanFileName = fileName.trim();

                const baseEndpoint = isActricePhoto ? 'images' : 'miniatures';
                const finalUrl = `http://127.0.0.1:5000/${baseEndpoint}/${encodeURIComponent(cleanActriceName)}/${encodeURIComponent(cleanFileName)}`;
                console.log('✅ URL construite:', finalUrl, 'depuis:', imagePath);
                return finalUrl;
            }

            console.log('❌ Impossible d\'extraire actrice/fichier depuis:', imagePath);
            return null;
        } catch (error) {
            console.error('❌ Erreur construction URL image:', error, imagePath);
            return null;
        }
    };

    // Fonction pour gérer les erreurs de chargement d'images
    const handleImageError = (sceneId, imageUrl) => {
        console.error(`❌ Erreur chargement image pour scène ${sceneId}:`, imageUrl);
        setImageErrors(prev => new Set([...prev, sceneId]));
    };

    // Fonction pour tester si une image peut être chargée
    const testImageLoad = (imageUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imageUrl;
        });
    };

    // Composant d'image simplifié avec la technique d'ActriceDuJour
    const SceneImage = ({ scene, imageUrl }) => {
        const [hasError, setHasError] = useState(false);

        // Test de l'image et gestion d'erreur
        useEffect(() => {
            if (imageUrl) {
                const img = new Image();
                img.onload = () => setHasError(false);
                img.onerror = () => {
                    setHasError(true);
                    handleImageError(scene.id, imageUrl);
                };
                img.src = imageUrl;
            }
        }, [imageUrl, scene.id]);

        if (!imageUrl || hasError || imageErrors.has(scene.id)) {
            return (
                <>
                    <PlaceholderIcon
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 4
                        }}
                    />
                    {hasError && (
                        <ErrorIndicator>
                            IMG ERROR
                        </ErrorIndicator>
                    )}
                </>
            );
        }

        // ✨ NOUVEAU : Plus besoin de composants complexes, juste retourner null
        // L'image sera affichée via backgroundImage sur le conteneur parent
        return null;
    };

    const handleTabChange = (event, newValue) => {
        // Si c'est l'onglet "Retour" (index 0), ne pas changer tabValue
        if (newValue === 0) {
            if (onBack) {
                onBack();
            } else {
                window.history.back();
            }
            return;
        }

        // Ajuster l'index pour les vrais onglets (Scènes = 1 devient 0, Actrices = 2 devient 1)
        setTabValue(newValue - 1);
    };

    const openAddDialog = (type) => {
        setCurrentItem({ type, isNew: true });
        setFormData(type === 'scene' ? {
            titre: '',
            chemin: '',
            chemin_short: '',
            synopsis: '',
            duree: '',
            qualite: 'HD',
            site: '',
            studio: '',
            note_perso: '',
            date_scene: '',
            image: '',
            image_short: '',
            actrice_ids: [],
            tags: []
        } : {
            nom: '',
            biographie: '',
            photo: '',
            photo_short: '',
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
                const response = await axios.get(`http://127.0.0.1:5000/api/scenes/${item.id}`);
                const sceneDetail = response.data;

                setFormData({
                    ...sceneDetail,
                    actrice_ids: sceneDetail.actrices ? sceneDetail.actrices.map(a => a.id) : [],
                    tags: sceneDetail.tags ? sceneDetail.tags.map(t => t.nom) : []
                });
            } catch (error) {
                console.error('Erreur chargement détails scène:', error);
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
            const submitData = { ...formData };

            // Reconstruire les chemins complets pour les scènes
            if (currentItem.type === 'scene') {
                if (submitData.image_short) {
                    submitData.image = MINIATURES_PREFIX + submitData.image_short;
                }
                if (submitData.chemin_short) {
                    submitData.chemin = VIDEOS_PREFIX + submitData.chemin_short;
                }
                // Supprimer les champs courts avant envoi
                delete submitData.image_short;
                delete submitData.chemin_short;

                if (submitData.duree) {
                    submitData.duree = parseInt(submitData.duree);
                }
            } else if (currentItem.type === 'actrice') {
                if (submitData.photo_short) {
                    submitData.photo = PHOTOS_PREFIX + submitData.photo_short;
                }
                // Supprimer le champ court avant envoi
                delete submitData.photo_short;
            }

            // Ajouter cette ligne dans handleSubmit juste avant await axios
            console.log('submitData avant envoi:', submitData);

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
            // Vérifier si la scène n'est pas déjà dans l'historique
            const existingHistory = await axios.get(`http://127.0.0.1:5000/api/history/${sceneId}`);
            if (existingHistory.data) {
                showSnackbar('Cette scène est déjà dans l\'historique', 'warning');
                return;
            }
        } catch (error) {
            // Si erreur 404, c'est que la scène n'est pas dans l'historique, on peut l'ajouter
            if (error.response?.status !== 404) {
                console.error('Erreur vérification historique:', error);
                showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
                return;
            }
        }

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
            // L'endpoint doit probablement supprimer par scene_id, pas par id direct
            await axios.delete(`http://127.0.0.1:5000/api/favorites/scene/${sceneId}`);
            showSnackbar('Supprimé des favoris');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const removeFromHistory = async (sceneId) => {
        try {
            // L'endpoint doit probablement supprimer par scene_id, pas par id direct
            await axios.delete(`http://127.0.0.1:5000/api/history/scene/${sceneId}`);
            showSnackbar('Supprimé de l\'historique');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCardClick = async (item, type) => {
        setSelectedItem({ ...item, type });
        setEditMode(false);
        setDetailModalOpen(true);

        // Si c'est une scène, récupérer les détails complets
        if (type === 'scene') {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/api/scenes/${item.id}`);
                const sceneDetail = response.data;

                // Mettre à jour selectedItem avec les détails complets
                setSelectedItem({ ...sceneDetail, type: 'scene' });
                setFormData({
                    ...sceneDetail,
                    image_short: extractShortPath(sceneDetail.image, MINIATURES_PREFIX),
                    chemin_short: extractShortPath(sceneDetail.chemin, VIDEOS_PREFIX),
                    actrice_ids: sceneDetail.actrices ? sceneDetail.actrices.map(a => a.id) : [],
                    tags: sceneDetail.tags ? sceneDetail.tags.map(t => t.nom || t) : []
                });
            } catch (error) {
                console.error('Erreur chargement détails scène:', error);
                // Fallback sur les données de base
                setFormData({
                    ...item,
                    actrice_ids: [],
                    tags: []
                });
            }
        } else {
            setFormData({
                ...item,
                photo_short: extractShortPath(item.photo, PHOTOS_PREFIX)
            });
        }
    };

    const handleCloseDetail = () => {
        setDetailModalOpen(false);
        setSelectedItem(null);
        setEditMode(false);
        setFormData({});
    };

    const handleEditMode = () => {
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setFormData({ ...selectedItem });
    };

    const handleSaveDetail = async () => {
        try {
            const url = `http://127.0.0.1:5000/api/${selectedItem.type}s/${selectedItem.id}`;
            const submitData = { ...formData };

            // Reconstruire les chemins complets pour les scènes
            if (selectedItem.type === 'scene') {
                if (submitData.image_short) {
                    submitData.image = MINIATURES_PREFIX + submitData.image_short;
                }
                if (submitData.chemin_short) {
                    submitData.chemin = VIDEOS_PREFIX + submitData.chemin_short;
                }
                // Supprimer les champs courts avant envoi
                delete submitData.image_short;
                delete submitData.chemin_short;

                if (submitData.duree) {
                    submitData.duree = parseInt(submitData.duree);
                }
            } else if (selectedItem.type === 'actrice') {
                if (submitData.photo_short) {
                    submitData.photo = PHOTOS_PREFIX + submitData.photo_short;
                }
                // Supprimer le champ court avant envoi
                delete submitData.photo_short;
            }

            await axios.put(url, submitData);

            setEditMode(false);
            // CORRECTION : Mettre à jour selectedItem avec les données complètes (submitData) au lieu de formData
            setSelectedItem({ ...submitData, type: selectedItem.type, id: selectedItem.id });

            // CORRECTION : Mettre à jour formData pour supprimer les champs courts
            if (selectedItem.type === 'scene') {
                setFormData({
                    ...submitData,
                    image_short: extractShortPath(submitData.image, MINIATURES_PREFIX),
                    chemin_short: extractShortPath(submitData.chemin, VIDEOS_PREFIX),
                });
            } else if (selectedItem.type === 'actrice') {
                setFormData({
                    ...submitData,
                    photo_short: extractShortPath(submitData.photo, PHOTOS_PREFIX),
                });
            }

            loadData();
            showSnackbar('Modifications sauvegardées avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            showSnackbar(`Erreur lors de la sauvegarde: ${error.response?.data?.error || error.message}`, 'error');
        }
    };

    return (
        <AdminContainer maxWidth="xl">
            <MainTitle variant="h3">
                Administration Intyma
            </MainTitle>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 5 }}>
                <StyledTabs value={tabValue + 1 } onChange={handleTabChange}>
                    <Tab
                        icon={<ArrowBack />}
                        label="Retour à l'accueil"
                        onClick={onBack || (() => window.history.back())}
                    />
                    <Tab icon={<Movie />} label="Scènes" />
                    <Tab icon={<Person />} label="Actrices" />
                </StyledTabs>
            </Box>

            {/* ONGLET SCENES */}
            <TabPanelContent value={tabValue} index={0}>
                <SectionHeader>
                    <SectionTitle>
                        <Movie />
                        Gestion des Scènes ({scenes.length})
                    </SectionTitle>
                    <AddButton
                        startIcon={<Add />}
                        onClick={() => openAddDialog('scene')}
                    >
                        Ajouter une scène
                    </AddButton>
                </SectionHeader>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'flex-start'
                }}>
                    {scenes.map((scene, index) => {
                        const imageUrl = buildImageUrl(scene.image);

                        return (
                            <Box key={scene.id} sx={{
                                width: '300px', // Largeur fixe pour toutes les cartes
                                flexShrink: 0
                            }}>
                                <Grow in={true} timeout={300 + index * 100}>
                                    <CompactCard onClick={() => handleCardClick(scene, 'scene')}>
                                        <CompactImageContainer
                                            sx={{
                                                backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none'
                                            }}
                                        >
                                            {!imageUrl && (
                                                <PlaceholderIcon
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        zIndex: 4
                                                    }}
                                                />
                                            )}
                                        </CompactImageContainer>
                                        <CompactCardContent>
                                            <CompactTitle>{scene.titre || 'Sans titre'}</CompactTitle>
                                            <CompactSubtitle>
                                                <AccessTime sx={{ fontSize: '1rem' }} />
                                                {scene.duree ? `${scene.duree} min` : 'Durée inconnue'}
                                                <HighQuality sx={{ fontSize: '1rem', ml: 1 }} />
                                                {scene.qualite}
                                                <CalendarMonth sx={{ fontSize: '1rem', ml: 1 }} />
                                                {scene.date_scene ? new Date(scene.date_scene).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                            </CompactSubtitle>

                                            {scene.actrices && scene.actrices.length > 0 && (
                                                <CompactSubtitle>
                                                    <Person sx={{ fontSize: '1rem' }} />
                                                    {scene.actrices.map(actrice => actrice.nom).join(', ')}
                                                </CompactSubtitle>
                                            )}

                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {scene.site && (
                                                    <StyledChip label={scene.site} size="small" />
                                                )}
                                                {scene.studio && (
                                                    <StyledChip label={scene.studio} size="small" />
                                                )}
                                            </Box>
                                        </CompactCardContent>
                                    </CompactCard>
                                </Grow>
                            </Box>
                        );
                    })}
                </Box>
            </TabPanelContent>

            {/* ONGLET ACTRICES */}
            <TabPanelContent value={tabValue} index={1}>
                <SectionHeader>
                    <SectionTitle>
                        <Person />
                        Gestion des Actrices ({actrices.length})
                    </SectionTitle>
                    <AddButton
                        startIcon={<Add />}
                        onClick={() => openAddDialog('actrice')}
                    >
                        Ajouter une actrice
                    </AddButton>
                </SectionHeader>

                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    justifyContent: 'flex-start'
                }}>
                    {actrices.map((actrice, index) => {
                        const imageUrl = buildImageUrl(actrice.photo, 'actrice');
                        const age = calculateAge(actrice.date_naissance);
                        const sceneCount = countScenesByActrice(actrice.id);

                        return (
                            <Box key={actrice.id} sx={{
                                width: '300px',
                                flexShrink: 0
                            }}>
                                <Grow in={true} timeout={300 + index * 100}>
                                    <CompactCard onClick={() => handleCardClick(actrice, 'actrice')}>
                                        <CompactImageContainer
                                            sx={{
                                                backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none'
                                            }}
                                        >
                                            {!imageUrl && (
                                                <PlaceholderIcon
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        zIndex: 4
                                                    }}
                                                />
                                            )}
                                        </CompactImageContainer>
                                        <CompactCardContent>
                                            <CompactTitle>{actrice.nom}</CompactTitle>
                                            <CompactSubtitle>
                                                🌍 {actrice.nationalite || 'Non spécifiée'}
                                                {age && (
                                                    <>
                                                        {' • '}
                                                        🎂 {age} ans
                                                    </>
                                                )}
                                            </CompactSubtitle>
                                            <CompactSubtitle>
                                                🎬 {sceneCount} scène{sceneCount !== 1 ? 's' : ''}
                                            </CompactSubtitle>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Star sx={{ color: '#DAA520', fontSize: '1rem' }} />
                                                <Typography variant="body2" sx={{ color: '#F4D03F', fontSize: '0.8rem' }}>
                                                    {actrice.note_moyenne || '0'}/5
                                                </Typography>
                                            </Box>
                                        </CompactCardContent>
                                    </CompactCard>
                                </Grow>
                            </Box>
                        );
                    })}
                </Box>
            </TabPanelContent>

            {/* DIALOG D'AJOUT/MODIFICATION */}
            <StyledDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitleStyled>
                    {currentItem?.isNew ? 'Ajouter' : 'Modifier'} {currentItem?.type === 'scene' ? 'une scène' : 'une actrice'}
                </DialogTitleStyled>
                <DialogContent sx={{ background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)', color: '#fff' }}>
                    <Box sx={{ pt: 2 }}>
                        {currentItem?.type === 'scene' ? (
                            <Grid container spacing={2}>
                                {/* Ligne 1 : Titre - champ long */}
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Titre"
                                        fullWidth
                                        value={formData.titre || ''}
                                        onChange={(e) => handleInputChange('titre', e.target.value)}
                                    />
                                </Grid>

                                {/* Ligne 2 : Synopsis - grand champ */}
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Synopsis"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={formData.synopsis || ''}
                                        onChange={(e) => handleInputChange('synopsis', e.target.value)}
                                    />
                                </Grid>

                                {/* Ligne 3 : Durée et Qualité */}
                                <Grid size={6}>
                                    <StyledTextField
                                        label="Durée (minutes)"
                                        type="number"
                                        fullWidth
                                        value={formData.duree || ''}
                                        onChange={(e) => handleInputChange('duree', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: '#B8860B', '&.Mui-focused': { color: '#DAA520' } }}>Qualité</InputLabel>
                                        <Select
                                            value={formData.qualite || 'HD'}
                                            onChange={(e) => handleInputChange('qualite', e.target.value)}
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
                                            <MenuItem value="1080p">1080p</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Ligne 4 : Note personnelle (avec étoiles) */}
                                <Grid size={12}>
                                    <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                        Note personnelle
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Rating
                                            value={parseFloat(formData.note_perso) || 0}
                                            onChange={(event, newValue) => {
                                                handleInputChange('note_perso', newValue?.toString() || '');
                                            }}
                                            size="large"
                                            sx={{
                                                '& .MuiRating-iconFilled': {
                                                    color: '#DAA520',
                                                },
                                                '& .MuiRating-iconHover': {
                                                    color: '#F4D03F',
                                                },
                                                '& .MuiRating-iconEmpty': {
                                                    color: 'rgba(218, 165, 32, 0.3)',
                                                }
                                            }}
                                        />
                                        <Typography sx={{ color: '#F4D03F', ml: 1 }}>
                                            {formData.note_perso ? `${formData.note_perso}/5` : 'Aucune note'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Ligne 5 : Tags */}
                                <Grid size={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={[]}
                                        value={formData.tags || []}
                                        onChange={(event, newValue) => {
                                            handleInputChange('tags', newValue);
                                        }}
                                        onInputChange={(event, newInputValue, reason) => {
                                            if (reason === 'input' && newInputValue.includes(',')) {
                                                const newTags = newInputValue.split(',').map(tag => tag.trim()).filter(tag => tag);
                                                const currentTags = formData.tags || [];
                                                const allTags = [...new Set([...currentTags, ...newTags])];
                                                handleInputChange('tags', allTags);
                                            }
                                        }}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <StyledChip
                                                    variant="outlined"
                                                    label={option}
                                                    {...getTagProps({ index })}
                                                    key={index}
                                                />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Tags (tapez et appuyez sur Entrée, ou séparez par des virgules)"
                                                placeholder="ex: milf, blonde, sexy"
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Ligne 6 : Actrices et Date de la scène */}
                                <Grid size={8}>
                                    <Autocomplete
                                        multiple
                                        options={actrices}
                                        getOptionLabel={(option) => option.nom}
                                        value={actrices.filter(a => formData.actrice_ids?.includes(a.id)) || []}
                                        onChange={(event, newValue) => {
                                            handleInputChange('actrice_ids', newValue.map(v => v.id));
                                        }}
                                        renderInput={(params) => (
                                            <StyledTextField
                                                {...params}
                                                label="Actrices"
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
                                <Grid size={4}>
                                    <StyledTextField
                                        label="Date de la scène"
                                        type="date"
                                        fullWidth
                                        value={formData.date_scene || ''}
                                        onChange={(e) => handleInputChange('date_scene', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                {/* Ligne 7 : Studio et Site */}
                                <Grid size={6}>
                                    <StyledTextField
                                        label="Studio"
                                        fullWidth
                                        value={formData.studio || ''}
                                        onChange={(e) => handleInputChange('studio', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <StyledTextField
                                        label="Site"
                                        fullWidth
                                        value={formData.site || ''}
                                        onChange={(e) => handleInputChange('site', e.target.value)}
                                    />
                                </Grid>

                                {/* Ligne 8 : Chemin de la miniature */}
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Miniature (ActriceName/filename.jpg)"
                                        fullWidth
                                        value={formData.image_short || ''}
                                        onChange={(e) => handleInputChange('image_short', e.target.value)}
                                        placeholder="ex: Alexa Payne/scene.jpg"
                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Intyma/miniatures/'"
                                    />
                                </Grid>

                                {/* Ligne 9 : Chemin du fichier */}
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Vidéo (ActriceName/filename.mp4)"
                                        fullWidth
                                        value={formData.chemin_short || ''}
                                        onChange={(e) => handleInputChange('chemin_short', e.target.value)}
                                        placeholder="ex: Alexa Payne/scene.mp4"
                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Privé/M364TR0N/'"
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            // Le reste pour les actrices...
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Nom"
                                        fullWidth
                                        value={formData.nom || ''}
                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Biographie"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={formData.biographie || ''}
                                        onChange={(e) => handleInputChange('biographie', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Photo (ActriceName/filename.jpg)"
                                        fullWidth
                                        value={formData.photo_short || ''}
                                        onChange={(e) => handleInputChange('photo_short', e.target.value)}
                                        placeholder="ex: Reagan Foxx/reagan-foxx.jpg"
                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Intyma/images/'"
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <StyledTextField
                                        label="Nationalité"
                                        fullWidth
                                        value={formData.nationalite || ''}
                                        onChange={(e) => handleInputChange('nationalite', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <StyledTextField
                                        label="Date de naissance"
                                        type="date"
                                        fullWidth
                                        value={formData.date_naissance || ''}
                                        onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <StyledTextField
                                        label="Commentaire"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={formData.commentaire || ''}
                                        onChange={(e) => handleInputChange('commentaire', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    background: 'linear-gradient(135deg, rgba(42, 42, 42, 0.9), rgba(26, 26, 26, 0.9))',
                    borderTop: '1px solid rgba(218, 165, 32, 0.3)',
                    padding: '20px 24px'
                }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
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
                    <AddButton onClick={handleSubmit} sx={{ ml: 2 }}>
                        {currentItem?.isNew ? 'Ajouter' : 'Modifier'}
                    </AddButton>
                </DialogActions>
            </StyledDialog>

            {/* MODAL DE DÉTAILS */}
            <DetailModal
                open={detailModalOpen}
                onClose={handleCloseDetail}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={detailModalOpen}>
                    <DetailModalContent>
                        {selectedItem && (
                            <>
                                <DetailHeader>
                                    <DetailTitle>
                                        {selectedItem.type === 'scene' ? selectedItem.titre : selectedItem.nom}
                                    </DetailTitle>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!editMode ? (
                                            <Button
                                                startIcon={<Edit />}
                                                onClick={handleEditMode}
                                                sx={{
                                                    color: '#DAA520',
                                                    borderColor: '#DAA520',
                                                    '&:hover': {
                                                        borderColor: '#F4D03F',
                                                        background: 'rgba(218, 165, 32, 0.1)'
                                                    }
                                                }}
                                                variant="outlined"
                                            >
                                                Modifier
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    startIcon={<Save />}
                                                    onClick={handleSaveDetail}
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #DAA520, #B8860B)',
                                                        color: '#000',
                                                        fontWeight: 600,
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
                                                        }
                                                    }}
                                                >
                                                    Sauvegarder
                                                </Button>
                                                <Button
                                                    startIcon={<Cancel />}
                                                    onClick={handleCancelEdit}
                                                    variant="outlined"
                                                    sx={{
                                                        borderColor: '#FF4444',
                                                        color: '#FF4444',
                                                        '&:hover': {
                                                            borderColor: '#FF6666',
                                                            background: 'rgba(255, 68, 68, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        )}
                                        <IconButton
                                            onClick={handleCloseDetail}
                                            sx={{
                                                color: '#B8860B',
                                                '&:hover': {
                                                    color: '#DAA520',
                                                    background: 'rgba(218, 165, 32, 0.1)'
                                                }
                                            }}
                                        >
                                            <Close />
                                        </IconButton>
                                    </Box>
                                </DetailHeader>

                                <Box sx={{ padding: '24px' }}>
                                    {/* Image dans le modal de détails */}
                                    <DetailImageContainer
                                        sx={{
                                            backgroundImage: selectedItem.type === 'scene' && selectedItem.image
                                                ? `url("${buildImageUrl(selectedItem.image, 'scene')}")`
                                                : selectedItem.type === 'actrice' && selectedItem.photo
                                                    ? `url("${buildImageUrl(selectedItem.photo, 'actrice')}")`
                                                    : 'none'
                                        }}
                                    >
                                        {(
                                            (selectedItem.type === 'scene' && (!selectedItem.image || !buildImageUrl(selectedItem.image, 'scene'))) ||
                                            (selectedItem.type === 'actrice' && (!selectedItem.photo || !buildImageUrl(selectedItem.photo, 'actrice')))
                                        ) && (
                                            <PlaceholderIcon sx={{
                                                fontSize: '4rem',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 4
                                            }} />
                                        )}
                                    </DetailImageContainer>

                                    {/* Contenu détaillé pour les scènes */}
                                    {selectedItem.type === 'scene' ? (
                                        <Grid container spacing={2}>
                                            {/* Ligne 1 : Titre SEUL - champ long */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Titre
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        value={formData.titre || ''}
                                                        onChange={(e) => handleInputChange('titre', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="h5" sx={{ color: '#F4D03F', mb: 2 }}>
                                                        {selectedItem.titre}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 2 : Synopsis - grand champ */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Synopsis
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        size="small"
                                                        placeholder="Description de la scène..."
                                                        value={formData.synopsis || ''}
                                                        onChange={(e) => handleInputChange('synopsis', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                fontSize: '0.95rem'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                                                        {selectedItem.synopsis || 'Aucun synopsis disponible'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 3 : Durée et Qualité */}
                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Durée (minutes)
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        value={formData.duree || ''}
                                                        onChange={(e) => handleInputChange('duree', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        {selectedItem.duree ? `${selectedItem.duree} minutes` : 'Non spécifiée'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Qualité
                                                </Typography>
                                                {editMode ? (
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={formData.qualite || 'HD'}
                                                            onChange={(e) => handleInputChange('qualite', e.target.value)}
                                                            sx={{
                                                                color: '#fff',
                                                                background: 'rgba(26, 26, 26, 0.6)',
                                                                borderRadius: '12px',
                                                                border: '1px solid rgba(218, 165, 32, 0.3)',
                                                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                                                minHeight: '48px'
                                                            }}
                                                        >
                                                            <MenuItem value="720p">720p</MenuItem>
                                                            <MenuItem value="HD">HD</MenuItem>
                                                            <MenuItem value="Full HD">Full HD</MenuItem>
                                                            <MenuItem value="4K">4K</MenuItem>
                                                            <MenuItem value="1080p">1080p</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        {selectedItem.qualite}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 4 : Note personnelle (avec sélecteur d'étoiles) */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Note personnelle
                                                </Typography>
                                                {editMode ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Rating
                                                            value={parseFloat(formData.note_perso) || 0}
                                                            onChange={(event, newValue) => {
                                                                handleInputChange('note_perso', newValue?.toString() || '');
                                                            }}
                                                            size="large"
                                                            sx={{
                                                                '& .MuiRating-iconFilled': {
                                                                    color: '#DAA520',
                                                                },
                                                                '& .MuiRating-iconHover': {
                                                                    color: '#F4D03F',
                                                                },
                                                                '& .MuiRating-iconEmpty': {
                                                                    color: 'rgba(218, 165, 32, 0.3)',
                                                                }
                                                            }}
                                                        />
                                                        <Typography sx={{ color: '#F4D03F', ml: 1 }}>
                                                            {formData.note_perso ? `${formData.note_perso}/5` : 'Aucune note'}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Rating
                                                            value={parseFloat(selectedItem.note_perso) || 0}
                                                            readOnly
                                                            size="large"
                                                            sx={{
                                                                '& .MuiRating-iconFilled': {
                                                                    color: '#DAA520',
                                                                },
                                                                '& .MuiRating-iconEmpty': {
                                                                    color: 'rgba(218, 165, 32, 0.3)',
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="body1" sx={{ color: '#F4D03F', ml: 1 }}>
                                                            {selectedItem.note_perso ? `${selectedItem.note_perso}/5` : 'Aucune note'}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Grid>

                                            {/* Ligne 5 : Tags */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Tags
                                                </Typography>
                                                {editMode ? (
                                                    <Autocomplete
                                                        multiple
                                                        freeSolo
                                                        options={[]}
                                                        value={formData.tags || []}
                                                        onChange={(event, newValue) => {
                                                            handleInputChange('tags', newValue);
                                                        }}
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, index) => (
                                                                <StyledChip
                                                                    variant="outlined"
                                                                    label={option}
                                                                    {...getTagProps({ index })}
                                                                    key={index}
                                                                    size="small"
                                                                />
                                                            ))
                                                        }
                                                        renderInput={(params) => (
                                                            <StyledTextField
                                                                {...params}
                                                                size="small"
                                                                placeholder="Ajouter des tags"
                                                                sx={{
                                                                    '& .MuiInputBase-root': {
                                                                        minHeight: '48px',
                                                                        fontSize: '0.95rem'
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                ) : (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {selectedItem.tags && selectedItem.tags.length > 0 ? (
                                                            selectedItem.tags.map((tag) => (
                                                                <StyledChip
                                                                    key={tag.id || tag}
                                                                    label={tag.nom || tag}
                                                                    size="small"
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                                Aucun tag
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>

                                            {/* Ligne 6 : Actrices et Date de la scène */}
                                            <Grid size={8}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Actrices
                                                </Typography>
                                                {editMode ? (
                                                    <Autocomplete
                                                        multiple
                                                        options={actrices}
                                                        getOptionLabel={(option) => option.nom}
                                                        value={actrices.filter(a => formData.actrice_ids?.includes(a.id)) || []}
                                                        onChange={(event, newValue) => {
                                                            handleInputChange('actrice_ids', newValue.map(v => v.id));
                                                        }}
                                                        renderInput={(params) => (
                                                            <StyledTextField
                                                                {...params}
                                                                size="small"
                                                                placeholder="Sélectionner des actrices"
                                                                sx={{
                                                                    '& .MuiInputBase-root': {
                                                                        minHeight: '48px',
                                                                        fontSize: '0.95rem'
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                        sx={{
                                                            '& .MuiChip-root': {
                                                                color: '#fff',
                                                                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(184, 134, 11, 0.3))',
                                                                border: '1px solid rgba(218, 165, 32, 0.5)',
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {selectedItem.actrices && selectedItem.actrices.length > 0 ? (
                                                            selectedItem.actrices.map((actrice) => (
                                                                <StyledChip
                                                                    key={actrice.id}
                                                                    label={actrice.nom}
                                                                    size="small"
                                                                    icon={<Person />}
                                                                    // Dans la section Actrices du modal de scène, remplace le onClick par :
                                                                    onClick={async () => {
                                                                        // Fermer le modal actuel
                                                                        handleCloseDetail();

                                                                        // Récupérer les données complètes de l'actrice
                                                                        const actriceComplete = actrices.find(a => a.id === actrice.id);

                                                                        if (actriceComplete) {
                                                                            // Petite pause pour laisser le modal se fermer
                                                                            setTimeout(() => {
                                                                                handleCardClick(actriceComplete, 'actrice');
                                                                            }, 100);
                                                                        } else {
                                                                            console.error('Actrice non trouvée dans la liste des actrices');
                                                                        }
                                                                    }}
                                                                    sx={{
                                                                        cursor: 'pointer',
                                                                        '&:hover': {
                                                                            background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.4), rgba(184, 134, 11, 0.4))',
                                                                            transform: 'translateY(-1px)',
                                                                        }
                                                                    }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                                Aucune actrice associée
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Grid>

                                            <Grid size={4}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Date de la scène
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        type="date"
                                                        fullWidth
                                                        size="small"
                                                        value={formData.date_scene || ''}
                                                        onChange={(e) => handleInputChange('date_scene', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        📅 {selectedItem.date_scene ? new Date(selectedItem.date_scene).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 7 : Studio et Site */}
                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Studio
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        value={formData.studio || ''}
                                                        onChange={(e) => handleInputChange('studio', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        {selectedItem.studio || 'Non spécifié'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Site
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        value={formData.site || ''}
                                                        onChange={(e) => handleInputChange('site', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        {selectedItem.site || 'Non spécifié'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 8 : Chemin de la miniature */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Miniature (ActriceName/filename.jpg)
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Alexa Payne/scene.jpg"
                                                        value={formData.image_short || ''}
                                                        onChange={(e) => handleInputChange('image_short', e.target.value)}
                                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Intyma/miniatures/'"
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.85rem',
                                                                fontFamily: 'monospace',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{
                                                        color: '#888',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.8rem',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {selectedItem.image || 'Aucun chemin défini'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 9 : Chemin du fichier */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Vidéo (ActriceName/filename.mp4)
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Alexa Payne/scene.mp4"
                                                        value={formData.chemin_short || ''}
                                                        onChange={(e) => handleInputChange('chemin_short', e.target.value)}
                                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Privé/M364TR0N/'"
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.85rem',
                                                                fontFamily: 'monospace',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{
                                                        color: '#888',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.8rem',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {selectedItem.chemin || 'Aucun chemin défini'}
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        // Contenu détaillé pour les actrices
                                        <Grid container spacing={2}>
                                            {/* Ligne 1 : Nom */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Nom
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        value={formData.nom || ''}
                                                        onChange={(e) => handleInputChange('nom', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="h5" sx={{ color: '#F4D03F', mb: 2 }}>
                                                        {selectedItem.nom}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 2 : Nationalité et Date de naissance + Âge */}
                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Nationalité
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        value={formData.nationalite || ''}
                                                        onChange={(e) => handleInputChange('nationalite', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        🌍 {selectedItem.nationalite || 'Non spécifiée'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Date de naissance
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        type="date"
                                                        fullWidth
                                                        size="small"
                                                        value={formData.date_naissance || ''}
                                                        onChange={(e) => handleInputChange('date_naissance', e.target.value)}
                                                        InputLabelProps={{ shrink: true }}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.95rem',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#fff' }}>
                                                        📅 {selectedItem.date_naissance ? new Date(selectedItem.date_naissance).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                                                        {selectedItem.date_naissance && (
                                                            <>
                                                                {' '}({calculateAge(selectedItem.date_naissance)} ans)
                                                            </>
                                                        )}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 3 : Note moyenne et Dernière vue */}
                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Note moyenne
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Star sx={{ color: '#DAA520' }} />
                                                    <Typography variant="body1" sx={{ color: '#F4D03F' }}>
                                                        {selectedItem.note_moyenne || '0'}/5
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Ligne 3 bis : Nombre de scènes */}
                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Nombre de scènes
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    🎬 {countScenesByActrice(selectedItem.id)} scène{countScenesByActrice(selectedItem.id) !== 1 ? 's' : ''}
                                                </Typography>
                                            </Grid>

                                            <Grid size={6}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Dernière vue
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#fff' }}>
                                                    👁️ {selectedItem.derniere_vue ? new Date(selectedItem.derniere_vue).toLocaleDateString('fr-FR') : 'Jamais vue'}
                                                </Typography>
                                            </Grid>

                                            {/* Ligne 4 : Tags typiques */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Tags typiques
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedItem.tags_typiques ? (
                                                        selectedItem.tags_typiques.split(',').map((tag, index) => (
                                                            <StyledChip
                                                                key={index}
                                                                label={tag.trim()}
                                                                size="small"
                                                            />
                                                        ))
                                                    ) : (
                                                        <Typography variant="body2" sx={{ color: '#888', fontStyle: 'italic' }}>
                                                            Aucun tag typique
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Grid>

                                            {/* Ligne 5 : Biographie */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Biographie
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                        size="small"
                                                        value={formData.biographie || ''}
                                                        onChange={(e) => handleInputChange('biographie', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                fontSize: '0.95rem'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                                                        {selectedItem.biographie || 'Aucune biographie disponible'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 6 : Commentaire */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Commentaire
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        multiline
                                                        rows={2}
                                                        size="small"
                                                        value={formData.commentaire || ''}
                                                        onChange={(e) => handleInputChange('commentaire', e.target.value)}
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                fontSize: '0.95rem'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body1" sx={{ color: '#ccc', fontStyle: 'italic' }}>
                                                        {selectedItem.commentaire || 'Aucun commentaire'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Ligne 7 : Chemin de la photo */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Photo (ActriceName/filename.jpg)
                                                </Typography>
                                                {editMode ? (
                                                    <StyledTextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Reagan Foxx/reagan-foxx.jpg"
                                                        value={formData.photo_short || ''}
                                                        onChange={(e) => handleInputChange('photo_short', e.target.value)}
                                                        helperText="Format: Nom de l'actrice/nom du fichier. Sera automatiquement préfixé par '/Volumes/My Passport for Mac/Intyma/images/'"
                                                        sx={{
                                                            '& .MuiInputBase-root': {
                                                                minHeight: '48px',
                                                                fontSize: '0.85rem',
                                                                fontFamily: 'monospace',
                                                                padding: '12px 16px'
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" sx={{
                                                        color: '#888',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.8rem',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {selectedItem.photo || 'Aucun chemin défini'}
                                                    </Typography>
                                                )}
                                            </Grid>

                                            {/* Section liste des scènes (optionnel) */}
                                            <Grid size={12}>
                                                <Typography variant="subtitle1" sx={{ color: '#B8860B', mb: 1 }}>
                                                    Scènes de {selectedItem.nom}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {getScenesByActrice(selectedItem.id).slice(0, 5).map((scene) => (
                                                        <StyledChip
                                                            key={scene.id}
                                                            label={scene.titre}
                                                            size="small"
                                                            onClick={() => handleCardClick(scene, 'scene')}
                                                            sx={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                    {getScenesByActrice(selectedItem.id).length > 5 && (
                                                        <Typography variant="caption" sx={{ color: '#888', alignSelf: 'center' }}>
                                                            +{getScenesByActrice(selectedItem.id).length - 5} autres...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* Actions supplémentaires en bas du modal */}
                                    {!editMode && (
                                        <Box sx={{
                                            mt: 4,
                                            pt: 3,
                                            borderTop: '1px solid rgba(218, 165, 32, 0.2)',
                                            display: 'flex',
                                            gap: 2,
                                            justifyContent: 'center',
                                            flexWrap: 'wrap'
                                        }}>
                                            {selectedItem?.type === 'scene' && (
                                                <>
                                                    <Button
                                                        startIcon={<PlayArrow />}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #4CAF50, #45A049)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            px: 3,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #5CBF60, #4CAF50)',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
                                                    >
                                                        Lire la vidéo
                                                    </Button>
                                                    <Button
                                                        startIcon={<Favorite />}
                                                        onClick={() => addToFavorites(selectedItem.id)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #FF6B9D, #FF5722)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            px: 3,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #FF7BAD, #FF6B9D)',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
                                                    >
                                                        Ajouter aux favoris
                                                    </Button>
                                                    <Button
                                                        startIcon={<Delete />}
                                                        onClick={() => removeFromFavorites(selectedItem.id)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #FF8A80, #F44336)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            px: 3,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #FFAB91, #FF8A80)',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
                                                    >
                                                        Supprimer des favoris
                                                    </Button>
                                                    <Button
                                                        startIcon={<Visibility />}
                                                        onClick={() => addToHistory(selectedItem.id)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            px: 3,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #42A5F5, #2196F3)',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
                                                    >
                                                        Marquer comme vue
                                                    </Button>
                                                    <Button
                                                        startIcon={<Delete />}
                                                        onClick={() => removeFromHistory(selectedItem.id)}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #90CAF9, #2196F3)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            px: 3,
                                                            '&:hover': {
                                                                background: 'linear-gradient(135deg, #BBDEFB, #90CAF9)',
                                                                transform: 'translateY(-1px)'
                                                            }
                                                        }}
                                                    >
                                                        Supprimer de l'historique
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                startIcon={<Delete />}
                                                onClick={() => {
                                                    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                                                        handleDelete(selectedItem.id, selectedItem.type);
                                                        handleCloseDetail();
                                                    }
                                                }}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #E57373, #F44336)',
                                                        transform: 'translateY(-1px)'
                                                    }
                                                }}
                                            >
                                                Supprimer définitivement
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </>
                        )}
                    </DetailModalContent>
                </Fade>
            </DetailModal>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    sx={{
                        width: '100%',
                        background: snackbar.severity === 'success'
                            ? 'linear-gradient(135deg, #DAA520, #B8860B)'
                            : undefined,
                        color: snackbar.severity === 'success' ? '#000' : undefined,
                        fontWeight: 500,
                        borderRadius: '12px',
                        border: '1px solid rgba(218, 165, 32, 0.3)'
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AdminContainer>
    );
}