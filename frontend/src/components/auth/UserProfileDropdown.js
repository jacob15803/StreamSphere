// src/components/auth/UserProfileDropdown.js
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
} from "@mui/material";
import {
  Person,
  Bookmark,
  History,
  Logout,
  KeyboardArrowDown,
  Stars,
  CreditCard,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { logout } from "@/redux/actions/authActions";

export default function UserProfileDropdown() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentSubscription } = useSelector((state) => state.subscription);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    router.push("/profile");
  };

  const handleWatchlist = () => {
    handleClose();
    router.push("/watchlist");
  };

  const handleHistory = () => {
    handleClose();
    router.push("/history");
  };

  const handleSubscription = () => {
    handleClose();
    router.push("/subscription");
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
  };

  if (!user) return null;

  const isPremium = currentSubscription?.isPremium;

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          padding: "6px 12px",
          borderRadius: "20px",
          transition: "background-color 0.3s",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Avatar
          src={user.profilePicture}
          alt={user.name}
          sx={{
            width: 32,
            height: 32,
            bgcolor: isPremium ? "#ffd700" : "#e74c3c",
            fontSize: "14px",
            border: isPremium ? "2px solid #ffd700" : "none",
          }}
        >
          {user.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography
          sx={{
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            display: { xs: "none", sm: "block" },
          }}
        >
          {user.name?.split(" ")[0]}
        </Typography>
        <KeyboardArrowDown
          sx={{
            color: "#fff",
            fontSize: 20,
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 240,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            {isPremium && (
              <Chip
                icon={<Stars sx={{ fontSize: 14 }} />}
                label="Premium"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  backgroundColor: "#ffd700",
                  color: "#000",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleSubscription}>
          <ListItemIcon>
            {isPremium ? (
              <Stars fontSize="small" sx={{ color: "#ffd700" }} />
            ) : (
              <CreditCard fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{
                color: isPremium ? "#ffd700" : "inherit",
                fontWeight: isPremium ? 600 : 400,
              }}
            >
              {isPremium ? "Premium Plan" : "Go Premium"}
            </Typography>
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleWatchlist}>
          <ListItemIcon>
            <Bookmark fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Watchlist</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleHistory}>
          <ListItemIcon>
            <History fontSize="small" />
          </ListItemIcon>
          <ListItemText>Watch History</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "#e74c3c" }} />
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ color: "#e74c3c" }}>Logout</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
