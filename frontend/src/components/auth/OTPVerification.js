// src/components/auth/OTPVerification.js
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, TextField, Alert } from "@mui/material";
import { VerifiedUser, ArrowBack } from "@mui/icons-material";
import Button from "@/components/common/Button";
import { verifyOTP, sendOTP } from "@/redux/actions/authActions";

export default function OTPVerification({
  email,
  isNewUser,
  onVerified,
  onBack,
}) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return;
    }

    const result = await dispatch(verifyOTP(email, otpString));

    if (result.success) {
      onVerified();
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(120);
    setOtp(["", "", "", "", "", ""]);

    await dispatch(sendOTP(email));

    // Restart timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box>
      <Button
        variant="text"
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{ mb: 2, color: "#000" }}
      >
        Back
      </Button>

      <Typography
        variant="h4"
        sx={{
          mb: 1,
          fontWeight: 600,
          color: "#000",
        }}
      >
        Verify OTP
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 4,
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        We've sent a 6-digit code to <strong>{email}</strong>
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 3,
            justifyContent: "center",
          }}
        >
          {otp.map((digit, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "24px",
                  fontWeight: 600,
                },
              }}
              sx={{
                width: 50,
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
                    borderColor: "#e74c3c",
                    borderWidth: 2,
                  },
                },
              }}
            />
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mb: 3 }}>
          {!canResend ? (
            <Typography variant="body2" sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
              Resend code in {formatTime(timer)}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "#e74c3c",
                fontWeight: 600,
                cursor: "pointer",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={handleResend}
            >
              Resend OTP
            </Typography>
          )}
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
          disabled={loading || otp.join("").length !== 6}
          startIcon={<VerifiedUser />}
          sx={{
            backgroundColor: "#e74c3c",
            "&:hover": {
              backgroundColor: "#c0392b",
            },
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </Box>
  );
}
