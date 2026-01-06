import { useEffect, useState } from 'react';
import { Box, Paper, Typography, TextField, Alert, Button } from '@mui/material';
 
const inputSX = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset, &.Mui-focused fieldset': { borderColor: '#ffd700' },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.6)',
    '&.Mui-focused': { color: '#ffd700' },
  },
};
 
export default function PaymentPanel({ user }) {
  const [data, setData] = useState({
    amount: '',
    description: '',
    name: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
    return () => document.body.removeChild(s);
  }, []);
 
  useEffect(() => {
    if (user) setData(d => ({ ...d, name: user.name, email: user.email, phone: user.phone }));
  }, [user]);
 
  const onChange = e => setData({ ...data, [e.target.name]: e.target.value });
 
  const pay = () => {
    if (!data.amount || !data.name || !data.email || !data.phone)
      return setError('All fields are required');
 
    setLoading(true);
    setError('');
 
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount * 100,
      currency: 'INR',
      name: 'StreamSphere',
      description: data.description || 'Subscription Payment',
      handler: () => {
        alert('Payment Successful');
        setLoading(false);
      },
      prefill: data,
      theme: { color: '#ffd700' },
      modal: { ondismiss: () => setLoading(false) },
    };
 
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', e => {
      setError(e.error.description);
      setLoading(false);
    });
    rzp.open();
  };
 
  return (
    <Paper sx={{ p: 4, backgroundColor: '#2a2a2a', borderRadius: 2 }}>
      <Typography variant="h5" sx={{ color: '#ffd700', mb: 3 }}>
        Add Plans
      </Typography>
 
      {error && <Alert severity="error">{error}</Alert>}
 
      <Box sx={{ display: 'grid', gap: 3 }}>
        {['amount', 'description', 'name', 'email', 'phone'].map(field => (
          <TextField
            key={field}
            name={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            type={field === 'amount' ? 'number' : 'text'}
            value={data[field]}
            onChange={onChange}
            sx={inputSX}
            fullWidth
          />
        ))}
 
        <Button
          fullWidth
          onClick={pay}
          disabled={loading}
          sx={{ py: 1.5, fontWeight: 600, bgcolor: '#ffd700', color: '#000' }}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </Box>
    </Paper>
  );
}
 

