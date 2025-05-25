import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Avatar,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    Person as PersonIcon,
    Close as CloseIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// =================== STYLES PERSONNALISÉS ===================

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a1a1a 100%)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    zIndex: 1100,
    '& .MuiToolbar-root': {
        minHeight: '80px',
        padding: '0 32px',
        justifyContent: 'space-between',
    }
}));

const Logo = styled('img')({
    height: '100px',
    width: 'auto',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    filter: 'drop-shadow(0 2px 8px rgba(218, 165, 32, 0.3))',
    marginRight: '16px',
    '&:hover': {
        transform: 'scale(1.05)',
        filter: 'drop-shadow(0 4px 12px rgba(218, 165, 32, 0.5))',
    }
});

const NavButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'isActive'
})(({ isActive }) => ({
    color: isActive ? '#DAA520' : '#e0e0e0',
    fontSize: '16px',
    fontWeight: isActive ? 600 : 400,
    fontFamily: '"Inter", "Roboto", sans-serif',
    textTransform: 'none',
    letterSpacing: '0.5px',
    margin: '0 8px',
    padding: '8px 16px',
    borderRadius: '8px',
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isActive
        ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)'
        : 'transparent',
    border: isActive ? '1px solid rgba(218, 165, 32, 0.3)' : '1px solid transparent',

    '&::before': {
        content: '""',
        position: 'absolute',
        bottom: '-2px',
        left: '50%',
        width: isActive ? '80%' : '0%',
        height: '2px',
        background: 'linear-gradient(90deg, #DAA520, #B8860B, #CD853F)',
        transform: 'translateX(-50%)',
        transition: 'width 0.3s ease',
        borderRadius: '2px',
    },

    '&:hover': {
        color: '#DAA520',
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 15px rgba(218, 165, 32, 0.2)',

        '&::before': {
            width: '80%',
        }
    },

    '&:active': {
        transform: 'translateY(0px)',
    }
}));

// Nouveau style pour le bouton Admin
const AdminButton = styled(IconButton)({
    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF8C42 100%)',
    color: '#fff',
    margin: '0 8px',
    padding: '10px',
    borderRadius: '12px',
    boxShadow: '0 3px 12px rgba(255, 107, 53, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',

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
        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
        background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 50%, #F7931E 100%)',

        '&::before': {
            left: '100%',
        }
    }
});

const PremiumButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 50%, #CD853F 100%)',
    color: '#000',
    fontWeight: 600,
    fontSize: '14px',
    textTransform: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',

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
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(218, 165, 32, 0.4)',
        background: 'linear-gradient(135deg, #F4D03F 0%, #DAA520 50%, #B8860B 100%)',

        '&::before': {
            left: '100%',
        }
    }
});

const MobileDrawer = styled(Drawer)({
    '& .MuiDrawer-paper': {
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        width: '280px',
        padding: '20px',
        borderRight: '1px solid rgba(218, 165, 32, 0.2)',
    }
});

const MobileNavItem = styled(ListItem, {
    shouldForwardProp: (prop) => prop !== 'isActive'
})(({ isActive }) => ({
    marginBottom: '8px',
    borderRadius: '8px',
    background: isActive
        ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)'
        : 'transparent',
    border: isActive ? '1px solid rgba(218, 165, 32, 0.3)' : '1px solid transparent',

    '& .MuiListItemText-primary': {
        color: isActive ? '#DAA520' : '#e0e0e0',
        fontWeight: isActive ? 600 : 400,
        fontSize: '16px',
    },

    '&:hover': {
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)',
        '& .MuiListItemText-primary': {
            color: '#DAA520',
        }
    }
}));

// =================== DONNÉES DE NAVIGATION ===================

const navigationItems = [
    { label: 'Accueil', path: '/', id: 'accueil' },
    { label: 'Découvrir', path: '/decouvrir', id: 'decouvrir' },
    { label: 'Collections', path: '/collections', id: 'collections' },
    { label: 'Favoris', path: '/favoris', id: 'favoris' },
    { label: 'Historique', path: '/historique', id: 'historique' },
];

// =================== COMPOSANT PRINCIPAL ===================

