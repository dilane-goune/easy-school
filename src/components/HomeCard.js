import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function HomeCard({
    image = require("../assets/images/default.jpg"),
    label = "Option",
    link = "#",
}) {
    const navigate = useNavigate();
    return (
        <Card sx={{ maxWidth: 340, margin: "auto" }}>
            <CardActionArea
                onClick={(e) => {
                    navigate(link);
                }}
            >
                <CardMedia
                    component="img"
                    height="140"
                    image={image}
                    alt={label}
                />
                <CardContent>
                    <Typography
                        fontWeight="bold"
                        gutterBottom
                        variant="h5"
                        component="div"
                    >
                        {label}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
