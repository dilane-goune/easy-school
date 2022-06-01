import React from "react";
import { Typography, Box } from "@mui/material";
import useIsAdmin from "../functions/useIsAdmin";

import MyLink from "./MyLink";

export default function RootHeader({ user }) {
    const isAdmin = useIsAdmin();

    const options = isAdmin
        ? [{ link: "login", label: "Login" }]
        : [
              { link: "login", label: "Login" },
              { link: "registration", label: "Registration" },
              { link: "help", label: "Help" },
              { link: "about", label: "About" },
          ];
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: {
                    xs: "column",
                    md: "row",
                },
                textAlign: {
                    xs: "center",
                    lg: "left",
                },
                "& *": {
                    my: "auto",
                },
            }}
        >
            <Typography variant="h3" fontWeight="medium">
                Easy School
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "row" },
                    justifyContent: "space-evenly",
                    flex: 1,
                }}
            >
                {options.map((opt, ind) => (
                    <MyLink key={ind} to={opt.link} label={opt.label} />
                ))}
            </Box>
        </Box>
    );
}
