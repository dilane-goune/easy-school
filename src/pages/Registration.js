import React, { useState } from "react";
import {
    Container,
    Typography,
    Box,
    Button,
    Stepper,
    StepLabel,
    Step,
    Paper,
    CircularProgress,
} from "@mui/material";
import Input from "../components/Input";
import RadioButtons from "../components/RadioButtons";
import "../styles/main.css";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import CountrySelect from "../components/CountryPicker";
import Select from "../components/Select";
import FilePicker from "../components/FilePicker";
import ReactCodeInput from "react-verification-code-input";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { emailRegEx, telRegex } from "../functions/regex";
import globalContext from "../context/globalContext";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from "firebase/auth";
import { Link } from "react-router-dom";

const firebaseConfig = {
    apiKey: "AIzaSyCUQpUxJyUaUDMjAB4PXgMMoUaLFF7o9IU",
    authDomain: "easy-school-a4749.firebaseapp.com",
    projectId: "easy-school-a4749",
    storageBucket: "easy-school-a4749.appspot.com",
    messagingSenderId: "750770808399",
    appId: "1:750770808399:web:6914ef722068555a4eac3a",
    measurementId: "G-4XZJYQ7797",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

dayjs.extend(RelativeTime);

const defaultStudent = {
    email: "",
    name: "",
    surName: "",
    gender: "M",
    dateOfBirth: "",
    country: { "code": "CM", "name": "Cameroon", "phone": 237, "flag": "🇨🇲" },
    telephone: "",
    password: "",
    confirmPassword: "",

    specialization: "",
    admissionLevel: "L1",
    IDCardFile: null,
    certificateFile: null,
};

// FIXME: fixe the rechap..

export default function SignUp() {
    // states
    const [student, setStudent] = useState(defaultStudent);
    const [specializations, setSpecializations] = useState([]);
    const [classes, setClasses] = useState([]);

    const [completedSteps, setCompletedSteps] = useState({
        first: false,
        second: false,
        third: false,
        fourth: false,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [codeIsValid, setCodeIsValid] = useState(null);

    React.useEffect(() => {
        fetch("/api/registration-data")
            .then((res) => res.json())
            .then((data) => {
                setSpecializations(data.specializations);
                setClasses(data.classes);
            })
            .catch((e) => {
                console.log(e.message);
            });
        setIsLoading(false);
    }, []);

    // functions
    const handleForm = (key, value) => {
        setStudent({ ...student, [key]: value });
    };

    const { feedBack } = React.useContext(globalContext);

    const [activeStep, setActiveStep] = React.useState(0);

    const handleSignUp = async () => {
        try {
            student.countryCode = student.country.code;
            const formData = new FormData();

            const classId = classes.find(
                (c) =>
                    c.level === student.admissionLevel &&
                    c.specialization === student.specialization
            )._id;

            for (const key in student) {
                if (
                    key !== "certificateFile" &&
                    key !== "IDCardFile" &&
                    key !== "country"
                ) {
                    formData.append(key, student[key]);
                }
            }

            formData.append("classId", classId);

            formData.append(
                "certificateFile",
                student["certificateFile"],
                student["certificateFile"]?.name
            );

            formData.append(
                "IDCardFile",
                student["IDCardFile"],
                student["IDCardFile"]?.name
            );

            const options = {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            };
            setIsLoading(true);
            const res = await fetch(`/api/registration`, options);

            if (res.status === 409) {
                feedBack("This email address is already taken.");
                return;
            }
            if (res.status === 500 || res.status === 404) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            feedBack(
                "Registered sucessfully. You will recieve an email after the document verification",
                "success"
            );
            setActiveStep(3);
            setCompletedSteps({
                first: true,
                second: true,
                third: true,
                fourth: true,
            });

            // TODO: naivigate to a confimation page
        } catch (e) {
            console.log(e);
            feedBack("Sothing when wrong. Please try again.", "warning");
        } finally {
            setIsLoading(false);
        }
    };

    const validForm = () => {
        if (
            emailRegEx.test(student.email) &&
            telRegex.test(student.telephone) &&
            student.name &&
            student.surName &&
            student.dateOfBirth &&
            student.country &&
            student.specialization &&
            student.IDCardFile &&
            student.certificateFile
        )
            return true;
        return false;
    };

    const verifyPhoneNumber = () => {
        window.recaptchaVerifier = new RecaptchaVerifier(
            "recaptcha-container",
            {
                "size": "invisible",
                "callback": (response) => {},
                "expired-callback": (e) => {
                    console.log(e);
                },
            },
            auth
        );

        setIsAuthenticating(true);
        const appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(
            auth,
            "+" + student.country.phone + student.telephone,
            appVerifier
        )
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setShowCodeInput(true);
            })
            .catch((e) => {
                if (
                    e.message ===
                    "reCAPTCHA has already been rendered in this element"
                )
                    return window.location.reload();
                feedBack(
                    "Phone number verification failed. check your internet connection."
                );
                console.error(e);
            })
            .finally(() => {
                setIsAuthenticating(false);
            });
    };

    const confirmPhoneNumber = (code) => {
        setIsAuthenticating(true);
        window.confirmationResult
            .confirm(code)
            .then((result) => {
                setCodeIsValid(true);
                setCompletedSteps({ ...completedSteps, first: true });
            })
            .catch((e) => {
                setCodeIsValid(false);
                console.log(e);
            })
            .finally(() => {
                setIsAuthenticating(false);
            });
    };

    return (
        <main className="home-page">
            <Container>
                <div
                    style={{ position: "absolute" }}
                    id="recaptcha-container"
                ></div>
                <Typography
                    sx={{ py: { md: 2 }, textAlign: "center" }}
                    variant="h4"
                    fontWeight="400"
                    mb="20px"
                >
                    Registration
                </Typography>
                <Paper
                    elevation={2}
                    sx={{
                        maxWidth: "700px",
                        minHeight: "300px",
                        mx: { xs: "5px", md: "auto" },
                        py: "10px",
                        my: "20px",
                    }}
                >
                    <Box>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            <Step completed={completedSteps.first}>
                                <StepLabel>Address</StepLabel>
                            </Step>
                            <Step completed={completedSteps.second}>
                                <StepLabel>Personal Information</StepLabel>
                            </Step>
                            <Step completed={completedSteps.third}>
                                <StepLabel>Admission</StepLabel>
                            </Step>
                            <Step completed={completedSteps.fourth}>
                                <StepLabel>End</StepLabel>
                            </Step>
                        </Stepper>
                    </Box>
                    {activeStep === 0 ? (
                        <Box
                            sx={{
                                "& > .MuiBox-root": {
                                    maxWidth: "400px",
                                    mx: { xs: "10px", md: "auto" },
                                    mt: "20px",
                                },
                            }}
                        >
                            <CountrySelect
                                value={student.country}
                                onChange={(val) => {
                                    setStudent({
                                        ...student,
                                        country: val,
                                    });
                                }}
                            />
                            <Input
                                type="email"
                                onChange={(val) => handleForm("email", val)}
                                label="Email"
                                helperText={`A confirmation mail will be sent to this 
                                address after your registration.`}
                                required
                                value={student.email}
                                error={
                                    !emailRegEx.test(student.email) &&
                                    student.email !== ""
                                }
                                variant="standard"
                            />

                            <Input
                                onChange={(val) => handleForm("telephone", val)}
                                label="Telephone"
                                required
                                value={student.telephone}
                                error={
                                    !telRegex.test(student.telephone) &&
                                    student.telephone !== ""
                                }
                                variant="standard"
                                helperText={`Without country code. A verification code 
                                will be sent to this number`}
                                InputProps={{
                                    endAdornment:
                                        isAuthenticating && !showCodeInput ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <Button
                                                size="small"
                                                onClick={verifyPhoneNumber}
                                                disabled={
                                                    !telRegex.test(
                                                        student.telephone
                                                    )
                                                }
                                            >
                                                Verify
                                            </Button>
                                        ),
                                }}
                            />
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                sx={{
                                    aligItems: "center",
                                    display: showCodeInput ? "flex" : "none",
                                }}
                            >
                                <Box>
                                    <ReactCodeInput
                                        type="number"
                                        fieldWidth={30}
                                        fieldHeight={30}
                                        // loading
                                        placeholder={"______".split("")}
                                        onComplete={(val) =>
                                            confirmPhoneNumber(val)
                                        }
                                    />
                                    <em
                                        style={{
                                            fontFamily: "Roboto",
                                            fontSize: "11px",
                                            letterSpacing: "1px",
                                            padding: 0,
                                            margin: 0,
                                        }}
                                    >
                                        enter the verification code
                                    </em>
                                </Box>
                                {codeIsValid === null &&
                                !isAuthenticating ? null : isAuthenticating ? (
                                    <CircularProgress size={20} />
                                ) : codeIsValid ? (
                                    <DoneIcon size={24} color="success" />
                                ) : (
                                    <CancelOutlinedIcon
                                        size={24}
                                        color="error"
                                    />
                                )}
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Box></Box>
                                <Button
                                    onClick={() => setActiveStep(1)}
                                    disabled={
                                        !codeIsValid ||
                                        !emailRegEx.test(student.email)
                                    }
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    ) : activeStep === 1 ? (
                        <Box
                            sx={{
                                "& > .MuiBox-root": {
                                    maxWidth: "400px",
                                    mx: { xs: "10px", md: "auto" },
                                    mt: "20px",
                                },
                            }}
                        >
                            <Input
                                onChange={(val) => handleForm("name", val)}
                                label="First name"
                                required
                                value={student.name}
                                variant="standard"
                            />
                            <Input
                                onChange={(val) => handleForm("surName", val)}
                                label="Last name"
                                required
                                value={student.surName}
                                variant="standard"
                            />
                            <Input
                                focused
                                type="date"
                                onChange={(val) => {
                                    let date = dayjs()
                                        .subtract(12, "year")
                                        .isAfter(val, "year");
                                    if (date) handleForm("dateOfBirth", val);
                                    else
                                        alert(
                                            "You must be atleat 12 years old."
                                        );
                                }}
                                label="Date of birth"
                                required
                                value={student.dateOfBirth}
                                variant="standard"
                                helperText="You must be atleat 12 years old."
                            />
                            <RadioButtons
                                ml="15px"
                                label="Gender"
                                options={[
                                    { value: "M", label: "Male" },
                                    { value: "F", label: "Female" },
                                ]}
                                value={student.gender}
                                onChange={(val) => handleForm("gender", val)}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Button onClick={() => setActiveStep(0)}>
                                    Back
                                </Button>
                                <Button
                                    onClick={() => {
                                        setActiveStep(2);
                                        setCompletedSteps({
                                            ...completedSteps,
                                            second: true,
                                        });
                                    }}
                                    disabled={
                                        !(
                                            student.name &&
                                            student.surName &&
                                            student.dateOfBirth
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </Box>
                        </Box>
                    ) : activeStep === 2 ? (
                        <Box
                            sx={{
                                "& > .MuiBox-root": {
                                    maxWidth: "400px",
                                    mx: { xs: "10px", md: "auto" },
                                    mt: "20px",
                                },
                            }}
                        >
                            <Select
                                options={["L1", "L2", "L3", "M1", "M2"]}
                                label="Admission Level"
                                onChange={(val) => {
                                    handleForm("admissionLevel", val);
                                }}
                                value={student.admissionLevel}
                            />
                            <Select
                                options={specializations.map((sp) => sp.name)}
                                label="Specialisation"
                                onChange={(val) => {
                                    handleForm("specialization", val);
                                }}
                                value={student.specialization}
                            />
                            <FilePicker
                                accept={"image/*"}
                                label="Admission certificate"
                                helperText="clear image of your certificate"
                                required
                                onChange={(val) => {
                                    setStudent({
                                        ...student,
                                        certificateFile: val,
                                    });
                                }}
                            />
                            <FilePicker
                                accept={[".pdf,image/png,image/jpg,image/jpeg"]}
                                label="ID Card"
                                helperText="clear image of your ID Card. Both sites on one picture"
                                required
                                onChange={(val) => {
                                    setStudent({
                                        ...student,
                                        IDCardFile: val,
                                    });
                                }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Button onClick={() => setActiveStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    disabled={!validForm() || isLoading}
                                    startIcon={<SendIcon />}
                                    onClick={handleSignUp}
                                >
                                    {!isLoading ? "Submit" : "Please wait ..."}
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ p: "20px" }}>
                            <Typography variant="h6">
                                Weldone. Your registration at{" "}
                                <strong style={{ color: "green" }}>
                                    Easy-School
                                </strong>{" "}
                                is almost terminated.
                            </Typography>
                            <br />
                            <Typography variant="body1">
                                Your documents will be studied , verified and an
                                email will be sent to <em>{student.email}</em>{" "}
                                for you to finalize your registration.
                            </Typography>
                            <Typography>Thanks</Typography>
                            <br />
                            <br />
                            <h5>
                                <Link to="/" replace>
                                    Home page
                                </Link>
                                .
                            </h5>
                            <br />
                            <Typography>
                                For any issue, visit the easy school{" "}
                                <Link to="/help">help page</Link>.
                            </Typography>{" "}
                        </Box>
                    )}
                </Paper>
            </Container>
        </main>
    );
}
