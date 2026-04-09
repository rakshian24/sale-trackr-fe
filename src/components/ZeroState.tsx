import { Box, Stack, Typography } from "@mui/material";
import React from "react";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
};

const ZeroState = ({ title, description, icon, iconBgColor }: Props) => {
  return (
    <Stack
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      py={{ xs: 2, md: 3 }}
    >
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "100%",
          bgcolor: iconBgColor,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" mb={{ xs: 1, md: 2 }}>
        {title}
      </Typography>
      <Typography
        variant="body1"
        textAlign={"center"}
        width={"90%"}
        color="text.secondary"
      >
        {description}
      </Typography>
    </Stack>
  );
};

export default ZeroState;
