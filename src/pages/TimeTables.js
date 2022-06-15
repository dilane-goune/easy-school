import React, { useState } from "react";
import { Box, Typography, Backdrop, CircularProgress } from "@mui/material";
import Select from "../components/Select";
import TimeTableView from "../components/TimeTableView";
import { Link } from "react-router-dom";
import globalContext from "../context/globalContext";
import fetchData from "../functions/fetchData";
import generateTimeTable from "../functions/generateTimeTable";
import dayjs from "dayjs";

const currentDate = dayjs().set("day", 1);
const currentYear = currentDate.get("year");

const formatedWeeks = [];

for (let i = -40; i < 20; i++)
    formatedWeeks.push(
        `${currentDate.add(i, "week").format("DD MMM YYYY")} - ${currentDate
            .add(i + 6, "days")
            .format("DD MMM YYYY")}`
    );

const years = [];
for (let i = currentYear - 5; i < currentYear + 5; i++) years.push("" + i);

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

function TimeTable() {
    const initialWeek = `${currentDate.format("DD MMM YYYY")} - ${currentDate
        .add(6, "days")
        .format("DD MMM YYYY")}`;

    const {
        appState: {
            user: { isTeacher, courses },
            user,
        },
        feedBack,
    } = React.useContext(globalContext);

    const [year, setYear] = useState(currentYear);
    const [week, setWeek] = useState(initialWeek);
    const [classId, setClassId] = useState(courses[0]?.classId || "");

    const [program, setProgram] = useState(initialprogram);

    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        setIsLoading(true);

        if (classId) {
            fetchData(
                `/api/time-tables?classId=${classId}&week=${JSON.stringify(
                    week
                )}&year=${year}`
            ).then((data) => {
                if (typeof data === "object") {
                    if (data) setProgram(generateTimeTable(data.program || {}));
                } else {
                    feedBack("Failed to fetch data");
                }
            });
        }
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [week, year]);

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff", zIndex: 300 }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );

    return (
        <div>
            <Box sx={{ px: "10px" }}>
                <Typography variant="h6">Time Tables</Typography>
            </Box>
            <Box
                sx={{
                    display: { xs: "initial", sm: "flex" },
                    px: "10px",
                    justifyContent: "space-between",
                }}
            >
                {isTeacher && (
                    <Select
                        label="Class"
                        sx={{ width: "250px", m: "auto" }}
                        options={courses.map((c) => ({
                            value: c.classId,
                            label: c.className,
                        }))}
                        value={classId}
                        onChange={(val) => {
                            setClassId(val.value);
                        }}
                        returnOpt
                    />
                )}
                <Select
                    label="Year"
                    sx={{ width: "250px", m: "auto" }}
                    options={years}
                    value={year}
                    onChange={(val) => {
                        setYear(val);
                    }}
                />

                <Select
                    label="Week"
                    sx={{
                        width: "250px",
                        m: "auto",
                        mt: { xs: "10px", sm: "auto" },
                    }}
                    options={formatedWeeks}
                    value={week}
                    onChange={(val) => {
                        setWeek(val);
                    }}
                />
                {isTeacher && user.classId && (
                    <Link
                        style={{
                            width: "250px",
                            margin: "auto",
                            textAlign: "center",
                            fontFamily: "Roboto",
                            fontWeight: "600",
                        }}
                        to={
                            "new-time-table?year=" +
                            currentDate.get("year") +
                            "&week=" +
                            initialWeek
                        }
                    >
                        <Typography>New Time Table</Typography>
                    </Link>
                )}
            </Box>
            <TimeTableView program={program} />
        </div>
    );
}

export default TimeTable;
