export default async function extendToken() {
    try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const oldToken = JSON.parse(sessionStorage.getItem("token"));
        const res = await fetch("/api/token/extend", {
            method: "POST",
            body: JSON.stringify({
                email: user?.email,
                password: user?.password,
                authorization: "BEARER " + oldToken,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (res.status !== 200) window.location.replace("/login");
        const token = await res.json();

        if (localStorage.getItem("token")) {
            localStorage.setItem("token", JSON.stringify(token));
        }
        sessionStorage.setItem("token", JSON.stringify(token));

        return token;
    } catch (e) {
        window.location.replace("/login");
    }
}
