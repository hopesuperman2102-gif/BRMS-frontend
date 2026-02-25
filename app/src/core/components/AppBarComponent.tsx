import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Popover,
  Avatar,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import HeaderIcon from "./HeaderIcon";
import LogoTitle from "./LogoTitle";
import { brmsTheme } from "../theme/brmsTheme";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import EmailIcon from "@mui/icons-material/Email";
import AuditIcon from "@mui/icons-material/ManageSearch";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { AppBarComponentProps } from "../types/commonTypes";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import { getCurrentUserApi, LoggedInUser } from "../../modules/auth/UserService";
import { useAuth } from "../../modules/auth/Authcontext";
import { logoutApi } from "../../modules/auth/Authservice";

const AppBarComponent: React.FC<AppBarComponentProps> = ({ logo, organizationName }) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      setError(null);
      const userData = await getCurrentUserApi();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load user data";
      setError(errorMessage);
      console.error("Error fetching user data:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      setProfileAnchor(null);
      await logoutApi();
      setIsAuthenticated(false);
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        background: brmsTheme.gradients.primary,
        boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(79,70,229,0.2)",
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <LogoTitle logo={logo} organizationName={organizationName} />
          <Box display="flex" alignItems="center" gap={1}>
            <HeaderIcon
              icon={<SettingsIcon />}
              tooltip="Settings"
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
            />
            <HeaderIcon
              icon={<AccountCircleIcon />}
              tooltip="Profile"
              onClick={(e) => setProfileAnchor(e.currentTarget)}
            />
          </Box>
        </Box>
      </Toolbar>

      {/* Profile Popover */}
      <Popover
        open={!!profileAnchor}
        anchorEl={profileAnchor}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: { mt: 1, background: "transparent", boxShadow: "none" },
        }}
      >
        <Card sx={{ borderRadius: "16px", minWidth: 260, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
          {/* Purple Header Section */}
          <Box sx={{ background: brmsTheme.gradients.primary, px: 2.5, pt: 2, pb: 2.5 }}>
            <SectionHeader
              left={
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem", letterSpacing: 0.5 }}>
                  Profile Details
                </Typography>
              }
              right={
                <IconButton
                  size="small"
                  onClick={() => setProfileAnchor(null)}
                  sx={{
                    border: "1.5px solid rgba(255,255,255,0.5)",
                    borderRadius: "6px",
                    color: "#fff",
                    padding: "2px",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            />

            {/* Loading State */}
            {loadingUser ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 3 }}>
                <CircularProgress sx={{ color: "#fff" }} size={32} />
              </Box>
            ) : error ? (
              <Typography sx={{ color: "#ffcccc", fontSize: "0.85rem", py: 2 }}>
                {error}
              </Typography>
            ) : user ? (
              <>
                {/* Avatar + Name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 52, height: 52, border: "2px solid rgba(255,255,255,0.6)" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                      {user.name}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem" }}>
                      {user.id}
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : null}
          </Box>

          {/* White Bottom Section */}
          {user && !loadingUser && (
            <CardContent sx={{ bgcolor: "#fff", px: 2.5, py: 2, "&:last-child": { pb: 2 } }}>
              {/* Email Row */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <EmailIcon sx={{ color: "#6b7280", fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: "#111827", fontWeight: 500 }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* Logout Button */}
              <Button
                fullWidth
                variant="text"
                startIcon={<LogoutIcon sx={{ color: "#ef4444" }} />}
                onClick={handleLogout}
                sx={{
                  justifyContent: "flex-start",
                  color: "#ef4444",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 1,
                  "&:hover": { backgroundColor: "#fef2f2" },
                }}
              >
                Log out
              </Button>
            </CardContent>
          )}
        </Card>
      </Popover>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={!!settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            minWidth: 200,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid #f3f4f6",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setSettingsAnchor(null);
            navigate("/logs");
          }}
          sx={{ borderRadius: "8px", mx: 0.5, my: 0.25, "&:hover": { backgroundColor: "#f5f3ff" } }}
        >
          <ListItemIcon>
            <AuditIcon fontSize="small" sx={{ color: "#6366f1" }} />
          </ListItemIcon>
          <ListItemText
            primary="Audit Logs"
            primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSettingsAnchor(null);
            navigate("/signup");
          }}
          sx={{ borderRadius: "8px", mx: 0.5, my: 0.25, "&:hover": { backgroundColor: "#f5f3ff" } }}
        >
          <ListItemIcon>
            <PersonAddIcon fontSize="small" sx={{ color: "#6366f1" }} />
          </ListItemIcon>
          <ListItemText
            primary="User Create"
            primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500, color: "#111827" }}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default AppBarComponent;