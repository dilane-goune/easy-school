import React from "react";
import { Box, Typography } from "@mui/material";

export default function FilterLine({ options = [], onClick = () => {} }) {
    const [selectIndex, setSelectedIndex] = React.useState(0);
    return (
        <Box
            sx={{
                display: "flex",
                overflowX: "auto",
                my: "5px",
            }}
        >
            {options.map((opt, ind) => (
                <Typography
                    key={ind}
                    onClick={() => {
                        setSelectedIndex(ind);
                        onClick(opt.value || opt);
                    }}
                    sx={{
                        p: "2px 10px",
                        borderRadius: "20px",
                        "border": "1px solid #48484d",
                        m: "auto 2px",
                        display: "inline",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                    }}
                    bgcolor={selectIndex === ind ? "#b8b8be" : "#f5f5fa"}
                    variant="body1"
                    component="button"
                >
                    {opt.label || opt}
                </Typography>
            ))}
        </Box>
    );
}
