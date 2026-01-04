// src/components/common/Navbar.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Toolbar, Box } from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";
import Link from "next/link";
import Button from "@/components/common/Button";
import AuthModal from "@/components/auth/AuthModal";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { loadUserFromStorage } from "@/redux/actions/authActions";

export default function Navbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Load user from localStorage on component mount
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "rgba(0, 0, 0, 0)",
          backdropFilter: "blur(0px)",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
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
          <Box sx={{ display: "flex", gap: 4 }}>
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

            <Link href="/about" style={{ textDecoration: "none" }}>
              <Box
                component="span"
                sx={{
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  "&:hover": { color: "#ffd700" },
                }}
              >
                About
              </Box>
            </Link>
          </Box>

          {/* Auth Section */}
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
        </Toolbar>
      </AppBar>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onClose={handleCloseAuthModal} />
    </>
  );
}
