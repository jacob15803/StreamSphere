import { Button, Box } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

export default function LogoutButton({ onLogout }) {
  return (
    <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-start' }}>
      <Button
        onClick={onLogout}
        sx={{
          backgroundColor: '#d32f2f',
          color: '#fff',
          py: 1,
          px: 3,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: '#b71c1c',
          },
        }}
        endIcon={<ArrowForwardIcon sx={{ color: '#fff', fontSize: '1.2rem' }} />}
      >
        Log out
      </Button>
    </Box>
  );
}

