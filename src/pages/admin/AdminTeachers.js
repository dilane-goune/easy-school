import React, { useState } from "react";
import Select from "../../components/Select";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Table from "../../components/Table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Container,
    Box,
    Grid,
    Button,
    Divider,
    Typography,
    Paper,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import RadioButtons from "../../components/RadioButtons";
import Label from "../../components/Label";
import "../../styles/main.css";
import { emailRegEx, telRegex } from "../../functions/regex";
import CountrySelect from "../../components/CountryPicker";
import globalContext from "../../context/globalContext";
import fetchData from "../../functions/fetchData";
import postData from "../../functions/postData";

dayjs.extend(LocalizedFormat);

const defaultTeacher = {
    email: "",
    name: "",
    surName: "",
    gender: "M",
    dateOfBirth: "",
    country: { code: "CM", name: "Cameroon", phone: 237, flag: "🇨🇲" },
    telephone: "",
    diplomat: "",
    specialization: "",
};

export default function AdminTeachers() {
    // states

    const [newTeacher, setNewTeacher] = useState(defaultTeacher);

    const [selectedOption, setSelectedOption] = useState(1);

    const [currentTeacher, setCurrentCouse] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [specializations, setSpecializations] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const { feedBack, dispatchApp } = React.useContext(globalContext);

    React.useEffect(() => {
        fetchData("/api/admin/teachers").then((data) => {
            if (data instanceof Object) {
                setTeachers(data.teachers);
                setSpecializations(data.specializations);
            } else feedBack("Failed to fetch data");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // functions
    const handleForm = (key, value) => {
        setNewTeacher({ ...newTeacher, [key]: value });
    };

    const validForm = () => {
        if (
            emailRegEx.test(newTeacher.email) &&
            telRegex.test(newTeacher.telephone) &&
            newTeacher.name &&
            newTeacher.surName &&
            newTeacher.dateOfBirth &&
            newTeacher.specialization
        )
            return true;
        return false;
    };

    const handleNewTeacher = async (e) => {
        newTeacher.countryCode = newTeacher.country.code;
        try {
            setIsLoading(true);

            const { status, newToken, result } = await postData({
                url: "/api/admin/teachers",
                body: JSON.stringify(newTeacher),
                getJSON: true,
            });
            newToken && dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 409) {
                feedBack("A teacher with this email alredy exist.");
                return;
            }
            if (status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            feedBack("Teacher added successfully.", "success");

            const { _id, createdAt } = result;

            setTeachers([...teachers, { ...newTeacher, _id, createdAt }]);

            setNewTeacher(defaultTeacher);
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.", "warning");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <PageHeader title="Teachers" noSearch />

            <Grid container spacing={2}>
                <Grid item xs={7}>
                    <Table
                        data={teachers}
                        headData={[
                            { label: "Name", key: "name" },
                            { label: "Surname", key: "surName" },
                            { label: "Email", key: "email" },
                            { label: "Telephone", key: "telephone" },
                            { label: "Department.", key: "specialization" },
                        ]}
                        numbered
                        actionItem={<MoreVertIcon size={18} />}
                        onClick={(data) => {
                            if (selectedOption !== 1) setSelectedOption(1);
                            setCurrentCouse(data);
                        }}
                        asPage
                    />
                </Grid>
                <Grid item xs={5}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                    >
                        <Button
                            size="small"
                            variant={
                                selectedOption === 1 ? "contained" : "outlined"
                            }
                            sx={{
                                borderRadius: "20px",
                            }}
                            onClick={() => {
                                setSelectedOption(1);
                            }}
                        >
                            Properties
                        </Button>
                        <Button
                            size="small"
                            variant={
                                selectedOption === 2 ? "contained" : "outlined"
                            }
                            sx={{
                                borderRadius: "20px",
                            }}
                            onClick={() => {
                                setSelectedOption(2);
                            }}
                        >
                            New Teacher
                        </Button>
                    </Box>
                    {selectedOption === 1 ? (
                        currentTeacher ? (
                            <Paper sx={{ px: "10px", my: "10px" }}>
                                <Typography variant="h6">Properties</Typography>

                                <Label label="ID" value={currentTeacher._id} />
                                <Label
                                    label="Full name"
                                    value={
                                        currentTeacher.name +
                                        " " +
                                        currentTeacher.surName
                                    }
                                />
                                <Label
                                    label="Gender & date of birth"
                                    value={
                                        <Typography
                                            component="span"
                                            fontWeight="medium"
                                            width="55%"
                                        >
                                            {currentTeacher.gender === "M"
                                                ? "Male"
                                                : "Female"}{" "}
                                            <em
                                                style={{
                                                    fontWeight: "lighter",
                                                }}
                                            >
                                                born on
                                            </em>{" "}
                                            {dayjs(
                                                currentTeacher.dateOfBirth
                                            ).format("ll")}
                                        </Typography>
                                    }
                                />
                                <Label
                                    label="Email"
                                    value={currentTeacher.email}
                                />
                                <Label
                                    label="Telephone and region"
                                    value={
                                        <Typography
                                            component="span"
                                            fontWeight="medium"
                                            width="55%"
                                        >
                                            {currentTeacher.telephone}{" "}
                                            <em
                                                style={{
                                                    fontWeight: "lighter",
                                                }}
                                            >
                                                ,
                                            </em>{" "}
                                            {currentTeacher.country?.name}
                                        </Typography>
                                    }
                                />

                                <Label
                                    label="Specialisation"
                                    value={currentTeacher.specialization}
                                />
                                <Label
                                    label="Last Login"
                                    value={
                                        currentTeacher.lastLogin
                                            ? dayjs(
                                                  currentTeacher.lastLogin
                                              ).format("lll")
                                            : "never"
                                    }
                                />

                                <Divider />
                            </Paper>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{ textAlign: "center", mt: "20%" }}
                            >
                                Select a row to see it properties
                            </Typography>
                        )
                    ) : (
                        <Paper sx={{ p: "10px" }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Input
                                        onChange={(val) =>
                                            handleForm("name", val)
                                        }
                                        label="Name"
                                        required
                                        value={newTeacher.name}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Input
                                        onChange={(val) =>
                                            handleForm("surName", val)
                                        }
                                        label="SurName"
                                        required
                                        value={newTeacher.surName}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Input
                                        focused
                                        type="date"
                                        onChange={(val) =>
                                            handleForm("dateOfBirth", val)
                                        }
                                        label="Date of birth"
                                        required
                                        value={newTeacher.dateOfBirth}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Input
                                        type="email"
                                        onChange={(val) =>
                                            handleForm("email", val)
                                        }
                                        label="Email"
                                        required
                                        value={newTeacher.email}
                                        error={
                                            !emailRegEx.test(
                                                newTeacher.email
                                            ) && newTeacher.email !== ""
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Input
                                        onChange={(val) =>
                                            handleForm("telephone", val)
                                        }
                                        label="Telephone"
                                        required
                                        value={newTeacher.telephone}
                                        error={
                                            !telRegex.test(
                                                newTeacher.telephone
                                            ) && newTeacher.telephone !== ""
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <CountrySelect
                                        onChange={(val) => {
                                            setNewTeacher({
                                                ...newTeacher,
                                                country: val,
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <RadioButtons
                                        label="Gender"
                                        options={[
                                            { value: "M", label: "Male" },
                                            { value: "F", label: "Female" },
                                        ]}
                                        value={newTeacher.gender}
                                        onChange={(val) =>
                                            handleForm("gender", val)
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}></Grid>
                                <Grid item xs={12} md={7}>
                                    <Select
                                        options={specializations}
                                        label="Specialisation"
                                        onChange={(val) => {
                                            handleForm("specialization", val);
                                        }}
                                        value={newTeacher.specialization}
                                    />
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Select
                                        options={[
                                            "Master",
                                            "PhD",
                                            "Doctorat",
                                            "Professor",
                                        ]}
                                        label="Diplomat"
                                        onChange={(val) => {
                                            handleForm("diplomat", val);
                                        }}
                                        value={newTeacher.diplomat}
                                    />
                                </Grid>
                            </Grid>

                            <Box display="flex" justifyContent="center">
                                <Button
                                    onClick={handleNewTeacher}
                                    disabled={!validForm() || isLoading}
                                    variant="contained"
                                    size="small"
                                    sx={{ mt: "5px" }}
                                >
                                    Add Teacher
                                </Button>
                            </Box>
                        </Paper>
                    )}
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
