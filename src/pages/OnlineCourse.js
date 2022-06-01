import React from "react";
import { Box } from "@mui/material";
import VideoCourse from "../components/VideoCourseComponent";

export default function OnlineCourse() {
    return (
        <Box
            fixed
            maxWidth="xl"
            disableGutters
            sx={{
                height: "100vh",
                bgcolor: "#f8efef",
            }}
        >
            <VideoCourse />
        </Box>
    );
}
