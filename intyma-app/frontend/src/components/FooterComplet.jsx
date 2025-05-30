import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Link,
    TextField,
    Button,
    IconButton,
    Grid,
    Divider,
    Fab,
    Fade,
    Zoom,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    KeyboardArrowUp,
    Email,
    Send,
    Twitter,
    Instagram,
    YouTube,
    Facebook,
    LinkedIn,
    Reddit,
    Telegram
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// =================== ANIMATIONS ===================

const sparkle = keyframes`
    0%, 100% { 
        opacity: 0; 
        transform: translateY(0px) scale(0.8); 
    }
    50% { 
        opacity: 1; 
        transform: translateY(-8px) scale(1.2); 
    }
`;

const floatingSparkles = keyframes`
    0% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.3; 
    }
    50% { 
        transform: translateY(-20px) rotate(180deg); 
        opacity: 0.8; 
    }
    100% { 
        transform: translateY(-40px) rotate(360deg); 
        opacity: 0; 
    }
`;

const shimmer = keyframes`
    0% { 
        background-position: -200% 0; 
    }
    100% { 
        background-position: 200% 0; 
    }
`;

const glow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px rgba(218, 165, 32, 0.3); 
    }
    50% { 
        box-shadow: 0 0 30px rgba(218, 165, 32, 0.6), 0 0 40px rgba(205, 133, 63, 0.4); 
    }
`;

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const pulseGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 15px rgba(218, 165, 32, 0.4);
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 0 25px rgba(218, 165, 32, 0.7), 0 0 35px rgba(205, 133, 63, 0.5);
        transform: scale(1.05);
    }
`;

// =================== STYLES PERSONNALISÉS ===================

