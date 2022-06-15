import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function Label({ label = "", value }) {
    return (
        <Box
            sx={{
                display: "flex",
                padding: "5px 20px",
                alignItems: "center",
            }}
        >
            <Typography width="40%">{label}</Typography>
            <Typography color="text.secondary" width="5%">
                :
            </Typography>
            <Typography fontWeight="medium" width="55%">
                {value}
            </Typography>
        </Box>
    );
}

export default Label;
