import React, { useState } from "react";
import {
    Container,
    Box,
    Button,
    Typography,
    CircularProgress,
} from "@mui/material";
import Input from "../components/Input";
import MySnackBar from "../components/MySnackBar";
import { emailRegEx } from "../functions/regex";
import "../styles/main.css";

function GetRecoveryCode() {
    // state
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState("");

    const [snackBarProps, setSnackBarProps] = useState({
        open: false,
        msg: "",
        sv: "error",
    });

    // functions
    const feedBack = (msg, sv = "error") => {
        setSnackBarProps({
            open: true,
            msg,
            sv,
        });
    };

    const getConfirmationCode = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/get-recovery-code`, {
                method: "POST",
                body: JSON.stringify({ email }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 404) {
                feedBack(
                    "This email address is not recognized. if you are new, please register.",
                    "warning"
                );
                setIsLoading(false);
                return;
            }
            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.");
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
            feedBack("A recovery link have been sent to " + email, "info");
        } catch (e) {
            console.log(e);
            feedBack("Sothing when wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="home-page">
            <Container>
                <Box sx={{ maxWidth: "500px" }}>
                    <Typography padding="20px auto" variant="h3">
                        Get Recovery Code
                    </Typography>
                    <br />
                    <Box>
                        <Input
                            label="Enter your email address"
                            value={email}
                            onChange={(val) => setEmail(val)}
                            type="email"
                            helperText="A confirmation code will be sent to this email address"
                            error={!emailRegEx.test(email) && email !== ""}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <Button
                                        startIcon={
                                            isLoading ? (
                                                <CircularProgress size={16} />
                                            ) : null
                                        }
                                        size="small"
                                        sx={{ whiteSpace: "nowrap" }}
                                        disabled={
                                            !emailRegEx.test(email) || isLoading
                                        }
                                        onClick={getConfirmationCode}
                                    >
                                        {isLoading ? "Please Wait" : "Get Code"}
                                    </Button>
                                ),
                            }}
                        />
                    </Box>
                </Box>

                <MySnackBar
                    open={snackBarProps.open}
                    message={snackBarProps.msg}
                    onClose={() => {
                        setSnackBarProps({ msg: "", open: false });
                    }}
                    severity={snackBarProps.sv}
                />
            </Container>
        </main>
    );
}

export default GetRecoveryCode;
