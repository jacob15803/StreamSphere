// src/components/auth/SignUp.js
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Alert,
  MenuItem,
  Chip,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import Button from "@/components/common/Button";
import { sendOTP, register } from "@/redux/actions/authActions";

const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
  "Romance",
  "Animation",
  "Documentary",
];

const languages = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Korean",
  "Chinese",
  "Italian",
  "Portuguese",
];

export default function SignUp({
  email: initialEmail = "",
  isRegistration = false,
  onOTPSent,
  onSwitchToSignIn,
  onRegistrationComplete,
}) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: initialEmail,
    name: "",
    phone: "",
    dateOfBirth: "",
    profilePicture: "",
    favoriteGenres: [],
    favoriteLanguages: [],
  });

  const [errors, setErrors] = useState({});

  // If it's the initial signup (email entry)
  if (!isRegistration) {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const validateEmail = (email) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(email);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setEmailError("");

      if (!email) {
        setEmailError("Email is required");
        return;
      }

      if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

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
          Create An Account
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
            startIcon={<PersonAdd />}
            sx={{
              mb: 3,
              backgroundColor: "#e74c3c",
              "&:hover": {
                backgroundColor: "#c0392b",
              },
            }}
          >
            {loading ? "Sending OTP..." : "Get started"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(0, 0, 0, 0.6)" }}>
              Already have an account?{" "}
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
                onClick={onSwitchToSignIn}
              >
                Login
              </Typography>
            </Typography>
          </Box>
        </form>
      </Box>
    );
  }

  // Registration form (after OTP verification)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleGenreToggle = (genre) => {
    const currentGenres = formData.favoriteGenres;
    if (currentGenres.includes(genre)) {
      setFormData({
        ...formData,
        favoriteGenres: currentGenres.filter((g) => g !== genre),
      });
    } else {
      setFormData({
        ...formData,
        favoriteGenres: [...currentGenres, genre],
      });
    }
  };

  const handleLanguageToggle = (language) => {
    const currentLanguages = formData.favoriteLanguages;
    if (currentLanguages.includes(language)) {
      setFormData({
        ...formData,
        favoriteLanguages: currentLanguages.filter((l) => l !== language),
      });
    } else {
      setFormData({
        ...formData,
        favoriteLanguages: [...currentLanguages, language],
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await dispatch(register(formData));

    if (result.success) {
      onRegistrationComplete();
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
        Complete Your Profile
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 3,
          color: "rgba(0, 0, 0, 0.6)",
        }}
      >
        Tell us a bit about yourself
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            name="name"
            label="Full Name *"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
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

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
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

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#f5f5f5",
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

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Favorite Genres
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {genres.map((genre) => (
              <Chip
                key={genre}
                label={genre}
                onClick={() => handleGenreToggle(genre)}
                color={
                  formData.favoriteGenres.includes(genre)
                    ? "primary"
                    : "default"
                }
                sx={{
                  backgroundColor: formData.favoriteGenres.includes(genre)
                    ? "#e74c3c"
                    : "#f5f5f5",
                  color: formData.favoriteGenres.includes(genre)
                    ? "#fff"
                    : "#000",
                  "&:hover": {
                    backgroundColor: formData.favoriteGenres.includes(genre)
                      ? "#c0392b"
                      : "#e0e0e0",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            Favorite Languages
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {languages.map((language) => (
              <Chip
                key={language}
                label={language}
                onClick={() => handleLanguageToggle(language)}
                color={
                  formData.favoriteLanguages.includes(language)
                    ? "primary"
                    : "default"
                }
                sx={{
                  backgroundColor: formData.favoriteLanguages.includes(language)
                    ? "#e74c3c"
                    : "#f5f5f5",
                  color: formData.favoriteLanguages.includes(language)
                    ? "#fff"
                    : "#000",
                  "&:hover": {
                    backgroundColor: formData.favoriteLanguages.includes(
                      language
                    )
                      ? "#c0392b"
                      : "#e0e0e0",
                  },
                }}
              />
            ))}
          </Box>
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
          sx={{
            backgroundColor: "#e74c3c",
            "&:hover": {
              backgroundColor: "#c0392b",
            },
          }}
        >
          {loading ? "Creating Account..." : "Complete Registration"}
        </Button>
      </form>
    </Box>
  );
}
