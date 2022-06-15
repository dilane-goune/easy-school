import { io } from "socket.io-client";

const socket = io();

export default socket;

socket.on("connect", () => {
    let sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
        sessionUser = JSON.parse(sessionUser);
        if (sessionUser?._id && sessionUser?.classId) {
            socket.emit(
                "user-refresh",
                {
                    userId: sessionUser._id,
                    classId: sessionUser.classId,
                    isTeacher: sessionUser.isTeacher,
                },
                () => console.log(`connected to io`)
            );
        }
    }
});
