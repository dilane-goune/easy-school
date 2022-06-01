export const writeNotifications = (notifications) => {
    try {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (e) {
        console.log(e);
    }
};

export const getNotifications = () => {
    let notifications = localStorage.getItem("notifications");
    if (notifications) notifications = JSON.parse(notifications);
    else notifications = [];

    return [...new Set(notifications)];
};
