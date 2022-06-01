import React, { useState } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
} from "@mui/material";
import { passwordRegex } from "../functions/regex";
import { Link, useParams, useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import Input from "../components/Input";
import globalContext from "../context/globalContext";

let student = localStorage.getItem("student");
if (student) student = JSON.parse(student);

let studentToken = localStorage.getItem("studentToken");
if (studentToken) studentToken = JSON.parse(studentToken);

export default function CompleteRegistration() {
    // state
    const [student, setStudent] = useState({});
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { userId } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        fetch("/api/get-registration-info/" + userId)
            .then((res) => res.json())
            .then((data) => {
                if (data.message)
                    navigate("/service-error?message=" + data.message);
                setStudent(data);
            })
            .catch((e) => {
                console.log(e.message);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { feedBack } = React.useContext(globalContext);

    // functions
    async function handleCompleteRegistration() {
        try {
            setIsLoading(true);
            const res = await fetch("/api/finish-registration", {
                body: JSON.stringify({ userId, password }),
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 200) {
                feedBack(
                    <span>
                        Password save successfully. login{" "}
                        <a href="/login">here</a>.
                    </span>,
                    "info"
                );
                return;
            } else if (res.status === 500) {
                feedBack("Sothing when wrong.");
                return;
            }
        } catch (e) {
            console.log(e);
            feedBack("Sothing when wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="home-page">
            <Container>
                {/* <RootHeader current="login" /> */}

                <Paper
                    elevation={2}
                    sx={{
                        maxWidth: "700px",
                        minHeight: "480px",
                        mx: { xs: "5px", md: "auto" },
                        py: "10px",
                        my: "20px",
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="400"
                        mb="20px"
                        sx={{ py: { md: 2 }, textAlign: "center" }}
                    >
                        Finish your registration
                    </Typography>
                    <Box
                        component="form"
                        autoComplete="off"
                        sx={{
                            maxWidth: { xs: "90%", lg: 500 },
                            mx: "auto",
                            "& > :not(style)": { my: 2 },
                        }}
                    >
                        <Typography
                            variant="body1"
                            mb="10px"
                            sx={{ py: { md: 2 }, textAlign: "center" }}
                        >
                            Welcome back{" "}
                            <strong>
                                {student.name + " " + student.surName}
                            </strong>
                            .
                        </Typography>
                        {/* <br /> */}
                        <Input
                            label="Password"
                            value={password}
                            onChange={(val) => setPassword(val)}
                            required
                            type="password"
                            variant="standard"
                            error={
                                !passwordRegex.test(password) && password !== ""
                            }
                        />
                        <Input
                            label="Confrim password"
                            value={confirmPassword}
                            onChange={(val) => setConfirmPassword(val)}
                            error={
                                password !== confirmPassword &&
                                confirmPassword !== ""
                            }
                            required
                            type="password"
                            variant="standard"
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box></Box>
                            <Button
                                disabled={
                                    !passwordRegex.test(password) ||
                                    password !== confirmPassword ||
                                    isLoading
                                }
                                // variant="outlined"
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <SendIcon />
                                    )
                                }
                                onClick={handleCompleteRegistration}
                            >
                                Submit
                            </Button>
                        </Box>
                        <br />
                        <h6>
                            <Link to="/">Home page</Link>.
                        </h6>
                        <Typography>
                            For any issue, visit the easy school{" "}
                            <Link to="/help">help page</Link>.
                        </Typography>{" "}
                    </Box>
                </Paper>
            </Container>
        </main>
    );
}
