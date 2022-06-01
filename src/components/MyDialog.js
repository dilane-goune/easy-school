import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Divider, Typography } from "@mui/material";

export default function MyDialog({
    title = "",
    actionButtons = [],
    onClose,
    children,
    open,
    helperText,
    fullScreen = false,
    ...rest
}) {
    return (
        <Dialog
            maxWidth="lg"
            fullWidth={true}
            open={open}
            onClose={onClose}
            {...rest}
            fullScreen={fullScreen}
        >
            <DialogTitle sx={{ m: 0, p: "0px 10px", bgcolor: "info.light" }}>
                {title}
                {onClose ? (
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            right: 5,
                            top: -4,
                            color: "error.main",
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                ) : null}
            </DialogTitle>
            <Divider />
            <DialogContent>{children}</DialogContent>
            <Divider />
            <DialogActions
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="body1" color="text.secondary">
                    {helperText}
                </Typography>
                <Box>
                    {actionButtons.map((act, ind) => {
                        return (
                            <Button
                                key={ind}
                                disabled={act.disabled}
                                onClick={act.onClick}
                            >
                                {act.label}
                            </Button>
                        );
                    })}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
