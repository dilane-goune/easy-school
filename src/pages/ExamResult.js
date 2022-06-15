import React from "react";
import {
    Container,
    Backdrop,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";
import Table from "../components/Table";
import fetchData from "../functions/fetchData";
import { useParams } from "react-router-dom";
import globalContext from "../context/globalContext";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import FilterLine from "../components/FilterLine";

dayjs.extend(LocalizedFormat);

export default function ExamResult() {
    const [exam, setExam] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [sortKey, setSortKey] = React.useState({
        key: "userName",
        asc: true,
    });

    const { examId } = useParams();

    const { feedBack } = React.useContext(globalContext);

    React.useEffect(() => {
        fetchData("/api/exams/result/" + examId).then((data) => {
            if (data instanceof Object) {
                setExam(data);
            } else {
                feedBack("Failed to fetch data.");
            }

            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                    justifyContent: "space-between",
                    alignItems: "center",
                    "& > .MuiTypography-root": {
                        fontSize: { xs: "18px", md: "24px" },
                        fontWeight: { xs: "bold" },

                        alignSelf: {
                            xs: "center",
                        },
                    },
                }}
            >
                <Typography variant="h1">{"Result : " + exam.name}</Typography>
                <FilterLine
                    title="Sort by"
                    options={[
                        { label: "Name", value: "userName" },
                        {
                            label: "Mark",
                            value: "mark",
                        },
                    ]}
                    onClick={(val, asc) => setSortKey({ asc, key: val })}
                    ordered
                />
                <Typography variant="h4">
                    {dayjs(exam.date).format("LLL")}
                </Typography>
            </Box>
            <Table
                headData={[
                    {
                        label: "Full name",
                        key: "userName",
                    },
                    {
                        label: `Mark (x / ${exam.totalScore})`,
                        key: "mark",
                        sx: { maxWidth: "20px" },
                    },
                ]}
                data={exam.marks.sort((a, b) => {
                    if (sortKey.asc) {
                        if (a[sortKey.key] > b[sortKey.key]) return 1;
                        return -1;
                    } else {
                        if (a[sortKey.key] > b[sortKey.key]) return -1;
                        return 1;
                    }
                })}
                numbered
                small
            />
        </Container>
    );
}
