import extendUserToken from "./extendUserToken";

export default async function postData({
    url = "",
    body,
    method = "POST",
    headers = { "Content-Type": "application/json" },
    getJSON = false,
}) {
    let jsonToken = sessionStorage.getItem("token");
    let token = JSON.parse(jsonToken);

    try {
        let newToken;

        let res = await fetch(url, {
            method,
            body,
            headers: {
                authorization: "BEARER " + token,
                ...headers,
            },
        });

        if (res.status === 403) {
            newToken = extendUserToken();

            res = await fetch(url, {
                method,
                body,
                headers: {
                    authorization: "BEARER " + newToken,
                    ...headers,
                },
            });
        }

        if (res.status === 401) {
            window.location.replace("/login");
        }

        if (![200, 201, 204].includes(res.status))
            return { result: null, newToken, status: res.status };

        let result;

        if (getJSON) {
            result = await res.json();
        }

        return { result, newToken, status: res.status };
    } catch (e) {
        console.log(e);
        return {};
    }
}
