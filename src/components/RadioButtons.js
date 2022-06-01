import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Box from "@mui/material/Box";

export default function RadioButtons({
    column,
    options = [],
    value,
    onChange,
    label,
    mr,
    ml,
}) {
    return (
        <Box
            component="form"
            sx={{
                display: "flex",
                alignItems: "center",
                ml,
                mr,
            }}
        >
            <FormLabel sx={{ mr: "10px" }}>{label}</FormLabel>
            <FormControl>
                <RadioGroup
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                    row={!column}
                >
                    <Box sx={{ display: "flex" }}>
                        {options.map((opt, ind) => (
                            <FormControlLabel
                                labelPlacement={column ? "top" : "end"}
                                key={ind}
                                value={opt.value || opt}
                                control={<Radio />}
                                label={opt.label || opt}
                            />
                        ))}
                    </Box>
                </RadioGroup>
            </FormControl>
        </Box>
    );
}
