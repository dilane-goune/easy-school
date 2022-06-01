import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import MUISelect from "@mui/material/Select";
import Box from "@mui/material/Box";

export default function Select({
    options = [],
    onChange,
    label = "Select",
    value = "",
    // height = "40px",
    variant = "outlined",
    square = false,
    disabled = false,
    ...rest
}) {
    const handleChange = (event) => {
        if (onChange instanceof Function) onChange(event.target.value);
    };

    return (
        <Box {...rest}>
            <FormControl sx={{ width: "100%" }} size="small">
                <InputLabel>{label}</InputLabel>
                <MUISelect
                    disabled={disabled}
                    value={value}
                    label={label}
                    onChange={handleChange}
                    sx={{
                        // height,
                        fontSize: "16px",
                        borderRadius: square ? "0px" : "20px",
                        padding: "0",
                        m: 0,
                    }}
                    variant={variant}
                    size="small"
                    fullWidth
                >
                    {options.map((opt, ind) => {
                        return (
                            <MenuItem key={ind} value={opt.value || opt}>
                                {opt.label || opt}
                            </MenuItem>
                        );
                    })}
                </MUISelect>
            </FormControl>
        </Box>
    );
}