const FooterContainer = styled(Box)(({ theme }) => ({
    background: `
        linear-gradient(135deg, 
            rgba(10, 10, 10, 0.98) 0%, 
            rgba(26, 26, 26, 0.95) 30%, 
            rgba(42, 42, 42, 0.98) 70%, 
            rgba(15, 15, 15, 0.99) 100%
        ),
        radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(205, 133, 63, 0.02) 0%, transparent 50%)
    `,
    borderTop: '1px solid rgba(218, 165, 32, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: '60px',
    paddingBottom: '20px',
    marginTop: 'auto',

    // Ligne dorée en haut
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #DAA520, #CD853F, #B8860B, transparent)',
        animation: `${shimmer} 3s ease-in-out infinite`,
    },

    // Particules flottantes
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
            radial-gradient(2px 2px at 20px 30px, rgba(218, 165, 32, 0.3), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(205, 133, 63, 0.2), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(184, 134, 11, 0.4), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(218, 165, 32, 0.2), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(205, 133, 63, 0.3), transparent)
        `,
        animation: `${floatingSparkles} 8s ease-in-out infinite`,
        pointerEvents: 'none',
        opacity: 0.6
    },

    [theme.breakpoints.down('md')]: {
        paddingTop: '40px',
    }
}));

const StyledContainer = styled(Container)({
    position: 'relative',
    zIndex: 2,
    animation: `${fadeInUp} 1s ease-out`,
});

const LogoSection = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: '40px',
    animation: `${fadeInUp} 1s ease-out 0.2s both`,

    [theme.breakpoints.up('md')]: {
        textAlign: 'left',
        marginBottom: '0',
    }
}));

const FooterLogo = styled(Typography)({
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 700,
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    background: 'linear-gradient(135deg, #DAA520, #CD853F, #B8860B)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    textShadow: '0 2px 10px rgba(218, 165, 32, 0.3)',
    marginBottom: '12px',
    letterSpacing: '-1px',
    position: 'relative',

    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
        borderRadius: '1px',
    },

    '@media (min-width: 960px)': {
        '&::after': {
            left: '0',
            transform: 'none',
        }
    }
});

const Tagline = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontStyle: 'italic',
    fontSize: '1rem',
    color: '#CD853F',
    marginBottom: '24px',
    lineHeight: 1.4,
    opacity: 0.9,
    fontWeight: 300,
});

const SectionTitle = styled(Typography)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    fontWeight: 600,
    fontSize: '1.1rem',
    color: '#F5E6D3',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',

    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-4px',
        left: 0,
        width: '30px',
        height: '1px',
        background: '#DAA520',
    }
});

const FooterLink = styled(Link)({
    fontFamily: '"Inter", "Roboto", sans-serif',
    color: '#B8B8B8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'block',
    marginBottom: '8px',
    position: 'relative',
    paddingLeft: '0',

    '&:hover': {
        color: '#DAA520',
        paddingLeft: '8px',
        textShadow: '0 0 8px rgba(218, 165, 32, 0.4)',

        '&::before': {
            width: '4px',
        }
    },

    '&::before': {
        content: '""',
        position: 'absolute',
        left: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '0',
        height: '12px',
        background: 'linear-gradient(135deg, #DAA520, #CD853F)',
        borderRadius: '2px',
        transition: 'width 0.3s ease',
    },

    '&:focus-visible': {
        outline: '2px solid #DAA520',
        outlineOffset: '2px',
        borderRadius: '2px',
    }
});

const SocialIconsContainer = styled(Box)({
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '20px',

    '@media (min-width: 960px)': {
        justifyContent: 'flex-start',
    }
});

const SocialIcon = styled(IconButton)({
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.1), rgba(205, 133, 63, 0.1))',
    border: '1px solid rgba(218, 165, 32, 0.3)',
    color: '#CD853F',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0)',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(218, 165, 32, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        transition: 'transform 0.4s ease',
    },

    '&:hover': {
        color: '#DAA520',
        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(205, 133, 63, 0.2))',
        borderColor: '#DAA520',
        transform: 'translateY(-2px) scale(1.05)',
        animation: `${glow} 2s infinite`,

        '&::before': {
            transform: 'translate(-50%, -50%) scale(1)',
        }
    },

    '&:focus-visible': {
        outline: '2px solid #DAA520',
        outlineOffset: '2px',
    }
});

const NewsletterSection = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.05), rgba(205, 133, 63, 0.05))',
    border: '1px solid rgba(218, 165, 32, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '40px',
    position: 'relative',
    overflow: 'hidden',

    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.1), transparent)',
        animation: `${shimmer} 3s ease-in-out infinite`,
    },

    [theme.breakpoints.down('md')]: {
        padding: '20px',
    }
}));

const NewsletterTitle = styled(Typography)({
    fontFamily: '"Playfair Display", serif',
    fontWeight: 600,
    fontSize: '1.3rem',
    color: '#F5E6D3',
    marginBottom: '8px',
    textAlign: 'center',
});

const NewsletterDescription = styled(Typography)({
    color: '#CD853F',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginBottom: '20px',
    fontStyle: 'italic',
});

const NewsletterForm = styled(Box)({
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    maxWidth: '400px',
    margin: '0 auto',

    '@media (max-width: 600px)': {
        flexDirection: 'column',
        gap: '16px',
    }
});

const StyledTextField = styled(TextField)({
    flex: 1,

    '& .MuiInputBase-root': {
        background: 'rgba(26, 26, 26, 0.8)',
        borderRadius: '8px',
        color: '#F5E6D3',

        '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(218, 165, 32, 0.5)',
            }
        },

        '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#DAA520',
                boxShadow: '0 0 8px rgba(218, 165, 32, 0.3)',
            }
        }
    },

    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(218, 165, 32, 0.3)',
    },

    '& .MuiInputLabel-root': {
        color: '#B8860B',

        '&.Mui-focused': {
            color: '#DAA520',
        }
    },

    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: '#CD853F',
    }
});

const SubscribeButton = styled(Button)({
    background: 'linear-gradient(135deg, #DAA520, #CD853F)',
    color: '#000',
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: '8px',
    textTransform: 'none',
    minWidth: '120px',
    transition: 'all 0.3s ease',
    border: 'none',

    '&:hover': {
        background: 'linear-gradient(135deg, #F4D03F, #DAA520)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(218, 165, 32, 0.4)',
    },

    '&:focus-visible': {
        outline: '2px solid #DAA520',
        outlineOffset: '2px',
    },

    '@media (max-width: 600px)': {
        width: '100%',
    }
});

const BackToTopButton = styled(Fab)({
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: 1000,
    background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(205, 133, 63, 0.9))',
    color: '#000',
    border: '2px solid rgba(218, 165, 32, 0.4)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',

    '&:hover': {
        background: 'linear-gradient(135deg, #DAA520, #CD853F)',
        transform: 'translateY(-3px) scale(1.05)',
        animation: `${pulseGlow} 2s infinite`,
    },

    '&:focus-visible': {
        outline: '2px solid #DAA520',
        outlineOffset: '2px',
    },

    '@media (max-width: 600px)': {
        bottom: '20px',
        right: '20px',
        width: '48px',
        height: '48px',
    }
});

const LegalSection = styled(Box)({
    borderTop: '1px solid rgba(218, 165, 32, 0.2)',
    paddingTop: '20px',
    marginTop: '40px',
    textAlign: 'center',
});

const LegalText = styled(Typography)({
    color: '#888',
    fontSize: '0.8rem',
    lineHeight: 1.6,

    '& a': {
        color: '#B8860B',
        textDecoration: 'none',

        '&:hover': {
            color: '#DAA520',
            textDecoration: 'underline',
        }
    }
});

const LinksGrid = styled(Grid)(({ theme }) => ({
    animation: `${fadeInUp} 1s ease-out 0.4s both`,

    [theme.breakpoints.down('md')]: {
        textAlign: 'center',
        marginBottom: '32px',
    }
}));

// =================== COMPOSANT PRINCIPAL ===================

const FooterComplet = ({
                           onNewsletterSubscribe = null,
                           showBackToTop = true,
                           socialLinks = {},
                           companyInfo = {},
                           customLinks = {}
                       }) => {
    const [email, setEmail] = useState('');
    const [showBackToTopBtn, setShowBackToTopBtn] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Gestion du bouton "Retour en haut"
    useEffect(() => {
        const toggleVisibility = () => {
            setShowBackToTopBtn(window.pageYOffset > 300);
        };

        // Déclenchement de l'animation d'apparition
        const timer = setTimeout(() => setIsVisible(true), 100);

        window.addEventListener('scroll', toggleVisibility);

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            clearTimeout(timer);
        };
    }, []);

    // Retour en haut de page
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Gestion de l'inscription newsletter
    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        if (onNewsletterSubscribe) {
            onNewsletterSubscribe(email);
        } else {
            console.log('Newsletter subscription:', email);
            // Ici vous pouvez ajouter votre logique d'inscription
        }

        setEmail('');
        // Optionnel: afficher un message de confirmation
    };

    // Configuration par défaut des liens sociaux
    const defaultSocialLinks = {
        twitter: 'https://twitter.com/intyma',
        instagram: 'https://instagram.com/intyma',
        youtube: 'https://youtube.com/@intyma',
        telegram: 'https://t.me/intyma',
        reddit: 'https://reddit.com/r/intyma',
        ...socialLinks
    };

    // Configuration par défaut des informations société
    const defaultCompanyInfo = {
        name: 'Intyma',
        year: new Date().getFullYear(),
        tagline: 'Éveillez vos sens, explorez vos désirs... en toute intimité.',
        ...companyInfo
    };

    // Configuration par défaut des liens
    const defaultLinks = {
        help: { label: 'Aide & FAQ', href: '/help' },
        contact: { label: 'Contact', href: '/contact' },
        terms: { label: 'Conditions d\'utilisation', href: '/terms' },
        privacy: { label: 'Politique de confidentialité', href: '/privacy' },
        about: { label: 'À propos', href: '/about' },
        partners: { label: 'Partenaires', href: '/partners' },
        ...customLinks
    };

    return (
        <>
            <Fade in={isVisible} timeout={1000}>
                <FooterContainer component="footer" role="contentinfo">
                    <StyledContainer maxWidth="xl">
                        {/* Section Newsletter */}
                        <NewsletterSection>
                            <NewsletterTitle>
                                ✨ Restez connecté à l'univers Intyma
                            </NewsletterTitle>
                            <NewsletterDescription>
                                Recevez en exclusivité nos dernières collections,
                                nouveautés premium et contenus spéciaux.
                            </NewsletterDescription>
                            <NewsletterForm component="form" onSubmit={handleNewsletterSubmit}>
                                <StyledTextField
                                    type="email"
                                    label="Votre adresse email"
                                    variant="outlined"
                                    size="small"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email />
                                            </InputAdornment>
                                        ),
                                    }}
                                    aria-label="Adresse email pour newsletter"
                                />
                                <SubscribeButton
                                    type="submit"
                                    variant="contained"
                                    startIcon={<Send />}
                                    aria-label="S'inscrire à la newsletter"
                                >
                                    S'inscrire
                                </SubscribeButton>
                            </NewsletterForm>
                        </NewsletterSection>

                        <Grid container spacing={4}>
                            {/* Logo et Tagline */}
                            <Grid item xs={12} md={4}>
                                <LogoSection>
                                    <FooterLogo variant="h2">
                                        {defaultCompanyInfo.name}
                                    </FooterLogo>
                                    <Tagline>
                                        {defaultCompanyInfo.tagline}
                                    </Tagline>

                                    {/* Réseaux sociaux */}
                                    <SocialIconsContainer>
                                        {defaultSocialLinks.twitter && (
                                            <Tooltip title="Suivez-nous sur Twitter/X" arrow>
                                                <SocialIcon
                                                    component="a"
                                                    href={defaultSocialLinks.twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Twitter/X Intyma"
                                                >
                                                    <Twitter />
                                                </SocialIcon>
                                            </Tooltip>
                                        )}

                                        {defaultSocialLinks.instagram && (
                                            <Tooltip title="Suivez-nous sur Instagram" arrow>
                                                <SocialIcon
                                                    component="a"
                                                    href={defaultSocialLinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Instagram Intyma"
                                                >
                                                    <Instagram />
                                                </SocialIcon>
                                            </Tooltip>
                                        )}

                                        {defaultSocialLinks.youtube && (
                                            <Tooltip title="Chaîne YouTube officielle" arrow>
                                                <SocialIcon
                                                    component="a"
                                                    href={defaultSocialLinks.youtube}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="YouTube Intyma"
                                                >
                                                    <YouTube />
                                                </SocialIcon>
                                            </Tooltip>
                                        )}

                                        {defaultSocialLinks.telegram && (
                                            <Tooltip title="Rejoignez notre Telegram" arrow>
                                                <SocialIcon
                                                    component="a"
                                                    href={defaultSocialLinks.telegram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Telegram Intyma"
                                                >
                                                    <Telegram />
                                                </SocialIcon>
                                            </Tooltip>
                                        )}

                                        {defaultSocialLinks.reddit && (
                                            <Tooltip title="Communauté Reddit" arrow>
                                                <SocialIcon
                                                    component="a"
                                                    href={defaultSocialLinks.reddit}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label="Reddit Intyma"
                                                >
                                                    <Reddit />
                                                </SocialIcon>
                                            </Tooltip>
                                        )}
                                    </SocialIconsContainer>
                                </LogoSection>
                            </Grid>

                            {/* Liens Support */}
                            <LinksGrid item xs={12} sm={6} md={2}>
                                <SectionTitle>Support</SectionTitle>
                                <Box>
                                    <FooterLink href={defaultLinks.help.href}>
                                        {defaultLinks.help.label}
                                    </FooterLink>
                                    <FooterLink href={defaultLinks.contact.href}>
                                        {defaultLinks.contact.label}
                                    </FooterLink>
                                </Box>
                            </LinksGrid>

                            {/* Liens Légal */}
                            <LinksGrid item xs={12} sm={6} md={2}>
                                <SectionTitle>Légal</SectionTitle>
                                <Box>
                                    <FooterLink href={defaultLinks.terms.href}>
                                        {defaultLinks.terms.label}
                                    </FooterLink>
                                    <FooterLink href={defaultLinks.privacy.href}>
                                        {defaultLinks.privacy.label}
                                    </FooterLink>
                                </Box>
                            </LinksGrid>

                            {/* Liens Entreprise */}
                            <LinksGrid item xs={12} sm={6} md={2}>
                                <SectionTitle>Entreprise</SectionTitle>
                                <Box>
                                    <FooterLink href={defaultLinks.about.href}>
                                        {defaultLinks.about.label}
                                    </FooterLink>
                                    <FooterLink href={defaultLinks.partners.href}>
                                        {defaultLinks.partners.label}
                                    </FooterLink>
                                </Box>
                            </LinksGrid>

                            {/* Liens Communauté */}
                            <LinksGrid item xs={12} sm={6} md={2}>
                                <SectionTitle>Communauté</SectionTitle>
                                <Box>
                                    <FooterLink href="/blog">
                                        Blog & Actualités
                                    </FooterLink>
                                    <FooterLink href="/forum">
                                        Forum Privé
                                    </FooterLink>
                                </Box>
                            </LinksGrid>
                        </Grid>

                        {/* Section légale */}
                        <LegalSection>
                            <LegalText>
                                © {defaultCompanyInfo.year} {defaultCompanyInfo.name}. Tous droits réservés.
                                <br />
                                <Box component="span" sx={{ mt: 1, display: 'block' }}>
                                    Contenu réservé aux adultes - Accès strictement interdit aux mineurs
                                    {' • '}
                                    <Link href="/privacy" color="inherit">
                                        Politique de confidentialité
                                    </Link>
                                    {' • '}
                                    <Link href="/terms" color="inherit">
                                        CGU
                                    </Link>
                                </Box>
                            </LegalText>
                        </LegalSection>
                    </StyledContainer>
                </FooterContainer>
            </Fade>

            {/* Bouton Retour en haut */}
            {showBackToTop && (
                <Zoom in={showBackToTopBtn}>
                    <BackToTopButton
                        onClick={scrollToTop}
                        aria-label="Retour en haut de page"
                        size="medium"
                    >
                        <KeyboardArrowUp />
                    </BackToTopButton>
                </Zoom>
            )}
        </>
    );
};

export default FooterComplet;