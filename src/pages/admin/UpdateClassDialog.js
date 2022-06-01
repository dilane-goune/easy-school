import React, { useState } from "react";
import Select from "../../components/Select";
import { ReactSortable } from "react-sortablejs";
import {
    Box,
    Button,
    Typography,
    InputAdornment,
    FormControl,
    IconButton,
    Dialog,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CloseIcon from "@mui/icons-material/Close";
import { Transition } from "./AdminClasses";

export default function UpdateClassDialog({
    open,
    onClose,
    teachers,
    courses = [],
    originalCourses,
    onSave,
}) {
    const [classCourses, setClassCourses] = useState(
        originalCourses.map((oc) => {
            const obj = courses.find((fc) => fc.courseCode === oc.courseCode);
            return { ...oc, name: obj?.name, isOldCourse: true };
        })
    );

    const initialState = {
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
            if (action.type === "RESET") return initialState;
            throw new Error("no dispatch have catch");
        },
        initialState
    );

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: "relative" }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        sx={{ ml: 2, flex: 1 }}
                        variant="h6"
                        component="div"
                    >
                        Edit Class
                    </Typography>
                    <Button
                        autoFocus
                        color="inherit"
                        onClick={() => onSave(classCourses)}
                    >
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Box px="30px" py="10px">
                <Typography variant="h6">Add Courses</Typography>
                {/* new course */}
                <Box>
                    <Box
                        component="form"
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Select
                            sx={{ minWidth: "30%" }}
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
                        <Autocomplete
                            sx={{ width: "30%" }}
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
                            onInputChange={(event, value, reason) => {
                                if (reason === "clear") {
                                    dispatchNewCourse({
                                        type: "COURSE",
                                        payload: { name: "", courseCode: "" },
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
                                            courseCode: obj.courseCode,
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
                            sx={{ width: "30%" }}
                            size="small"
                            label="Credit"
                            type="number"
                            value={newCourseState.credit}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val > 0)
                                    dispatchNewCourse({
                                        type: "CREDIT",
                                        payload: val,
                                    });
                            }}
                        />
                    </Box>

                    <Typography color="text.secondary" variant="body1">
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
                            <FormControl key={ind} sx={{ width: "30%" }}>
                                <TextField
                                    min="0"
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
                                        const val = parseFloat(e.target.value);
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
                        size="small"
                        disabled={
                            !newCourseState.name || !newCourseState.teacherId
                        }
                        onClick={() => {
                            setClassCourses([...classCourses, newCourseState]);
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
                            const confirmMessage =
                                "Do you really want to delete this course ? This is an old course";
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
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        },
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            sx={{ fontWeight: "medium" }}
                                            display="inline"
                                            variant="body1"
                                        >
                                            {ind + 1 + ". " + item.name}
                                        </Typography>
                                        <Typography
                                            sx={{ fontWeight: "medium" }}
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
                                            {" " + item.time.practices}
                                            <em>hrs</em>
                                            {" , "}
                                            <em>exercises :</em>
                                            {" " + item.time.exercises}
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
                                                if (item?.isOldCourse) {
                                                    if (
                                                        window.confirm(
                                                            confirmMessage
                                                        )
                                                    ) {
                                                        setClassCourses(
                                                            classCourses.filter(
                                                                (c) =>
                                                                    c.name !==
                                                                    item.name
                                                            )
                                                        );
                                                    }
                                                } else
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
            </Box>
        </Dialog>
    );
}
