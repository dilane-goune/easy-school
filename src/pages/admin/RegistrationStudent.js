import React, { useState } from "react";
import {
    Container,
    Grid,
    Paper,
    Divider,
    Box,
    Button,
    CircularProgress,
    Backdrop,
    Typography,
} from "@mui/material";
import Label from "../../components/Label";
import globalContext from "../../context/globalContext";
import postData from "../../functions/postData";

function RegistrationStudent() {
    // states
    const [isLoading, setIsLoading] = useState(false);

    const [student] = React.useState(
        JSON.parse(sessionStorage.getItem("registration-student")) || {}
    );

    const studentId = student._id;

    // functions

    const { feedBack, dispatchApp } = React.useContext(globalContext);

    const confirmRegistration = async () => {
        try {
            setIsLoading(true);

            const { status, newToken } = await postData({
                url: `/api/admin/registrations/${studentId}/${student.classId}`,
                method: "PUT",
            });
            newToken && dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 404) {
                feedBack(
                    `Student not found. This operation may have 
                    just been done by another admin.`
                );
                return;
            }

            if (status === 500) {
                feedBack(`Operation failed. This may be due to some temporal server error. 
                Please try again`);
                return;
            }

            if (status === 201) {
                feedBack("Student confirmed successufully.", "success");
                sessionStorage.removeItem("registration-student");
            }
        } catch (e) {
            feedBack(
                "Error. You may be offline or your have poor internet connection."
            );
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const rejectRegistration = async (reason) => {
        try {
            setIsLoading(true);

            const { status, newToken } = await postData({
                url: `/api/admin/registrations/${studentId}/${student.classId}`,
                method: "PUT",
            });
            newToken && dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 400) {
                feedBack("Student is already confirmed.", "warning");
                return;
            }
            if (status === 401) {
                feedBack(
                    "Unauthorized. you may need to logout and login again"
                );
                return;
            }
            if (status === 404) {
                feedBack(
                    "Student not found. This operation may have just been done by another admin.",
                    "warning"
                );

                return;
            }

            if (status === 500) {
                feedBack(
                    "Operation failed. This may be due to some temporal server error. Please try again"
                );
                return;
            }

            if (status === 204) {
                feedBack("Student rejected successufully.", "success");
            }
        } catch (e) {
            console.log(e);
            feedBack(
                "Error. You may be offline or your have poor internet connection."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12} md={10}>
                    <Paper sx={{ p: { xs: "5px", md: "10px" }, mt: "10px" }}>
                        <Label
                            label="Full name"
                            value={student?.name + " " + student?.surName}
                        />
                        <Label label="Email" value={student.email} />
                        <Label label="Telephone" value={student.telephone} />
                        <Label label="Country" value={student.country?.name} />
                        <Divider />
                        <Label
                            label="Specialization"
                            value={student.specialization}
                        />
                        <Label
                            label="Admission Level"
                            value={student.admissionLevel}
                        />
                    </Paper>
                </Grid>
                <Grid item md={2} xs={12}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "row-reverse", md: "column" },
                            justifyContent: "space-evenly",
                            height: { md: "100%" },
                            width: { xs: "100%", md: "initial" },
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: "20px" }}
                            onClick={() => {
                                const confirmation = window.confirm(
                                    "Do you really want to confirm this student?"
                                );
                                if (confirmation) confirmRegistration();
                            }}
                        >
                            Confirm
                        </Button>
                        <Button
                            onClick={() => {
                                const reason = window.prompt(
                                    "Enter the reason of the rejection"
                                );
                                if (reason === "")
                                    return alert("you must provide a reason");
                                if (reason?.trim()) rejectRegistration(reason);
                            }}
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: "20px" }}
                        >
                            Reject
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: "5px", md: "10px" }, mt: "10px" }}>
                        <Typography>Admission certificate</Typography>
                        <img
                            style={{
                                width:
                                    window.innerWidth < 400 ? "100%" : "400px",
                            }}
                            alt="Admission certificate"
                            src={
                                "/api/registration-files/" +
                                student.certificateFile
                            }
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: { xs: "5px", md: "10px" }, mt: "10px" }}>
                        <Typography>ID Card</Typography>
                        <img
                            style={{
                                width: "400px",
                            }}
                            alt="IDCardFile"
                            src={
                                "/api/registration-files/" + student.IDCardFile
                            }
                        />
                    </Paper>
                </Grid>
            </Grid>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Container>
    );
}
export default RegistrationStudent;
