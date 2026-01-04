// src/components/auth/AuthModal.js
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import OTPVerification from "./OTPVerification";

export default function AuthModal({ open, onClose }) {
  const [view, setView] = useState("signin"); // 'signin', 'signup', 'otp', 'register'
  const [email, setEmail] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleClose = () => {
    setView("signin");
    setEmail("");
    setIsNewUser(false);
    onClose();
  };

  const handleOTPSent = (emailValue, newUser) => {
    setEmail(emailValue);
    setIsNewUser(newUser);
    setView("otp");
  };

  const handleOTPVerified = () => {
    if (isNewUser) {
      setView("register");
    } else {
      handleClose(); // Existing user logged in
    }
  };

  const handleRegisterComplete = () => {
    handleClose();
  };

  const switchToSignIn = () => setView("signin");
  const switchToSignUp = () => setView("signup");

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "#fff",
          overflow: "hidden",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "#e74c3c",
          zIndex: 1,
        }}
      >
        <Close />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            minHeight: 500,
          }}
        >
          {/* Left Side - Cinema Image */}
          <Box
            sx={{
              flex: 1,
              backgroundImage: 'url("/hero_bg.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: { xs: "none", md: "block" },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.4)",
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 40,
                left: 40,
                color: "#fff",
                zIndex: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  mb: 1,
                }}
              >
                Cinephile
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                A person who enjoys or is very
                <br />
                interested in movies; a film enthusiast
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Auth Forms */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {view === "signin" && (
              <SignIn
                onOTPSent={handleOTPSent}
                onSwitchToSignUp={switchToSignUp}
              />
            )}

            {view === "signup" && (
              <SignUp
                onOTPSent={handleOTPSent}
                onSwitchToSignIn={switchToSignIn}
              />
            )}

            {view === "otp" && (
              <OTPVerification
                email={email}
                isNewUser={isNewUser}
                onVerified={handleOTPVerified}
                onBack={() => setView(isNewUser ? "signup" : "signin")}
              />
            )}

            {view === "register" && (
              <SignUp
                email={email}
                isRegistration={true}
                onRegistrationComplete={handleRegisterComplete}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
