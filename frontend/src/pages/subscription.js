// src/pages/subscription.js
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { CheckCircle, Stars } from "@mui/icons-material";
import Button from "@/components/common/Button";
import {
  getPlans,
  getSubscriptionStatus,
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "@/redux/actions/subscriptionActions";
import { getCurrentUser } from "@/redux/actions/authActions";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function SubscriptionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { plans, currentSubscription, loading, error } = useSelector(
    (state) => state.subscription
  );

  const [processingPayment, setProcessingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getPlans());
      dispatch(getSubscriptionStatus());
    }
  }, [isAuthenticated, dispatch]);

  const handleSubscribe = async (plan) => {
    try {
      setProcessingPayment(true);

      // Load Razorpay script
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Please check your connection.");
        setProcessingPayment(false);
        return;
      }

      // Create order
      const orderResult = await dispatch(createSubscriptionOrder(plan.id));

      if (!orderResult.success) {
        alert(orderResult.error || "Failed to create order");
        setProcessingPayment(false);
        return;
      }

      const { orderId, amount, currency } = orderResult.data;

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: currency,
        name: "StreamSphere",
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResult = await dispatch(
              verifySubscriptionPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              })
            );

            if (verifyResult.success) {
              setSuccessMessage("Subscription activated successfully! 🎉");

              // Refresh user data
              await dispatch(getCurrentUser());
              await dispatch(getSubscriptionStatus());

              setTimeout(() => {
                router.push("/");
              }, 2000);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#ffd700",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  if (loading && plans.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#000",
        }}
      >
        <CircularProgress sx={{ color: "#ffd700" }} />
      </Box>
    );
  }

  const isPremium = currentSubscription?.isPremium;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        pt: 12,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              color: "#fff",
              mb: 2,
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Choose Your Plan
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              mb: 4,
            }}
          >
            Unlock unlimited streaming with premium access
          </Typography>

          {/* Current Subscription Status */}
          {isPremium && (
            <Alert
              severity="success"
              sx={{
                maxWidth: 600,
                mx: "auto",
                mb: 4,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "#4caf50",
                border: "1px solid #4caf50",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                You're currently on Premium Plan
              </Typography>
              <Typography variant="body2">
                Valid until:{" "}
                {new Date(currentSubscription.endDate).toLocaleDateString()}
                {" • "}
                {currentSubscription.daysRemaining} days remaining
              </Typography>
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              sx={{
                maxWidth: 600,
                mx: "auto",
                mb: 4,
              }}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => {
            const isRecommended = plan.id === "quarterly";
            const savings =
              plan.id === "quarterly"
                ? Math.round(((199 * 3 - plan.amount) / (199 * 3)) * 100)
                : plan.id === "yearly"
                ? Math.round(((199 * 12 - plan.amount) / (199 * 12)) * 100)
                : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card
                  sx={{
                    position: "relative",
                    height: "100%",
                    background: isRecommended
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#1a1a1a",
                    border: isRecommended
                      ? "2px solid #ffd700"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
                    },
                  }}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <Chip
                      icon={<Stars />}
                      label="BEST VALUE"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        backgroundColor: "#ffd700",
                        color: "#000",
                        fontWeight: 600,
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 4 }}>
                    {/* Plan Name */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: "#fff",
                        mb: 1,
                      }}
                    >
                      {plan.name}
                    </Typography>

                    {/* Duration */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        mb: 3,
                      }}
                    >
                      {plan.duration} days access
                    </Typography>

                    {/* Price */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          color: "#fff",
                          mb: 0.5,
                        }}
                      >
                        â‚¹{plan.amount}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        {savings > 0 && (
                          <Typography
                            component="span"
                            sx={{
                              color: "#4caf50",
                              fontWeight: 600,
                              mr: 1,
                            }}
                          >
                            Save {savings}%
                          </Typography>
                        )}
                        â‚¹{Math.round(plan.amount / (plan.duration / 30))}
                        /month
                      </Typography>
                    </Box>

                    {/* Features */}
                    <Box sx={{ mb: 4 }}>
                      {[
                        "Unlimited Movies & Series",
                        "HD Quality Streaming",
                        "Watch on Any Device",
                        "No Ads",
                        "Download & Watch Offline",
                      ].map((feature, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1.5,
                          }}
                        >
                          <CheckCircle
                            sx={{ color: "#4caf50", fontSize: 20 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Subscribe Button */}
                    <Button
                      variant={isRecommended ? "primary" : "outlined"}
                      fullWidth
                      size="large"
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPayment || isPremium}
                      sx={{
                        backgroundColor: isRecommended ? "#ffd700" : undefined,
                        color: isRecommended ? "#000" : "#fff",
                        fontWeight: 600,
                        "&:hover": {
                          backgroundColor: isRecommended
                            ? "#ffed4e"
                            : undefined,
                        },
                      }}
                    >
                      {isPremium
                        ? "Already Subscribed"
                        : processingPayment
                        ? "Processing..."
                        : "Subscribe Now"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Benefits Section */}
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#fff",
              mb: 4,
            }}
          >
            Why Go Premium?
          </Typography>

          <Grid container spacing={3}>
            {[
              {
                title: "Unlimited Access",
                description:
                  "Watch unlimited movies and series without any restrictions",
              },
              {
                title: "HD Quality",
                description:
                  "Enjoy crystal clear HD streaming on all your devices",
              },
              {
                title: "No Advertisements",
                description:
                  "Stream without interruptions - completely ad-free experience",
              },
              {
                title: "Multi-Device",
                description:
                  "Watch on TV, laptop, tablet, or mobile - anywhere, anytime",
              },
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#1a1a1a",
                    borderRadius: 2,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#ffd700",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {benefit.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default function SubscriptionPageWrapper() {
  return (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  );
}
