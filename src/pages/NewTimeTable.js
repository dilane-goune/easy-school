import React, { useReducer, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Alert,
    AlertTitle,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import Select from "../components/Select";
import TimeTableView from "../components/TimeTableView";
import globalContext from "../context/globalContext";
import extendUserToken from "../functions/extendUserToken";
import fetchData from "../functions/fetchData";
import dayjs from "dayjs";

const formatedDates = [];

for (let i = 0; i < 55; i++) {
    formatedDates.push(
        `${dayjs().add(i, "week").format("DD MMM YYYY")} - ${dayjs()
            .add(i + 1, "week")
            .format("DD MMM YYYY")}`
    );
}

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const periods = [
    { start: "08h : 00", end: "10h : 00", period: "p1" },
    { start: "10h : 10", end: "12h : 40", period: "p2" },
    { start: "13h : 00", end: "15h : 00", period: "p3" },
    { start: "15h : 10", end: "16h : 20", period: "p4" },
];

export default function NewTimeTable() {
    const searchParams = new URLSearchParams(window.location.search);

    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);

    React.useEffect(() => {
        fetchData("/api/time-tables/data/" + classId).then((data) => {
            if (data instanceof Array)
                setCourses([{ courseName: "free" }].concat(data));
            else feedBack("Failed to fetch data.");
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        appState: {
            user: { classId },
            token,
        },
        feedBack,
        dispatchApp,
    } = React.useContext(globalContext);

    const defaultFormteWeek = searchParams.get("week");
    const [week, setWeek] = useState(defaultFormteWeek);

    const [newTimeTable, setNewTimeTable] = useState({
        course: "",
        start: "",
        end: "",
        day: "",
    });
    const simpleWeek = {
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        sunday: {},
    };
    const initialprogram = {
        p1: { ...simpleWeek },
        p2: { ...simpleWeek },
        p3: { ...simpleWeek },
        p4: { ...simpleWeek },
    };

    const [programState, dispatchProgram] = useReducer((state, action) => {
        if (action.type === "SET_PROGRAMS") {
            let newState = { ...state };
            for (let i = 0; i < action.intervals.length; i++) {
                newState = {
                    ...newState,
                    [action.intervals[i].period]: {
                        ...newState[action.intervals[i].period],
                        [action.day]:
                            action.course.courseName !== "free"
                                ? action.course
                                : {},
                    },
                };
            }
            return newState;
        }
        throw new Error("no dispatch match");
    }, initialprogram);

    const handleNewRow = () => {
        const course =
            courses.find((f) => f.courseName === newTimeTable.course) || {};

        const intervals = periods.filter(
            (p) => p.start >= newTimeTable.start && p.start < newTimeTable.end
        );

        dispatchProgram({
            type: "SET_PROGRAMS",
            intervals,
            day: [newTimeTable.day.toLowerCase()],
            course,
        });
    };

    const handleSaveProgram = async () => {
        const year = week.slice(-4);

        try {
            setIsLoading(true);
            let newToken;
            let res = await fetch("/api/time-tables", {
                method: "POST",
                body: JSON.stringify({
                    year,
                    week,
                    program: programState,
                    classId,
                }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: "BEARER " + token,
                },
            });

            if (res.status === 403) {
                newToken = await extendUserToken();

                res = await fetch("/api/time-tables", {
                    method: "POST",
                    body: JSON.stringify({
                        year,
                        week,
                        program: programState,
                        classId,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        authorization: "BEARER " + newToken,
                    },
                });
                dispatchApp({ action: "SET_TOKEN", token: newToken });
            }

            if (res.status === 500) {
                feedBack("Sothing when wrong. Please try again.", "warning");
                return;
            }
            if (res.status === 401) {
                feedBack("Unathorised", "warning");
                return;
            }

            if (res.status === 201) {
                feedBack("Time table saved successfully.", "success");
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

    return (
        <div>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    px: "10px",
                }}
            >
                <Typography variant="h6">Computer Engineering 1</Typography>
                <Typography variant="h6">Time Table</Typography>
            </Box>
            <Box
                sx={{
                    display: { xs: "initial", sm: "flex" },
                    justifyContent: "space-between",
                    px: "10px",
                    my: "20px",
                }}
            >
                <Select
                    label="Course"
                    sx={{ minWidth: "150px" }}
                    options={courses.map((c) => c.courseName)}
                    value={newTimeTable.course}
                    onChange={(val) => {
                        setNewTimeTable({ ...newTimeTable, course: val });
                    }}
                />

                <Select
                    label="Day"
                    sx={{ minWidth: "150px" }}
                    options={days}
                    value={newTimeTable.day}
                    onChange={(val) => {
                        setNewTimeTable({ ...newTimeTable, day: val });
                    }}
                />
                <Select
                    label="start"
                    sx={{ minWidth: "150px" }}
                    options={periods.map((p) => p.start)}
                    value={newTimeTable.start}
                    onChange={(val) => {
                        if (val > newTimeTable.end)
                            setNewTimeTable({ ...newTimeTable, end: "" });
                        setNewTimeTable({ ...newTimeTable, start: val });
                    }}
                />
                <Select
                    label="end"
                    sx={{ minWidth: "150px" }}
                    disabled={!newTimeTable.start}
                    options={periods
                        .filter((p) => p.end > newTimeTable.start)
                        .map((p) => p.end)}
                    value={newTimeTable.end}
                    onChange={(val) => {
                        setNewTimeTable({ ...newTimeTable, end: val });
                    }}
                />
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "20px" }}
                    onClick={handleNewRow}
                >
                    ADD
                </Button>
            </Box>
            <TimeTableView program={programState} />
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-evenly",
                    my: "10px",
                }}
            >
                <Select
                    label="Week"
                    sx={{ minWidth: "150px" }}
                    options={formatedDates}
                    value={week}
                    onChange={(val) => {
                        setWeek(val);
                    }}
                />

                <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "20px" }}
                    onClick={handleSaveProgram}
                    disabled={!week || isLoading}
                >
                    Save
                </Button>
            </Box>
            <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                if there is already a time table for this week, it wiil be
                overwritten.
            </Alert>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
}

// import React from "react";

// export default function NewTimeTable() {
//     return <div>NewTimeTable</div>;
// }
