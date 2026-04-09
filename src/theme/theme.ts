import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2e7d32" },
    secondary: { main: "#f57c00" },
    background: { default: "#f4f8f4", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h5: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme: muiTheme }) => ({
          textTransform: "none",
          fontSize: "14px",
          [muiTheme.breakpoints.up("md")]: {
            fontSize: "16px",
          },
          fontWeight: "600",
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 10px 30px rgba(46, 125, 50, 0.08)",
        },
      },
    },
  },
});
