import React, { useState } from "react";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Table from "../../components/Table";
import {
    Container,
    Box,
    Grid,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Backdrop,
    TextField,
    Divider,
} from "@mui/material";
import fetchData from "../../functions/fetchData";
import globalContext from "../../context/globalContext";
import postData from "../../functions/postData";

dayjs.extend(LocalizedFormat);

export default function Specializations() {
    // states
    const [selectedOption, setSelectedOption] = useState(1);

    const [currentSpecialization, setCurrentSpecialization] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [newSpecialization, setNewSpecialization] = useState({
        name: "",
        description: "",
    });

    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        fetchData("/api/admin/specializations").then((data) => {
            if (data instanceof Array) {
                setSpecializations(data);
                if (!data?.length) setSelectedOption(2);
            } else feedBack("Failed to fetch data");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // functions
    const { feedBack, dispatchApp } = React.useContext(globalContext);

    const handleNewSpecialization = async (e) => {
        try {
            setIsLoading(true);
            const { status, newToken, result } = await postData({
                url: "/api/admin/specializations",
                body: JSON.stringify({
                    name: newSpecialization.name.trim(),
                    description: newSpecialization.description.trim(),
                }),
                getJSON: true,
            });

            if (newToken) dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 409) {
                feedBack(
                    "There is already a specialization with this name.",
                    "warning"
                );
                return;
            }
            if (status === 201) {
                feedBack("Specialization added successfully.", "success");

                setSpecializations([
                    { ...newSpecialization, _id: result._id },
                    ...specializations,
                ]);
                setNewSpecialization({
                    name: "",
                    description: "",
                });
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.", "warning");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteSpecialization = async (id) => {
        try {
            setIsLoading(true);
            const { status, newToken } = await postData({
                url: "/api/admin/specializations/" + id,
                method: "DELETE",
            });

            if (newToken) dispatchApp({ type: "SET_TOKEN", token: newToken });

            if (status === 204) {
                feedBack("Specialization deleted successfully.", "success");

                setSpecializations(
                    specializations.filter((sp) => sp._id !== id)
                );
                setCurrentSpecialization(null);
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.", "warning");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <PageHeader title="Specializaions" noSearch />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Table
                        data={specializations.sort((a, b) => (a > b ? 1 : -1))}
                        headData={[{ label: "Name", key: "name" }]}
                        numbered
                        onClick={(data) => {
                            if (selectedOption !== 1) setSelectedOption(1);
                            setCurrentSpecialization(data);
                        }}
                        asPage

                        // small
                    />
                </Grid>
                <Grid item xs={6}>
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
                            New specialization
                        </Button>
                    </Box>
                    {selectedOption === 1 ? (
                        currentSpecialization ? (
                            <Paper sx={{ p: "10px", mt: "10px" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Properties
                                    </Typography>
                                    <Button
                                        onClick={() =>
                                            handleDeleteSpecialization(
                                                currentSpecialization._id
                                            )
                                        }
                                    >
                                        DELETE
                                    </Button>
                                </Box>
                                <Divider />
                                <Typography variant="h6">
                                    {currentSpecialization.name}
                                </Typography>
                                <Typography>
                                    {currentSpecialization.description}
                                </Typography>
                            </Paper>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{ textAlign: "center", mt: "20%" }}
                            >
                                Click a row to see it properties
                            </Typography>
                        )
                    ) : (
                        <Paper sx={{ px: "30px", py: "10px", mt: "10px" }}>
                            <Input
                                value={newSpecialization.name}
                                onChange={(val) =>
                                    setNewSpecialization({
                                        ...newSpecialization,
                                        name: val,
                                    })
                                }
                                sx={{ my: "5px" }}
                                label="Name"
                            />
                            <TextField
                                fullWidth
                                value={newSpecialization.description}
                                onChange={(e) =>
                                    setNewSpecialization({
                                        ...newSpecialization,
                                        description: e.target.value,
                                    })
                                }
                                sx={{ my: "5px" }}
                                label="Description"
                                multiline
                                minRows={4}
                            />
                            <Button
                                disabled={!newSpecialization.name}
                                onClick={handleNewSpecialization}
                                variant="contained"
                                size="small"
                            >
                                Save
                            </Button>
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
