import React from "react";
import {
    FormControl,
    InputLabel,
    Input,
    FormHelperText,
    Box,
} from "@mui/material";

export default function FilePicker({
    onChange = () => {},
    label,
    required = false,
    accept,
    multiple = false,
    helperText,
    sx = {},
}) {
    const handleChange = (e) => {
        if (multiple) return onChange(e.target.files);
        return onChange(e.target.files[0]);
    };
    return (
        <Box sx={sx}>
            <FormControl
                focused
                required={required}
                fullWidth
                variant="standard"
            >
                <InputLabel htmlFor="component-error">{label}</InputLabel>
                <Input
                    accept={accept}
                    fullWidth
                    type="file"
                    id="component-error"
                    onChange={handleChange}
                    inputProps={{ accept }}
                />
                <FormHelperText>{helperText}</FormHelperText>
            </FormControl>
        </Box>
    );
}
