import React from "react";
import {
    Typography,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableContainer,
    TableCell,
    Paper,
} from "@mui/material";

const periods = [
    { start: "08h : 00", end: "10h : 00", period: "p1" },
    { start: "10h : 10", end: "12h : 40", period: "p2" },
    { start: "13h : 00", end: "15h : 00", period: "p3" },
    { start: "15h : 10", end: "16h : 20", period: "p4" },
];

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

export default function TimeTableView({ program = initialprogram }) {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Moday</TableCell>
                        <TableCell>Tuesday</TableCell>
                        <TableCell>Wednesday</TableCell>
                        <TableCell>Thursday</TableCell>
                        <TableCell>Friday</TableCell>
                        <TableCell>Saturday</TableCell>
                        <TableCell>Sunday</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {periods.map((p, ind) => {
                        return (
                            <TableRow key={"prog" + ind}>
                                <TableCell sx={{ minWidth: "60px" }}>
                                    <Typography>{p.start}</Typography>
                                    <Typography>{p.end}</Typography>
                                </TableCell>
                                {[
                                    "monday",
                                    "tuesday",
                                    "wednesday",
                                    "thursday",
                                    "friday",
                                    "saturday",
                                    "sunday",
                                ].map((subProg, ind) =>
                                    program[p.period][subProg]?.courseName ? (
                                        <TableCell
                                            key={"subProg" + ind}
                                            sx={{ minWidth: "60px" }}
                                        >
                                            <Typography>
                                                <strong>
                                                    {
                                                        program[p.period][
                                                            subProg
                                                        ]?.courseName
                                                    }
                                                </strong>
                                            </Typography>
                                            <Typography>
                                                {
                                                    program[p.period][subProg]
                                                        ?.teacherName
                                                }
                                                <em>
                                                    (
                                                    {program[p.period][subProg]
                                                        ?.teacherDiplomat || ""}
                                                    )
                                                </em>
                                            </Typography>
                                        </TableCell>
                                    ) : (
                                        <TableCell key={"subProg" + ind}>
                                            <Typography sx={{ opacity: 0.7 }}>
                                                free
                                            </Typography>
                                        </TableCell>
                                    )
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
