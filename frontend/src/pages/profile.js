// src/pages/profile.js
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Avatar,
  TextField,
  Paper,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import Button from "@/components/common/Button";
import { updateProfile, getCurrentUser } from "@/redux/actions/authActions";

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

// Common TextField styles
const textFieldStyles = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "#ffd700",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#ffd700",
    },
    "&.Mui-disabled": {
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-focused": {
      color: "#ffd700",
    },
    "&.Mui-disabled": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
  "& .MuiInputBase-input": {
    color: "#fff",
    "&.Mui-disabled": {
      WebkitTextFillColor: "rgba(255, 255, 255, 0.6)",
    },
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    profilePicture: "",
    favoriteGenres: [],
    favoriteLanguages: [],
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Fetch latest user data
    dispatch(getCurrentUser());
  }, [isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        profilePicture: user.profilePicture || "",
        favoriteGenres: user.preferences?.favoriteGenres || [],
        favoriteLanguages: user.preferences?.favoriteLanguages || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSave = async () => {
    const result = await dispatch(updateProfile(formData));

    if (result.success) {
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    // Reset form to user data
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        profilePicture: user.profilePicture || "",
        favoriteGenres: user.preferences?.favoriteGenres || [],
        favoriteLanguages: user.preferences?.favoriteLanguages || [],
      });
    }
    setIsEditing(false);
  };

  if (!user) {
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        pt: 12,
        pb: 6,
      }}
    >
      <Container maxWidth="md">
        {updateSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: "#1a1a1a",
            color: "#fff",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              My Profile
            </Typography>

            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>

          {/* Avatar & Basic Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              mb: 4,
              pb: 4,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Avatar
              src={formData.profilePicture}
              alt={formData.name}
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#e74c3c",
                fontSize: "2rem",
              }}
            >
              {formData.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {user.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 1 }}
              >
                {user.email}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography variant="body2" sx={{ color: "#ffd700" }}>
                  Watchlist: {user.watchlistCount || 0}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Form Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={textFieldStyles}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled
                sx={textFieldStyles}
              />
            </Grid>

            {/* Favorite Genres */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Favorite Genres
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {genres.map((genre) => (
                  <Chip
                    key={genre}
                    label={genre}
                    onClick={() => isEditing && handleGenreToggle(genre)}
                    sx={{
                      backgroundColor: formData.favoriteGenres.includes(genre)
                        ? "#e74c3c"
                        : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      cursor: isEditing ? "pointer" : "default",
                      "&:hover": isEditing
                        ? {
                            backgroundColor: formData.favoriteGenres.includes(
                              genre
                            )
                              ? "#c0392b"
                              : "rgba(255, 255, 255, 0.2)",
                          }
                        : {},
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Favorite Languages */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                Favorite Languages
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {languages.map((language) => (
                  <Chip
                    key={language}
                    label={language}
                    onClick={() => isEditing && handleLanguageToggle(language)}
                    sx={{
                      backgroundColor: formData.favoriteLanguages.includes(
                        language
                      )
                        ? "#e74c3c"
                        : "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      cursor: isEditing ? "pointer" : "default",
                      "&:hover": isEditing
                        ? {
                            backgroundColor:
                              formData.favoriteLanguages.includes(language)
                                ? "#c0392b"
                                : "rgba(255, 255, 255, 0.2)",
                          }
                        : {},
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
