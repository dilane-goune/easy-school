import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import countries from "../assets/countries.json";

export default function CountrySelect({
    value,
    onChange,
    variant = "standard",
    sx = {},
    inputStyle = {},
}) {
    const [inputValue, setInputValue] = React.useState("");
    return (
        <Box {...sx}>
            <FormControl fullWidth>
                <Autocomplete
                    size="small"
                    value={value}
                    onChange={(e, val) => {
                        onChange(val);
                    }}
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    options={countries}
                    autoHighlight
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option) => (
                        <Box component="li" {...props}>
                            {option.flag} {option.name} ({option.code}) +
                            {option.phone}
                        </Box>
                    )}
                    renderInput={(params) => (
                        <TextField
                            variant={variant}
                            sx={{ borderRadius: "0px" }}
                            {...params}
                            label="Choose a country"
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password", // disable autocomplete and autofill
                            }}
                        />
                    )}
                    isOptionEqualToValue={(opt, val) => opt.code === val.code}
                />
            </FormControl>
        </Box>
    );
}
