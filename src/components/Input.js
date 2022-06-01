import React from "react";
import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Input({
    value,
    type,
    label,
    helperText,
    required = false,
    onBlur,
    onChange = () => {},
    disabled = false,
    error = false,
    focused = false,
    variant = "outlined",
    inputStyle = {},
    sx = {},
    square = false,
    ...rest
}) {
    // states
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <Box sx={sx}>
            <TextField
                variant={variant}
                focused={focused}
                disabled={disabled}
                type={
                    type === "password"
                        ? showPassword
                            ? "text"
                            : "password"
                        : type
                }
                size="small"
                fullWidth
                error={error}
                label={label}
                value={value}
                onChange={(e) => {
                    if (type === "checkbox") return onChange(e.target.checked);

                    onChange(e.target.value);
                }}
                helperText={helperText}
                onBlur={onBlur}
                required={required}
                InputProps={{
                    endAdornment:
                        type === "password" ? (
                            <InputAdornment position="start">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                >
                                    {showPassword ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    style: {
                        m: 0,
                        borderRadius: square ? "0px" : "20px",
                        ...inputStyle,
                    },
                }}
                {...rest}
            />
        </Box>
    );
}

export default Input;
