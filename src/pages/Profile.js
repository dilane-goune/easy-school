import React, { useState } from "react";
import {
    Container,
    Box,
    Avatar,
    Button,
    Paper,
    IconButton,
    Grid,
    Typography,
    Divider,
    Backdrop,
    CircularProgress,
} from "@mui/material";
import globalContext from "../context/globalContext";
import Label from "../components/Label";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import fetchData from "../functions/fetchData";
import postData from "../functions/postData";

dayjs.extend(LocalizedFormat);
dayjs.extend(RelativeTime);

export default function Profile() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState({
        whatForToday: [],
        activities: [],
        announcements: [],
    });
    const {
        appState: { user },
        feedBack,
        dispatchApp,
    } = React.useContext(globalContext);

    const ppRef = React.useRef();

    React.useEffect(() => {
        setIsLoading(true);
        fetchData(`/api/profile-data?classId=${user.classId}`).then((data) => {
            if (typeof data === "object") {
                setData(data);
            } else {
                feedBack("Failed to fetch data");
            }
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUploadPP = async (e, remove = false) => {
        if (remove) {
            const accept = window.confirm(
                "Do you really want to remove your profile picture? "
            );
            if (accept) {
                const { newToken, status } = await postData({
                    url: "/api/user/profile-pictures?gender=" + user.gender,
                    headers: {},
                    method: "DELETE",
                });
                if (newToken) {
                    dispatchApp({ type: "SET_TOKEN", token: newToken });
                }
                if (!status)
                    return feedBack("Failed to upload profile picture");
                feedBack("Profile picture removed succesfully", "success");
                dispatchApp({
                    type: "SET_USER",
                    user: {
                        ...user,
                        pp: user.gender === "M" ? "male.jpg" : "female.jpg",
                    },
                });
                sessionStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...user,
                        pp: user.gender === "M" ? "male.jpg" : "female.jpg",
                    })
                );
            }
            return;
        }

        const pp = e.target.files[0];

        if (pp) {
            const formData = new FormData();
            formData.append("pp", pp);
            const { newToken, result, status } = await postData({
                url: "/api/user/profile-pictures",
                body: formData,
                headers: { "accept": "application/json" },
                getJSON: true,
            });

            if (!status) return feedBack("Failed to upload profile picture");

            if (newToken) {
                dispatchApp({ type: "SET_TOKEN", token: newToken });
            }
            dispatchApp({
                type: "SET_USER",
                user: { ...user, pp: result.pp },
            });
            sessionStorage.setItem(
                "user",
                JSON.stringify({ ...user, pp: result.pp })
            );
            feedBack("Profile picture updated succesfully", "success");
        }
    };

    if (isLoading)
        return (
            <Backdrop sx={{ color: "#fff", zIndex: 300 }} open>
                <CircularProgress color="inherit" />
            </Backdrop>
        );

    return (
        <Container sx={{ mt: "60px", p: "5px" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        sm: "row",
                    },
                }}
            >
                <Paper
                    sx={{
                        maxWidth: { xs: "100%", sm: "200px" },
                        p: "5px",
                        position: "relative",
                    }}
                >
                    <Avatar
                        alt={user.name + " " + user.surName}
                        sx={{
                            width: "200px",
                            height: "200px",
                            m: "auto",
                            border: "2px solid lightgreen",
                        }}
                        src={"/api/profile-pictures/" + user.pp}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Button
                            onClick={(e) => handleUploadPP(null, true)}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: "20px" }}
                            disabled={
                                user.pp === "male.jpg" ||
                                user.pp === "female.jpg"
                            }
                        >
                            remove
                        </Button>
                        <Button
                            onClick={() => ppRef.current.click()}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: "20px" }}
                        >
                            upload
                        </Button>
                        <input
                            accept="image/*"
                            hidden
                            onChange={handleUploadPP}
                            type="file"
                            ref={ppRef}
                        />
                    </Box>
                    {user.isAdmin && (
                        <AdminPanelSettingsIcon
                            sx={{
                                position: "absolute",
                                right: "5px",
                                bottom: "45px",
                                color: "primary.main",
                            }}
                        />
                    )}
                </Paper>
                <Paper
                    sx={{
                        ml: { sm: "10px" },
                        display: {
                            xs: "initial",
                            sm: "flex",
                        },
                        flex: 1,
                        mt: { xs: "10px", sm: "initial" },
                        py: { xs: "10px", sm: "initial" },
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Label
                            label="Full name"
                            value={user.name + " " + user.surName}
                        />
                        <Label label="Email" value={user.email} />
                        <Label
                            label="Gender"
                            value={user.gender === "M" ? "Male" : "Female"}
                        />
                        <Label label="Telephone" value={user.telephone} />
                        <Label
                            label="Date of birth"
                            value={dayjs(user.dateOfBirth).format("LL")}
                        />
                        <Label
                            label="Password"
                            value={
                                <span
                                    style={{
                                        verticalAlign: "middle",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    {showPassword
                                        ? user.password
                                        : "* * * * * * * * * "}
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </span>
                            }
                        />
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            border: "1px solid #dee8f1",
                            borderWidth: 0,
                            borderLeftWidth: { xs: 0, sm: "1px" },
                        }}
                    >
                        <Label
                            label="Specialization"
                            value={user.specialization}
                        />

                        {!user.isTeacher && (
                            <>
                                <Label label="Class" value={user.className} />
                                <Label label="Level" value={user.level} />
                            </>
                        )}
                        <Label
                            label="Country"
                            value={
                                user.country?.name + " " + user.country?.flag
                            }
                        />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row-reverse",
                                my: "auto",
                            }}
                        >
                            <IconButton
                                size="small"
                                sx={{
                                    border: "1px solid lightgrey",
                                    mr: "10px",
                                }}
                            >
                                <ModeEditIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <br />
            <Grid container>
                <Grid component={Paper} item xs={12} md={4} sx={{}}>
                    <Box sx={{ p: "3px" }}>
                        <Typography
                            variant="h6"
                            sx={{
                                bgcolor: "info.light",
                                textAlign: "center",
                                borderRadius: "3px",
                                mb: "2px",
                            }}
                        >
                            What for today ?
                        </Typography>
                        <Divider />
                        <Box sx={{ px: "5px" }}>
                            {data.whatForToday.map((w, ind) => {
                                return (
                                    <Box
                                        key={ind}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                verticalAlign: "middle",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {w.primary}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                textAlign: "right",
                                                verticalAlign: "middle",
                                            }}
                                        >
                                            {w.secondary}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Grid>
                <Grid component={Paper} item xs={12} md={4}>
                    <Box sx={{ p: "3px" }}>
                        <Typography
                            variant="h6"
                            sx={{
                                bgcolor: "success.light",
                                textAlign: "center",
                                borderRadius: "3px",
                                mb: "2px",
                            }}
                        >
                            My Activities
                        </Typography>
                        <Divider />
                        <Box sx={{ px: "5px" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography
                                    sx={{
                                        verticalAlign: "middle",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Previous login
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        textAlign: "right",
                                        verticalAlign: "middle",
                                    }}
                                >
                                    {user.lastLogin
                                        ? dayjs(user.lastLogin).format("llll")
                                        : "never"}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid component={Paper} item xs={12} md={4}>
                    <Box sx={{ p: "3px" }}>
                        <Typography
                            variant="h6"
                            sx={{
                                bgcolor: "warning.light",
                                textAlign: "center",
                                borderRadius: "3px",
                                mb: "2px",
                            }}
                        >
                            Anouncements
                        </Typography>
                        <Divider />
                        <Box sx={{ px: "5px" }}></Box>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
