// src/components/auth/SignIn.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, TextField, Alert } from "@mui/material";
import { Login } from "@mui/icons-material";
import Button from "@/components/common/Button";
import { sendOTP } from "@/redux/actions/authActions";

export default function SignIn({ onOTPSent, onSwitchToSignUp }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Send OTP
    const result = await dispatch(sendOTP(email));

    if (result.success) {
      onOTPSent(email, result.data.isNewUser);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "#000",
        }}
      >
        Welcome Back
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 4,
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        Stream anytime, anywhere with seamless experience.
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: "#000",
            }}
          >
            Enter your email
          </Typography>
          <TextField
            fullWidth
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            error={!!emailError}
            helperText={emailError}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "#ffd700",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ffd700",
                },
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="danger"
          fullWidth
          size="large"
          disabled={loading}
          startIcon={<Login />}
          sx={{
            mb: 3,
            backgroundColor: "#e74c3c",
            "&:hover": {
              backgroundColor: "#c0392b",
            },
          }}
        >
          {loading ? "Sending OTP..." : "Sign in"}
        </Button>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
            Don't have an account?{" "}
            <Typography
              component="span"
              sx={{
                color: "#e74c3c",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={onSwitchToSignUp}
            >
              Register
            </Typography>
          </Typography>
        </Box>
      </form>
    </Box>
  );
}