const Header = ({
                    currentPath = '/',
                    onNavigate = () => {},
                    logoSrc = '/logo-intyma.png',
                    logoAlt = 'Intyma',
                    userAvatar = null,
                    userName = 'Privé',
                    showAdminButton = false  // Nouveau prop
                }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    // Fonction pour déterminer si un lien est actif
    const isActiveLink = (path) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    // Gestion de la navigation
    const handleNavigation = (path) => {
        onNavigate(path);
        setMobileOpen(false);
    };

    // Gestion du menu mobile
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Composant Desktop Navigation
    const DesktopNav = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navigationItems.map((item) => (
                <NavButton
                    key={item.id}
                    isActive={isActiveLink(item.path)}
                    onClick={() => handleNavigation(item.path)}
                >
                    {item.label}
                </NavButton>
            ))}
        </Box>
    );

    // Composant Mobile Navigation
    const MobileNav = () => (
        <MobileDrawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#DAA520', fontWeight: 600 }}>
                    Navigation
                </Typography>
                <IconButton onClick={handleDrawerToggle} sx={{ color: '#e0e0e0' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <List>
                {navigationItems.map((item) => (
                    <MobileNavItem
                        key={item.id}
                        button
                        isActive={isActiveLink(item.path)}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <ListItemText primary={item.label} />
                    </MobileNavItem>
                ))}

                {/* Bouton Admin en mobile */}
                {showAdminButton && (
                    <MobileNavItem
                        button
                        isActive={currentPath === '/admin'}
                        onClick={() => handleNavigation('/admin')}
                    >
                        <ListItemText
                            primary="⚙️ Administration"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    color: '#FF6B35 !important',
                                    fontWeight: '600 !important'
                                }
                            }}
                        />
                    </MobileNavItem>
                )}

                {/* Bouton Privé en mobile */}
                <Box sx={{ mt: 3, px: 2 }}>
                    <PremiumButton
                        fullWidth
                        startIcon={userAvatar ? <Avatar src={userAvatar} sx={{ width: 24, height: 24 }} /> : <PersonIcon />}
                        onClick={() => handleNavigation('/prive')}
                    >
                        {userName}
                    </PremiumButton>
                </Box>
            </List>
        </MobileDrawer>
    );

    return (
        <>
            <StyledAppBar position="fixed">
                <Toolbar>
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Logo
                            src={logoSrc}
                            alt={logoAlt}
                            onClick={() => handleNavigation('/')}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <Typography
                            variant="h5"
                            sx={{
                                display: 'none',
                                color: '#DAA520',
                                fontWeight: 700,
                                fontFamily: '"Playfair Display", serif',
                                cursor: 'pointer',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                            onClick={() => handleNavigation('/')}
                        >
                            Intyma
                        </Typography>
                    </Box>

                    {/* Navigation Desktop */}
                    {!isMobile && (
                        <>
                            <DesktopNav />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {/* Bouton Admin Desktop */}
                                {showAdminButton && (
                                    <AdminButton
                                        onClick={() => handleNavigation('/admin')}
                                        title="Administration"
                                    >
                                        <SettingsIcon />
                                    </AdminButton>
                                )}

                                {/* Bouton Privé Desktop */}
                                <PremiumButton
                                    startIcon={userAvatar ? <Avatar src={userAvatar} sx={{ width: 24, height: 24 }} /> : <PersonIcon />}
                                    onClick={() => handleNavigation('/prive')}
                                >
                                    {userName}
                                </PremiumButton>
                            </Box>
                        </>
                    )}

                    {/* Menu Burger Mobile */}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="ouvrir menu"
                            edge="end"
                            onClick={handleDrawerToggle}
                            sx={{
                                color: '#e0e0e0',
                                '&:hover': {
                                    color: '#DAA520',
                                    background: 'rgba(218, 165, 32, 0.1)'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </StyledAppBar>

            {/* Navigation Mobile */}
            {isMobile && <MobileNav />}

            {/* Spacer pour compenser la navbar fixe */}
            <Box sx={{ height: '80px' }} />
        </>
    );
};

export default Header;