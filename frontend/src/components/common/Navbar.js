// src/components/common/Navbar.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Toolbar, Box, Chip } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import { Stars } from "@mui/icons-material";
import Link from "next/link";
import Button from "@/components/common/Button";
import AuthModal from "@/components/auth/AuthModal";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { loadUserFromStorage } from "@/redux/actions/authActions";
import { getSubscriptionStatus } from "@/redux/actions/subscriptionActions";

export default function Navbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getSubscriptionStatus());
    }
  }, [isAuthenticated, dispatch]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isPremium = currentSubscription?.isPremium;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: scrolled ? "rgba(0, 0, 0, 0.17)" : "rgba(0, 0, 0, 0)",
          backdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
          boxShadow: scrolled ? "0 2px 10px rgba(0, 0, 0, 0.5)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo Section */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
            >
              <MovieIcon sx={{ fontSize: 32, color: "#fff" }} />
              <Box
                component="span"
                sx={{
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#fff",
                  fontFamily: "serif",
                }}
              >
                StreamSphere
              </Box>
            </Box>
          </Link>

          {/* Navigation Links */}
          <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  "&:hover": { color: "#ffd700" },
                }}
              >
                Home
              </Box>
            </Link>

            <Link href="/movies" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  "&:hover": { color: "#ffd700" },
                }}
              >
                Movies
              </Box>
            </Link>

            <Link href="/series" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  "&:hover": { color: "#ffd700" },
                }}
              >
                Series
              </Box>
            </Link>

            {/* Premium Link - Show for all authenticated users */}
            {isAuthenticated && (
              <Link href="/subscription" style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      color: isPremium ? "#ffd700" : "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                      fontWeight: isPremium ? 600 : 400,
                      "&:hover": { color: "#ffd700" },
                    }}
                  >
                    {isPremium ? "Premium" : "Go Premium"}
                  </Box>
                  {isPremium && (
                    <Stars sx={{ fontSize: 18, color: "#ffd700" }} />
                  )}
                </Box>
              </Link>
            )}
          </Box>

          {/* Auth Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Premium Badge */}
            {isAuthenticated && isPremium && (
              <Chip
                icon={<Stars />}
                label="Premium"
                size="small"
                sx={{
                  backgroundColor: "#ffd700",
                  color: "#000",
                  fontWeight: 600,
                  display: { xs: "none", sm: "flex" },
                }}
              />
            )}

            {isAuthenticated && user ? (
              <UserProfileDropdown />
            ) : (
              <Button
                variant="primary"
                size="small"
                borderRadius="20px"
                textSize="12px"
                onClick={handleOpenAuthModal}
              >
                Start Streaming
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
}
