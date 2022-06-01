import React from "react";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";

export default function PageHeader({
    title,
    searchOptions = [],
    isSearching = false,
    noSearch = false,
}) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
            }}
            justifyContent="space-between"
        >
            <Typography
                variant="h1"
                sx={{
                    fontSize: { xs: "18px", md: "24px" },
                    fontWeight: { xs: "bold" },

                    alignSelf: {
                        xs: "center",
                    },
                }}
                gutterBottom
                component="div"
            >
                {title}
            </Typography>
            {!noSearch && (
                <Autocomplete
                    flex={1}
                    disablePortal
                    options={searchOptions}
                    sx={{ width: { md: "400px", xs: "200px" } }}
                    renderInput={(params) => (
                        <TextField
                            variant="standard"
                            {...params}
                            label="Search"
                            size="small"
                        />
                    )}
                    size="small"
                    loading={isSearching}
                />
            )}
        </Box>
    );
}
