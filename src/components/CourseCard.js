import * as React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export default function CourseCard({
    courseCode,
    courseName,
    className,
    year,
    link,
    courseColor,
    fullWidth = false,
}) {
    const navigate = useNavigate();
    return (
        <Card
            sx={{
                width: {
                    xs: "100%",
                    md: fullWidth ? "100%" : 260,
                },
                // height: { xs: 150 },
                m: "1px auto",
                borderRadius: { xs: "5px" },
                bgcolor: courseColor,
            }}
        >
            <CardActionArea
                disabled={!link}
                onClick={() => {
                    link && navigate(link);
                }}
            >
                <Box
                    sx={{
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography
                        sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                        variant="h4"
                    >
                        {courseCode}
                    </Typography>
                </Box>
                <Divider />
                <Box
                    sx={{
                        px: "10px",
                    }}
                >
                    <Typography
                        noWrap
                        variant="body1"
                        sx={{
                            fontSize: "17px",
                            fontWeight: "medium",
                            width: "100%",
                        }}
                    >
                        {courseName}
                    </Typography>
                </Box>
                <Divider />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        px: "10px",
                    }}
                >
                    <Typography variant="subtitle1">{className}</Typography>
                    <Typography>{year}</Typography>
                </Box>
            </CardActionArea>
        </Card>
    );
}
