import React, { useState } from "react";
import { Container, Box, Button, Typography } from "@mui/material";
import Input from "../components/Input";
import { useNavigate, useParams } from "react-router-dom";
import MySnackBar from "../components/MySnackBar";
import { passwordRegex } from "../functions/regex";
import "../styles/main.css";

export default function ConfirmRecoveryCode() {
    // state
    const [isLoading, setIsLoading] = useState(false);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [snackBarProps, setSnackBarProps] = useState({
        open: false,
        msg: "",
        sv: "error",
    });

    const { code } = useParams();

    // functions
    const feedBack = (msg, sv = "error") => {
        setSnackBarProps({
            open: true,
            msg,
            sv,
        });
    };

    const navigate = useNavigate();

    const confirmRecoveryCode = async () => {
        try {
            const res = await fetch(`/api/confirm-recovery-code`, {
                method: "POST",
                body: JSON.stringify({ password, code }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 401) {
                feedBack("Unauthorized .");
                setIsLoading(false);
                return;
            }
            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.");
                setIsLoading(false);
                return;
            }
            if (res.status === 200) {
                setIsLoading(false);
                feedBack(
                    "Password modified sucessfully. You can now login",
                    "info"
                );
                return navigate("/login", { replace: true });
            }
            setIsLoading(false);
            feedBack("Sothing when wrong. Please try again.");
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
                        Confirm Recovery Code
                    </Typography>
                    <br />
                    <Box>
                        <Input
                            onChange={(val) => setPassword(val)}
                            label="Password"
                            type="password"
                            required
                            value={password}
                            error={
                                !passwordRegex.test(password) && password !== ""
                            }
                            helperText={
                                "password must contain a digit and be 8-20 characters."
                            }
                            variant="standard"
                        />
                    </Box>
                    <Box>
                        <Input
                            type="password"
                            helperText="Must match with the password."
                            onChange={(val) => setConfirmPassword(val)}
                            label="Confirm password"
                            required
                            value={confirmPassword}
                            error={
                                password !== confirmPassword &&
                                password.length !== 0 &&
                                confirmPassword.length !== 0
                            }
                            variant="standard"
                        />
                    </Box>

                    <Box sx={{ my: "20px" }}>
                        <Button
                            size="small"
                            variant="contained"
                            disabled={
                                !passwordRegex.test(password) ||
                                password !== confirmPassword ||
                                isLoading
                            }
                            onClick={confirmRecoveryCode}
                        >
                            {isLoading ? "Please Wait" : "Reset password"}
                        </Button>
                    </Box>

                    <hr />
                    {/* code */}
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
