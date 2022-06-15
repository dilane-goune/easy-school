import React, { useReducer } from "react";
import Select from "../../components/Select";
import Input from "../../components/Input";
import MyDialog from "../../components/MyDialog";
import { ReactSortable } from "react-sortablejs";
import {
    Box,
    Button,
    Typography,
    InputAdornment,
    FormControl,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";

NewClass.propTypes = {
    isUpdate: PropTypes.bool,
    originalClass: PropTypes.object,
    teachers: PropTypes.array.isRequired,
    courses: PropTypes.array.isRequired,
    specializations: PropTypes.array.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default function NewClass({
    originalClass,
    teachers,
    courses,
    specializations,
    open,
    onClose,
    onSave,
}) {
    const initialClass = {
        _id: originalClass ? originalClass._id : undefined,
        name: originalClass ? originalClass.name : "",
        level: originalClass ? originalClass.level : "L1",
        specialization: originalClass ? originalClass.specialization : "",
        classMasterId: originalClass ? originalClass.classMasterId : "",
        courses: originalClass
            ? originalClass.courses.map((c) => {
                  const course = courses.find(
                      (fc) => fc.courseCode === c.courseCode
                  );
                  return { ...c, name: course?.name };
              })
            : [],
    };

    const [_class, dispatchClass] = useReducer((state, action) => {
        if (action.type === "NAME") return { ...state, name: action.payload };
        if (action.type === "LEVEL") return { ...state, level: action.payload };
        if (action.type === "SPEC")
            return { ...state, specialization: action.payload };
        if (action.type === "CMI")
            return { ...state, classMasterId: action.payload };
        if (action.type === "COURSES")
            return { ...state, courses: action.payload };
        throw new Error("no dispath match");
    }, initialClass);

    const initialCourse = {
        courseCode: "",
        teacherId: "",
        credit: 1,
        time: { theory: 0, practices: 0, exercises: 0 },
    };

    const [newCourse, dispatchNewCourse] = React.useReducer((state, action) => {
        if (action.type === "CC")
            return {
                ...state,
                courseCode: action.payload.value,
                name: action.payload.label,
            };

        if (action.type === "TEACHER")
            return { ...state, teacherId: action.payload };

        if (action.type === "NAME") return { ...state, name: action.payload };

        if (action.type === "CREDIT")
            return { ...state, credit: action.payload };

        if (action.type === "TIME") return { ...state, time: action.payload };

        if (action.type === "RESET") return initialCourse;
        throw new Error("no dispatch have catch");
    }, initialCourse);

    return (
        <MyDialog
            fullScreen
            title={
                originalClass
                    ? "Update class " + originalClass.name
                    : "New Class"
            }
            open={open}
            onClose={onClose}
            actionButtons={[
                {
                    label: "Save",
                    onClick: () => {
                        onSave(_class, originalClass ? true : false);
                    },
                    disabled: !(
                        _class.name &&
                        _class.specialization &&
                        _class.classMasterId
                    ),
                },
            ]}
        >
            <Box sx={{ display: "flex", mb: "10px" }}>
                <Input
                    sx={{ width: "50%", mr: "5px" }}
                    label="Classe Name"
                    value={_class.name}
                    onChange={(val) =>
                        dispatchClass({ type: "NAME", payload: val })
                    }
                />
                <Select
                    sx={{ width: "50%", ml: "5px" }}
                    options={specializations.map((sp) => sp.name)}
                    label="Specialization"
                    onChange={(val) => {
                        dispatchClass({ type: "SPEC", payload: val });
                    }}
                    value={_class.specialization}
                />
            </Box>
            <Box sx={{ display: "flex", mb: "5px" }}>
                <Select
                    sx={{ width: "50%", mr: "5px" }}
                    options={["L1", "L2", "L3", "M1", "M2"]}
                    label="Level"
                    onChange={(val) => {
                        dispatchClass({ type: "LEVEL", payload: val });
                        dispatchClass({
                            type: "COURSES",
                            payload: _class.courses.filter(
                                (c) => c.level === val
                            ),
                        });
                    }}
                    value={_class.level}
                />
                <Select
                    sx={{ width: "50%", ml: "5px" }}
                    options={teachers
                        .filter((t) =>
                            !originalClass
                                ? !t.classId
                                : !t.classId ||
                                  t.classId === originalClass.classMasterId
                        )
                        .map((t) => ({
                            value: t._id,
                            label: t.name + " " + t.surName,
                        }))
                        .sort((a, b) => (a.label > b.label ? 1 : -1))}
                    label="Class Master"
                    onChange={(val) =>
                        dispatchClass({ type: "CMI", payload: val })
                    }
                    value={_class.classMasterId}
                />
            </Box>
            <Typography variant="h6">Class Courses</Typography>
            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Select
                        sx={{ minWidth: "30%" }}
                        disabled={!_class.level}
                        options={courses
                            .filter(
                                (c) =>
                                    c.level === _class.level &&
                                    !_class.courses.find(
                                        (fc) => fc.courseCode === c.courseCode
                                    )
                            )
                            .map((c) => ({
                                value: c.courseCode,
                                label: c.name,
                            }))
                            .sort((a, b) => (a.label > b.label ? 1 : -1))}
                        label="Course"
                        onChange={(val) => {
                            dispatchNewCourse({
                                type: "CC",
                                payload: val,
                            });
                        }}
                        value={newCourse.courseCode}
                        returnOpt
                    />
                    <Select
                        sx={{ minWidth: "30%" }}
                        options={teachers
                            .map((t) => ({
                                value: t._id,
                                label: t.name + " " + t.surName,
                            }))
                            .sort((a, b) => (a.label > b.label ? 1 : -1))}
                        label="Teacher"
                        onChange={(val) =>
                            dispatchNewCourse({
                                type: "TEACHER",
                                payload: val,
                            })
                        }
                        value={newCourse.teacherId}
                    />
                    <TextField
                        sx={{ minWidth: "30%" }}
                        size="small"
                        label="Credit"
                        type="number"
                        value={newCourse.credit}
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
                <Typography
                    sx={{
                        color: "text.secondary",
                        my: "auto",
                    }}
                    variant="body1"
                >
                    Timing
                </Typography>
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        my: "5px",
                    }}
                >
                    {[
                        { label: "Theory", key: "theory" },
                        { label: "Pratices", key: "practices" },
                        { label: "Execises", key: "exercises" },
                    ].map(({ key, label }, ind) => (
                        <FormControl key={ind} sx={{ width: "30%" }}>
                            <TextField
                                size="small"
                                label={label}
                                type="number"
                                value={newCourse.time[key]}
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
                                                ...newCourse.time,
                                                [key]: val,
                                            },
                                        });
                                }}
                            />
                        </FormControl>
                    ))}
                </Box>
                <Box display="flex" justifyContent="center">
                    <Button
                        disabled={!newCourse.courseCode || !newCourse.teacherId}
                        size="small"
                        onClick={() => {
                            dispatchClass({
                                type: "COURSES",
                                payload: [newCourse, ..._class.courses],
                            });
                            dispatchNewCourse({ type: "RESET" });
                        }}
                        sx={{ borderRadius: "20px" }}
                    >
                        ADD COURSE
                    </Button>
                </Box>
            </Box>
            <Box
                sx={{
                    maxHeight: "300px",
                    overflowY: "auto",
                }}
            >
                <ReactSortable
                    list={_class.courses}
                    setList={(newState, sortable, store) =>
                        dispatchClass({ type: "COURSES", payload: newState })
                    }
                >
                    {_class.courses.map((item, ind) => {
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
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    },
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: "medium",
                                        }}
                                        display="inline"
                                        variant="body1"
                                    >
                                        {ind + 1 + ". " + item.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: "medium",
                                        }}
                                        display="inline"
                                        variant="body1"
                                    >
                                        {teacher?.name + " " + teacher?.surName}
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
                                            dispatchClass({
                                                type: "COURSES",
                                                payload: _class.courses.filter(
                                                    (c) => c.name !== item.name
                                                ),
                                            });
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
        </MyDialog>
    );
}
