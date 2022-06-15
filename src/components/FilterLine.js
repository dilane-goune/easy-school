import React from "react";
import { Box, Typography } from "@mui/material";

export default function FilterLine({
    options = [],
    onClick = () => {},
    title,
    titleVariant = "body1",
    titleSx = {},
    ordered = false,
}) {
    const [selectIndex, setSelectedIndex] = React.useState(0);
    const [asc, setAsc] = React.useState(true);
    return (
        <Box
            sx={{
                display: "flex",
                overflowX: "auto",
                my: "5px",
            }}
        >
            {title && (
                <Typography
                    variant={titleVariant}
                    sx={{ mr: "10px", my: "auto", ...titleSx }}
                >
                    {title}
                </Typography>
            )}
            {options.map((opt, ind) => (
                <Typography
                    key={ind}
                    onClick={() => {
                        setSelectedIndex(ind);
                        onClick(opt.value || opt, asc);
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
            {ordered && (
                <Typography
                    onClick={() => {
                        setAsc(!asc);
                        const currentVal = options[selectIndex];
                        onClick(currentVal.value || currentVal, asc);
                    }}
                    sx={{
                        p: "2px 10px",
                        borderRadius: "20px",
                        "border": "1px solid #48484d",
                        m: "auto 2px",
                        display: "inline",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        width: "70px",
                    }}
                    bgcolor={asc ? "#b8b8be" : "#f5f5fa"}
                    variant="body1"
                    component="button"
                >
                    {asc ? "ASC" : "DESC"}
                </Typography>
            )}
        </Box>
    );
}
