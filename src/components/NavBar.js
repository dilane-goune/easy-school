import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import Stack from "@mui/material/Stack";
import NotificationsNoneSharpIcon from "@mui/icons-material/NotificationsNoneSharp";
import {
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    ListItem,
    Popper,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import HelpIcon from "@mui/icons-material/Help";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet, useNavigate } from "react-router-dom";
import globalContext from "../context/globalContext";
import useIsAdmin from "../functions/useIsAdmin";

const userDrawerOptions = [
    {
        label: "Home",
        icon: <HomeIcon />,
        link: "/home",
    },
    {
        label: "My account",
        icon: <PersonIcon />,
        link: "/user/profile",
        divider: true,
    },
    {
        label: "Courses",
        link: "/courses",
    },
    {
        label: "Exams",
        link: "/exams",
    },
    {
        label: "Payments",
        link: "/payments",
    },
    {
        label: "Help",
        link: "/help",
        icon: <HelpIcon />,
    },
    {
        label: "About",
        link: "/about",
        icon: <InfoIcon />,
        divider: true,
    },
];

const adminDrawerOptions = [
    {
        label: "Home",
        icon: <HomeIcon />,
        link: "/admin/home",
    },
    {
        label: "My account",
        icon: <PersonIcon />,
        link: "/admin/profile",
        divider: true,
    },
    {
        label: "Registrations",
        link: "/admin/registrations",
    },
    {
        label: "Teachers",
        link: "/admin/teachers",
    },

    {
        label: "Courses",
        link: "/admin/courses",
    },
    {
        label: "Classes",
        link: "/admin/classes",
    },
    {
        label: "Academic Classes",
        link: "/admin/academic-classes",
    },
];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const NavBar = () => {
    // context
    const {
        appState: { user, token },
        dispatchApp,
        notifications,
    } = React.useContext(globalContext);

    const isAdmin = useIsAdmin();
    const drawerOptions = isAdmin ? adminDrawerOptions : userDrawerOptions;

    // state
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [openLogOutDialog, setOpenLogOutDialog] = useState(false);

    const navigate = useNavigate();

    const [notificationAnchorEl, setNotificationAnchorEl] =
        React.useState(null);

    const [showDrawer, setShowDrawer] = useState(false);

    // functions
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleNotificationClick = (event) => {
        setNotificationAnchorEl(
            notificationAnchorEl ? null : event.currentTarget
        );
    };

    const open = Boolean(notificationAnchorEl);
    const notificationListId = open ? "notification-list" : undefined;

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <React.Fragment>
            <AppBar>
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={{ minHeight: "50px !important" }}
                    >
                        <Stack
                            spacing={2}
                            style={{ alignItems: "center" }}
                            direction="row"
                        >
                            <IconButton
                                onClick={(e) => {
                                    setShowDrawer(true);
                                }}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    mr: 2,
                                    display: { xs: "none", md: "flex" },
                                }}
                            >
                                Easy School
                            </Typography>
                        </Stack>

                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{
                                flexGrow: 1,
                                display: { xs: "flex", md: "none" },
                            }}
                        >
                            Easy School
                        </Typography>
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: { xs: "none", md: "flex" },
                            }}
                        ></Box>

                        <Box>
                            <Tooltip title="Notifications">
                                <IconButton
                                    onClick={handleNotificationClick}
                                    sx={{
                                        p: 0,
                                        mr: { xs: "20px", md: "40px" },
                                    }}
                                >
                                    <Badge
                                        badgeContent={notifications.length}
                                        color="secondary"
                                    >
                                        <NotificationsNoneSharpIcon color="action" />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Popper
                                id={notificationListId}
                                open={open}
                                anchorEl={notificationAnchorEl}
                            >
                                <Paper>
                                    <List sx={{ mt: "20px" }}>
                                        {notifications.map((not, ind) => {
                                            return (
                                                <ListItem key={ind} divider>
                                                    <ListItemText
                                                        primary={not.primary}
                                                        secondary={
                                                            not.secondary
                                                        }
                                                    ></ListItemText>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </Paper>
                            </Popper>
                        </Box>
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton
                                    onClick={handleOpenUserMenu}
                                    sx={{ p: 0 }}
                                >
                                    <Avatar
                                        alt={
                                            isAdmin ? user.userName : user.name
                                        }
                                        src={
                                            user?.pp
                                                ? "/api/profile-pictutres/" +
                                                  user.pp
                                                : null
                                        }
                                    />
                                </IconButton>
                            </Tooltip>

                            <Menu
                                sx={{ mt: "25px" }}
                                id="menu-appbaNewCourse
                                NewCourser"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem
                                    onClick={() => {
                                        console.log(user, token);
                                        handleCloseUserMenu();
                                    }}
                                >
                                    Profile
                                </MenuItem>

                                <MenuItem
                                    onClick={() => {
                                        handleCloseUserMenu();
                                    }}
                                >
                                    Settings
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setOpenLogOutDialog(true);
                                        handleCloseUserMenu();
                                    }}
                                >
                                    Log Out
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Drawer variant="temporary" anchor="left" open={showDrawer}>
                <IconButton
                    onClick={(e) => setShowDrawer(false)}
                    style={{
                        position: "absolute",
                        right: 10,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <br />

                <Stack
                    spacing={1}
                    style={{ alignItems: "center" }}
                    direction="row"
                >
                    <Avatar
                        alt={isAdmin ? user.userName : user.name}
                        src={
                            user?.pp
                                ? "/api/profile-pictutres/" + user.pp
                                : null
                        }
                        sx={{ width: 56, height: 56, ml: 1 }}
                    />
                    <Typography variant="h6" sm={{ m: 0 }}>
                        {isAdmin ? user.userName : user.name}
                    </Typography>
                </Stack>
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onKeyDown={(e) => {
                        if (
                            e.type === "keydown" &&
                            (e.key === "Tab" || e.key === "Shift")
                        ) {
                            return;
                        }
                        setShowDrawer(false);
                    }}
                >
                    <List>
                        {drawerOptions.map((opt, ind) => (
                            <React.Fragment key={ind}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(opt.link);
                                        setShowDrawer(false);
                                    }}
                                >
                                    <ListItemIcon>
                                        {opt.icon || <ArrowForwardIosIcon />}
                                    </ListItemIcon>
                                    <ListItemText primary={opt.label} />
                                </ListItemButton>
                                {opt.divider && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Dialog
                open={openLogOutDialog}
                TransitionComponent={Transition}
                keepMounted
                onClose={() => setOpenLogOutDialog(false)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Easy School"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLogOutDialog(false)}>
                        No
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenLogOutDialog(false);

                            sessionStorage.removeItem("user");
                            sessionStorage.removeItem("token");
                            dispatchApp({ type: "SET_USER", user: {} });
                            dispatchApp({ type: "SET_TOKEN", token: null });

                            navigate(isAdmin ? "/admin/login" : "/", {
                                replace: true,
                            });
                        }}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ mt: "50px" }}></Box>
            <Outlet />
        </React.Fragment>
    );
};
export default React.memo(NavBar);
