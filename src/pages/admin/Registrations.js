/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import Table from "../../components/Table";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Container,
    Typography,
    CircularProgress,
    Backdrop,
} from "@mui/material";
import globalContext from "../../context/globalContext";
import fetchData from "../../functions/fetchData";

dayjs.extend(LocalizedFormat);

function Registrations() {
    // states
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // eslint-disable-next-line no-unused-vars
    const [skip, setSkip] = useState(0);

    // functions
    const { feedBack } = React.useContext(globalContext);

    React.useEffect(() => {
        fetchData(`/api/admin/registrations?skip=${skip}`, true).then(
            (data) => {
                if (data instanceof Array) setStudents(data);
                else feedBack("Failed to fetch data");
                setIsLoading(false);
            }
        );
    }, []);

    return (
        <Container>
            <Typography variant="h4">Registrations</Typography>

            {students.length ? (
                <Table
                    headData={[
                        {
                            label: "Name",
                            key: "name",
                            sx: { whiteSpace: "nowrap" },
                        },
                        {
                            label: "Surname",
                            key: "surName",
                            sx: { whiteSpace: "nowrap" },
                        },
                        {
                            label: "Email",
                            key: "email",
                            sx: { whiteSpace: "nowrap" },
                        },
                        { label: "Gender", key: "gender" },
                        {
                            label: "Specialization",
                            key: "specialization",
                            minWidth: "100px",
                        },
                        { label: "Level", key: "admissionLevel" },
                        {
                            label: "Date",
                            key: "createdAt",
                            minWidth: "100px",
                        },
                        {
                            label: "Action",
                            key: "action",
                            sx: { textAlign: "center" },
                        },
                    ]}
                    data={students.map((s) => {
                        s.createdAt = dayjs(s.createdAt).format("lll");
                        const action = (
                            <Button
                                sx={{ borderRadius: "20px" }}
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                    window.registrationStudent = s;
                                    navigate(s._id);
                                    sessionStorage.setItem(
                                        "registration-student",
                                        JSON.stringify(s)
                                    );
                                }}
                            >
                                more
                            </Button>
                        );
                        return { ...s, action };
                    })}
                    small
                />
            ) : (
                <h4>
                    <center>Empty List</center>
                </h4>
            )}
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

export default Registrations;
