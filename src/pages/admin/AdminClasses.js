import React, { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import NewClassDialog from "./NewClass";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Table from "../../components/Table";
import Label from "../../components/Label";
import MyDialog from "../../components/MyDialog";
import {
    Container,
    Box,
    Grid,
    Button,
    Divider,
    Typography,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import fetchData from "../../functions/fetchData";
import postData from "../../functions/postData";
import globalContext from "../../context/globalContext";

dayjs.extend(LocalizedFormat);

export default function Classes() {
    // states

    const [currentClass, setCurrentClass] = useState(null);
    const [courses, setCourses] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [classes, setClasses] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [showNewClassDialog, setShowNewClassDialog] = useState(false);
    const [showUpdateClassDialog, setShowUpdateClassDialog] = useState(false);

    const {
        feedBack,
        dispatchApp,
        appState: { user },
    } = React.useContext(globalContext);

    // effects
    useEffect(() => {
        fetchData("/api/admin/classes", true).then((data) => {
            if (typeof data === "object") {
                setSpecializations(data.specializations);
                setCourses(data.courses);
                setTeachers(data.teachers);
                setClasses(data.classes);
            } else feedBack("Failed to fetch data.");
        });
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // functions

    const handleNewClasse = async (_class, isUpdate) => {
        setIsLoading(true);
        try {
            const { status, result, newToken } = await postData({
                url: isUpdate
                    ? "/api/admin/classes/" + _class._id
                    : "/api/admin/classes",
                body: JSON.stringify(_class),
                getJSON: !isUpdate ? true : false,
                method: isUpdate ? "PUT" : "POST",
            });
            if (newToken) dispatchApp({ type: "NEW_TOKEN", token: newToken });

            if (status === 409) {
                feedBack(`
            There is already a class with this name or with this specialization and level.`);
                return;
            }
            if (status === 500) {
                feedBack("Sothing when wrong. Please try again.");
                return;
            }
            if (status === 200) {
                if (isUpdate) {
                    const classMaster = teachers.find(
                        (t) => t._id === _class.classMasterId
                    );
                    if (
                        user.classId === currentClass.classMasterId &&
                        currentClass.classMasterId !== _class.classMasterId
                    ) {
                        dispatchApp({
                            type: "SET_USER",
                            user: { ...user, classId: null },
                        });
                    }

                    const classMasterName = classMaster
                        ? classMaster.name + " " + classMaster.surName
                        : "none";
                    feedBack("Courses updated successfully.", "success");
                    setClasses(
                        classes.map((c) => {
                            if (c._id === currentClass._id) return _class;
                            return c;
                        })
                    );
                    setTeachers((teachers) =>
                        teachers.map((t) => {
                            if (
                                user._id === t._id &&
                                currentClass.classMasterId !==
                                    _class.classMasterId
                            )
                                return { ...t, classId: null };
                            return t;
                        })
                    );
                    setCurrentClass({
                        ..._class,
                        classMasterName,
                        classMasterId: _class.classMasterId,
                    });
                } else {
                    feedBack("Courses added successfully.", "success");
                    setClasses([{ _id: result._id, ..._class }, ...classes]);
                }
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
            setShowNewClassDialog(false);
            setShowUpdateClassDialog(false);
            setCurrentClass(null);
        }
    };

    const handleNewClassDialog = (isUpdate) => {
        if (isUpdate) setShowUpdateClassDialog(true);
    };

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff" }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    pt: "10px",
                }}
            >
                <PageHeader title="Classes" noSearch />
                <Button
                    onClick={() => setShowNewClassDialog(true)}
                    variant="contained"
                    sx={{ size: "small", borderRadius: "20px" }}
                >
                    new class
                </Button>
            </Box>
            <Divider sx={{ my: "10px" }} />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Table
                        headData={[
                            { label: "Name", key: "name" },
                            { label: "Level", key: "level" },
                            { label: "Specialization", key: "specialization" },
                            { label: "Class master", key: "classMasterName" },
                            { label: "Action", key: "action" },
                        ]}
                        data={classes.map((c) => {
                            const classMaster = teachers.find(
                                (t) => t._id === c.classMasterId
                            );

                            const classMasterName = classMaster
                                ? classMaster.name + " " + classMaster.surName
                                : "none";
                            const action = (
                                <Button
                                    onClick={() => {
                                        setCurrentClass({
                                            ...c,
                                            classMasterName,
                                        });
                                        setShowMoreModal(true);
                                    }}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderRadius: "20px" }}
                                >
                                    more
                                </Button>
                            );
                            return { ...c, classMasterName, action };
                        })}
                        numbered
                        asPage
                    />
                </Grid>
            </Grid>

            {showMoreModal && currentClass && (
                <MyDialog
                    open
                    onClose={() => setShowMoreModal(false)}
                    helperText={
                        "In Time, T : Theory, P : Praticals, E : Exercises."
                    }
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6">Properties</Typography>
                        <Button
                            onClick={() => {
                                handleNewClassDialog(true);
                            }}
                            color="error"
                        >
                            Edit
                        </Button>
                    </Box>

                    <Label label="ID" value={currentClass._id} />
                    <Label label="Name" value={currentClass.name} />
                    <Label
                        label="Specialization"
                        value={currentClass.specialization}
                    />
                    <Label label="Level" value={currentClass.level} />
                    <Label
                        label="Class Master"
                        value={currentClass.classMasterName}
                    />

                    <Divider />
                    <Typography variant="h6">Courses</Typography>
                    <Box>
                        <Table
                            small
                            data={currentClass.courses.map((c) => {
                                return {
                                    name: courses.find(
                                        (co) => co.courseCode === c.courseCode
                                    )?.name,
                                    courseCode: c.courseCode,
                                    credit: c.credit,
                                    time:
                                        c.time?.theory +
                                        ", " +
                                        c.time?.practices +
                                        ", " +
                                        c.time?.exercises,
                                };
                            })}
                            headData={[
                                { label: "Name", key: "name" },
                                {
                                    label: "Code",
                                    key: "courseCode",
                                },
                                {
                                    label: "Credit",
                                    key: "credit",
                                },
                                {
                                    label: "Time [T, P, E] (hrs)",
                                    key: "time",
                                    minWidth: "150px",
                                    pp: "150px",
                                },
                            ]}
                            noFooter
                        />
                    </Box>
                </MyDialog>
            )}
            {showUpdateClassDialog && (
                <NewClassDialog
                    {...{
                        teachers,
                        courses,
                        open: true,
                        specializations,
                        originalClass: currentClass,
                        onClose: () => {
                            setShowUpdateClassDialog(false);
                        },
                        onSave: handleNewClasse,
                    }}
                />
            )}
            {showNewClassDialog && (
                <NewClassDialog
                    {...{
                        teachers,
                        courses,
                        open: true,
                        specializations,
                        onClose: () => {
                            setShowNewClassDialog(false);
                        },
                        onSave: handleNewClasse,
                    }}
                />
            )}
        </Container>
    );
}
