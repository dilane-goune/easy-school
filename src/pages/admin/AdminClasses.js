import React, { useEffect, useState } from "react";
import Select from "../../components/Select";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import UpdateClassDialog from "./UpdateClassDialog";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Table from "../../components/Table";
import Label from "../../components/Label";
import { ReactSortable } from "react-sortablejs";
import {
    Container,
    Box,
    Grid,
    Button,
    Divider,
    Typography,
    InputAdornment,
    FormControl,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Slide,
    Paper,
    Backdrop,
    CircularProgress,
    TextField,
    Autocomplete,
} from "@mui/material";
import fetchData from "../../functions/fetchData";
import extendAdminToken from "../../functions/extendAdminToken";
import globalContext from "../../context/globalContext";

export const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

dayjs.extend(LocalizedFormat);

export default function Classes() {
    // states
    const [selectedOption, setSelectedOption] = useState(1);
    const [showInitializationModal, setShowInitializationModal] =
        useState(false);

    const [currentClass, setCurrentClass] = useState(null);
    const [courses, setCourses] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({
        name: "",
        level: "L1",
        specialization: "",
        teacher: "",
    });

    const [classCourses, setClassCourses] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [showUpdateClassModal, setShowUpdateClassModal] = useState(false);

    const initialCourse = {
        name: "",
        courseCode: "",
        teacherId: "",
        credit: 1,
        time: { theory: 0, practices: 0, exercises: 0 },
    };

    const [newCourseState, dispatchNewCourse] = React.useReducer(
        (newCourseState, action) => {
            if (action.type === "TEACHER")
                return { ...newCourseState, teacherId: action.payload };
            if (action.type === "COURSE")
                return {
                    ...newCourseState,
                    name: action.payload.name,
                    courseCode: action.payload.courseCode,
                };
            if (action.type === "NAME")
                return { ...newCourseState, name: action.payload };
            if (action.type === "CREDIT")
                return { ...newCourseState, credit: action.payload };
            if (action.type === "TIME")
                return { ...newCourseState, time: action.payload };
            if (action.type === "RESET") return initialCourse;
            throw new Error("no dispatch have catch");
        },
        initialCourse
    );

    const {
        feedBack,
        appState: { token },
        dispatchApp,
    } = React.useContext(globalContext);

    // effects
    useEffect(() => {
        fetchData("/api/admin/classes", true).then((data) => {
            if (typeof data === "object") {
                setSpecializations(data.specializations);
                setCourses(data.courses);
                setTeachers(data.teachers);
                if (!data?.classes.length) setSelectedOption(2);
                setClasses(data.classes);
            } else feedBack("Failed to fetch data.");
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // functions

    const handleNewClasse = async (e) => {
        newClass.courses = classCourses;
        newClass.classMasterId = teachers.find(
            (t) => t.name + " " + t.surName === newClass.teacher
        )?._id;

        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/admin/classes", {
                method: "POST",
                body: JSON.stringify(newClass),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendAdminToken();
                dispatchApp({ type: "SET_TOKEN", token: newToken });

                res = await fetch("/api/admin/classes", {
                    method: "POST",
                    body: JSON.stringify(newClass),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
            }

            if (res.status === 409) {
                feedBack("There is already a class with this code.");
                return;
            }
            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.");
                return;
            }

            feedBack("Class added successfully.", "success");

            const { _id } = await res.json();

            setClasses([
                ...classes,
                { ...newClass, _id, year: new Date().getFullYear() },
            ]);

            setClassCourses([]);
            setNewClass({
                name: "",
                level: newClass.level,
                classCodeode: "",
                specialization: newClass.specialization,
            });
            dispatchNewCourse({ type: "RESET" });
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };
    const handleUpdateClassCourses = async (courses) => {
        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/admin/classes/" + currentClass._id, {
                method: "PUT",
                body: JSON.stringify(courses),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendAdminToken();
                dispatchApp({ type: "SET_TOKEN", token: newToken });

                res = await fetch("/api/admin/classes/" + currentClass._id, {
                    method: "PUT",
                    body: JSON.stringify(courses),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
            }

            if (res.status === 200) {
                feedBack("Courses updated successfully.", "success");
                setClasses(
                    classes.map((c) => {
                        if (c._id === currentClass._id)
                            return { ...c, courses };
                        return c;
                    })
                );
                setCurrentClass({ ...currentClass, courses });
                setShowUpdateClassModal(false);
            } else {
                feedBack("Sothing when wrong. Please try again.");
            }
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.");
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const initializeAcademicYear = async () => {
        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/admin/initialize-academic-year", {
                headers: { authorization: "BEARER " + token },
                method: "POST",
            });

            if (res.status === 403) {
                newToken = await extendAdminToken();

                res = await fetch("/api/admin/initialize-academic-year", {
                    headers: { authorization: "BEARER " + newToken },
                    method: "POST",
                });
                dispatchApp({ type: "SET_TOKEN", token: newToken });
            }

            if (res.status === 404) {
                feedBack("connection error");
                return;
            }
            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }

            feedBack("Course added successfully.", "success");
        } catch (e) {
            feedBack("Sothing when wrong. Please try again.", "warning");
            console.log(e);
        } finally {
            setIsLoading(false);
            setShowInitializationModal(false);
        }
    };

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    "& .MuiButton-root": { ml: "10px" },
                }}
            >
                <PageHeader title="Classes" noSearch />{" "}
                <Box>
                    <Button
                        onClick={() => setShowInitializationModal(true)}
                        size="small"
                        variant="contained"
                    >
                        Iniatialize academic year
                    </Button>
                </Box>
            </Box>
            <Divider sx={{ my: "10px" }} />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Table
                        data={classes}
                        headData={[
                            { label: "Name", key: "name" },
                            { label: "Level", key: "level" },
                        ]}
                        numbered
                        onClick={(data) => {
                            if (selectedOption !== 1) setSelectedOption(1);
                            setCurrentClass(data);
                        }}
                        asPage
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
                            New Class
                        </Button>
                    </Box>
                    {selectedOption === 1 ? (
                        currentClass ? (
                            <Paper sx={{ p: "10px" }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Properties
                                    </Typography>
                                    <Button
                                        onClick={() => {
                                            setShowUpdateClassModal(true);
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
                                <Label label="Year" value={currentClass.year} />
                                <Label
                                    label="Level"
                                    value={currentClass.level}
                                />

                                <Divider />
                                <Typography variant="h6">Courses</Typography>
                                <Box padding="0 20px">
                                    <Table
                                        small
                                        data={currentClass.courses.map((c) => {
                                            return {
                                                name: courses.find(
                                                    (co) =>
                                                        co.courseCode ===
                                                        c.courseCode
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
                        <Box px="30px" py="10px">
                            <Input
                                value={newClass.name}
                                onChange={(val) =>
                                    setNewClass({ ...newClass, name: val })
                                }
                                sx={{ my: "5px" }}
                                label="Classe Name"
                                siz="20px"
                            />
                            <Box component="form" display="flex">
                                <Select
                                    sx={{ my: "5px", width: "30%", mr: "20px" }}
                                    options={["L1", "L2", "L3", "M1", "M2"]}
                                    label="Level"
                                    onChange={(val) => {
                                        setClassCourses(
                                            classCourses.filter(
                                                (c) => c.level === val
                                            )
                                        );
                                        setNewClass({
                                            ...newClass,
                                            level: val,
                                        });
                                    }}
                                    value={newClass.level}
                                />
                                <Select
                                    sx={{ width: "70%", my: "5px" }}
                                    options={specializations.map(
                                        (sp) => sp.name
                                    )}
                                    label="Specialization"
                                    onChange={(val) => {
                                        setNewClass({
                                            ...newClass,
                                            specialization: val,
                                        });
                                    }}
                                    value={newClass.specialization}
                                />
                            </Box>
                            <Select
                                sx={{ my: "5px" }}
                                options={teachers.map(
                                    (t) => t.name + " " + t.surName
                                )}
                                label="Class Master"
                                onChange={(val) => {
                                    setNewClass({
                                        ...newClass,
                                        teacher: val,
                                    });
                                }}
                                value={newClass.teacher}
                            />

                            <Typography variant="h6">Add Courses</Typography>
                            {/* new course */}
                            <Box>
                                <Box component="form" sx={{ display: "flex" }}>
                                    <Autocomplete
                                        sx={{ width: "79%", mt: "10px" }}
                                        size="small"
                                        isOptionEqualToValue={(op, val) =>
                                            op.courseCode === val.courseCode
                                        }
                                        disablePortal
                                        options={courses.map((c) => c.name)}
                                        value={newCourseState.name}
                                        renderInput={(params) => (
                                            <TextField
                                                size="small"
                                                {...params}
                                                label="Select Course"
                                            />
                                        )}
                                        onInputChange={(
                                            event,
                                            value,
                                            reason
                                        ) => {
                                            if (reason === "clear") {
                                                dispatchNewCourse({
                                                    type: "COURSE",
                                                    payload: {
                                                        name: "",
                                                        courseCode: "",
                                                    },
                                                });
                                                return;
                                            }
                                            const obj = courses.find(
                                                (c) => c.name === value
                                            );
                                            if (obj) {
                                                dispatchNewCourse({
                                                    type: "COURSE",
                                                    payload: {
                                                        name: obj.name,
                                                        courseCode:
                                                            obj.courseCode,
                                                    },
                                                });
                                            }
                                        }}
                                        filterOptions={(options) =>
                                            options.filter(
                                                (opt) =>
                                                    !classCourses.find(
                                                        (cc) => cc.name === opt
                                                    )
                                            )
                                        }
                                    />

                                    <TextField
                                        sx={{
                                            mt: "10px",
                                            ml: "1%",
                                            width: "20%",
                                        }}
                                        size="small"
                                        label="Credit"
                                        type="number"
                                        value={newCourseState.credit}
                                        onChange={(e) => {
                                            const val = parseFloat(
                                                e.target.value
                                            );
                                            if (val > 0)
                                                dispatchNewCourse({
                                                    type: "CREDIT",
                                                    payload: val,
                                                });
                                        }}
                                    />
                                </Box>

                                <Select
                                    sx={{ minWidth: "40%", my: "5px" }}
                                    options={teachers.map((t) => ({
                                        value: t._id,
                                        label: t.name + " " + t.surName,
                                    }))}
                                    label="Teacher"
                                    onChange={(val) =>
                                        dispatchNewCourse({
                                            type: "TEACHER",
                                            payload: val,
                                        })
                                    }
                                    value={newCourseState.teacherId}
                                />
                                <Typography
                                    color="text.secondary"
                                    variant="body1"
                                >
                                    Timing
                                </Typography>
                                <Box
                                    sx={{ mt: "10px" }}
                                    component="form"
                                    display="flex"
                                    justifyContent="space-between"
                                >
                                    {[
                                        { label: "Theory", key: "theory" },
                                        { label: "Pratices", key: "practices" },
                                        { label: "Execises", key: "exercises" },
                                    ].map(({ key, label }, ind) => (
                                        <FormControl
                                            key={ind}
                                            sx={{ width: "30%" }}
                                        >
                                            <TextField
                                                size="small"
                                                label={label}
                                                type="number"
                                                value={newCourseState.time[key]}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="start">
                                                            hrs
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                onChange={(e) => {
                                                    const val = parseFloat(
                                                        e.target.value
                                                    );
                                                    if (val >= 0)
                                                        dispatchNewCourse({
                                                            type: "TIME",
                                                            payload: {
                                                                ...newCourseState.time,
                                                                [key]: val,
                                                            },
                                                        });
                                                }}
                                            />
                                        </FormControl>
                                    ))}
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Button
                                    disabled={
                                        !newCourseState.name ||
                                        !newCourseState.teacherId
                                    }
                                    size="small"
                                    onClick={() => {
                                        setClassCourses([
                                            ...classCourses,
                                            newCourseState,
                                        ]);
                                        dispatchNewCourse({ type: "RESET" });
                                    }}
                                >
                                    ADD COURSE
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                }}
                            >
                                <ReactSortable
                                    list={classCourses}
                                    setList={setClassCourses}
                                >
                                    {classCourses.map((item, ind) => {
                                        const teacher = teachers.find(
                                            (t) => t._id === item.teacherId
                                        );
                                        return (
                                            <Box
                                                key={item.name}
                                                sx={{
                                                    border: "1px solid #ada8a8",
                                                    cursor: "grab",
                                                    mb: "5px",
                                                    p: "5px 10px",
                                                    "& .MuiBox-root": {
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                    },
                                                }}
                                            >
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight:
                                                                "medium",
                                                        }}
                                                        display="inline"
                                                        variant="body1"
                                                    >
                                                        {ind +
                                                            1 +
                                                            ". " +
                                                            item.name}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontWeight:
                                                                "medium",
                                                        }}
                                                        display="inline"
                                                        variant="body1"
                                                    >
                                                        {teacher?.name +
                                                            " " +
                                                            teacher?.surName}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            opacity: 0.6,
                                                            ml: "5px",
                                                        }}
                                                        variant="body1"
                                                    >
                                                        <em>theory :</em>
                                                        {" " + item.time.theory}
                                                        <em>hrs</em>
                                                        {" , "}
                                                        <em>practices :</em>
                                                        {" " +
                                                            item.time.practices}
                                                        <em>hrs</em>
                                                        {" , "}
                                                        <em>exercises :</em>
                                                        {" " +
                                                            item.time.exercises}
                                                        <em>hrs</em>
                                                    </Typography>
                                                    <Button
                                                        color={
                                                            item.isOldCourse
                                                                ? "error"
                                                                : "primary"
                                                        }
                                                        sx={{ p: 0 }}
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => {
                                                            setClassCourses(
                                                                classCourses.filter(
                                                                    (c) =>
                                                                        c.name !==
                                                                        item.name
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        REMOVE
                                                    </Button>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </ReactSortable>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Button
                                    onClick={handleNewClasse}
                                    disabled={
                                        !newClass.name ||
                                        !newClass.specialization ||
                                        !newClass.teacher ||
                                        isLoading
                                    }
                                    variant="contained"
                                    size="small"
                                    sx={{ mt: "5px" }}
                                >
                                    Add Class
                                </Button>
                            </Box>
                        </Box>
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
            <Dialog
                open={showInitializationModal}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setShowInitializationModal(false)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Easy School"}</DialogTitle>
                <DialogContent>
                    <Box>
                        <Typography variant="body1">
                            Iniatializing an academic year consist of :
                        </Typography>
                        <Box component="ul">
                            <Typography component="li" variant="body2">
                                Creating academic year classes for all the
                                classes in the system.
                            </Typography>
                            <Typography component="li" variant="body2">
                                SubStituting last year class masters to th new
                                academic classes.
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowInitializationModal(false)}>
                        Not Now
                    </Button>
                    <Button onClick={initializeAcademicYear}>
                        Iniatialize
                    </Button>
                </DialogActions>
            </Dialog>
            {currentClass && (
                <UpdateClassDialog
                    open={showUpdateClassModal}
                    onClose={() => setShowUpdateClassModal(false)}
                    courses={courses}
                    originalCourses={currentClass.courses}
                    teachers={teachers}
                    onSave={handleUpdateClassCourses}
                />
            )}
        </Container>
    );
}
