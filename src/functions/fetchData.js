import extendAdminToken from "./extendAdminToken";
import extendUserToken from "./extendUserToken";

export default async function fetchData(url = "", isAdmin = false) {
    let jsonToken = sessionStorage.getItem("token");
    let token = JSON.parse(jsonToken);

    try {
        let newToken;

        let res = await fetch(url, {
            headers: {
                authorization: "BEARER " + token,
            },
        });

        if (res.status === 403) {
            newToken = isAdmin
                ? await extendAdminToken()
                : await extendUserToken();

            res = await fetch(url, {
                headers: {
                    authorization: "BEARER " + newToken,
                },
            });
        }

        if (res.status !== 200) return res.status;

        const result = await res.json();
        return result;
    } catch (e) {
        return undefined;
    }
}
