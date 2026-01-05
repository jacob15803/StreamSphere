import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, CircularProgress } from '@mui/material';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Button,
  Divider,
  Tabs,
  Tab,
  TextField,
  Alert,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AccountInformationPanel from '@/components/profile/AccountInformationPanel';
import LogoutButton from '@/components/profile/LogoutButton';
import FavoritesSection from '@/components/profile/FavoritesSection';

export default function Profile() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: '',
    name: '',
    email: '',
    phone: '',
  });
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/v1/current/user');
        setUser(response.data.user);
        // Pre-fill payment form with user data
        setPaymentData(prev => ({
          ...prev,
          name: response.data.user?.name || '',
          email: response.data.user?.email || '',
          phone: response.data.user?.phone || '',
        }));
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUser();
      // TODO: Fetch favorites when API is available
      // fetchFavorites();
    }
  }, [isAuthenticated]);

  const handleUpdateUser = async (updatedUser) => {
    try {
      // TODO: Implement update user API call
      // await api.put(`/api/v1/update/user/${user._id}`, updatedUser);
      setUser({ ...user, ...updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update profile');
  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPaymentError('');
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value,
    }));
    setPaymentError('');
  };

  const handleRazorpayPayment = async () => {
    // Validate form
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      setPaymentError('Please enter a valid amount');
      return;
    }
    if (!paymentData.name || !paymentData.email || !paymentData.phone) {
      setPaymentError('Please fill in all required fields');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      // Create order on backend (you'll need to create this endpoint)
      // For now, we'll use a mock order creation
      const orderData = {
        amount: parseFloat(paymentData.amount) * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          description: paymentData.description || 'Payment',
          name: paymentData.name,
          email: paymentData.email,
          phone: paymentData.phone,
        },
      };

      // Call your backend API to create order
      // const response = await api.post('/api/v1/payments/create-order', orderData);
      // const { orderId, amount, currency } = response.data;

      // For demo purposes, using mock data
      // In production, replace this with actual API call
      const mockOrderId = `order_${Date.now()}`;
      const amount = orderData.amount;
      const currency = orderData.currency;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay key
        amount: amount,
        currency: currency,
        name: 'StreamSphere',
        description: paymentData.description || 'Payment for StreamSphere',
        order_id: mockOrderId, // In production, use actual order_id from backend
        handler: function (response) {
          // Handle successful payment
          console.log('Payment successful:', response);
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          // You can call your backend to verify payment
          // api.post('/api/v1/payments/verify', { ...response, orderId: mockOrderId });
        },
        prefill: {
          name: paymentData.name,
          email: paymentData.email,
          contact: paymentData.phone,
        },
        theme: {
          color: '#ffd700',
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response);
        setPaymentError(response.error.description || 'Payment failed. Please try again.');
        setPaymentLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
      setPaymentLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        <CircularProgress sx={{ color: '#ffd700' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>User Profile - StreamSphere</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#000',
          pt: { xs: 10, md: 12 },
          pb: 8,
          position: 'relative',
          backgroundImage: 'url("/hero_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <ProfileHeader user={user} />

          <AccountInformationPanel user={user} onUpdate={handleUpdateUser} />

          <LogoutButton onLogout={logout} />

          <FavoritesSection favorites={favorites} />
        </Container>
      </Box>
      <Footer />
    </>
  );
}
