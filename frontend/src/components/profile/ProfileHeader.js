import { Box, Avatar, Typography } from '@mui/material';
import { Person as PersonIcon, WorkspacePremium as PremiumIcon } from '@mui/icons-material';

export default function ProfileHeader({ user }) {
  const getMemberSince = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isPremium = user?.subscriptionType === 'premium' || user?.subscriptionType === 'Premium';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 4,
        mb: 5,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      {/* Large Profile Avatar on Left */}
      <Avatar
        sx={{
          width: { xs: 120, md: 160 },
          height: { xs: 120, md: 160 },
          backgroundColor: '#d32f2f',
          color: '#fff',
          fontSize: { xs: '3.5rem', md: '4.5rem' },
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {user?.name?.charAt(0)?.toUpperCase() || (
          <PersonIcon sx={{ fontSize: { xs: '3.5rem', md: '4.5rem' } }} />
        )}
      </Avatar>

      {/* Name, Member Since, and Premium Badge */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 600,
              color: '#fff',
              fontSize: { xs: '2rem', md: '2.75rem' },
              lineHeight: 1.2,
            }}
          >
            {user?.name || 'User'}
          </Typography>
          {isPremium && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                backgroundColor: '#ffd700',
                color: '#000',
                px: 2.5,
                py: 0.75,
                borderRadius: 1,
                fontWeight: 700,
                fontSize: '0.875rem',
                height: 'fit-content',
              }}
            >
              <PremiumIcon sx={{ fontSize: '1.1rem' }} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1 }}>
                Premium
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.75)',
            fontSize: '1rem',
            fontWeight: 400,
          }}
        >
          Member since {getMemberSince()}
        </Typography>
      </Box>
    </Box>
  );
}

