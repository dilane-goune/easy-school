import { Peer, util } from "peerjs";

const peer = new Peer(undefined, {
    host: "/",
    port: 8888,
    path: "/peerjs",
    debug: 2,
    secure: true,
});

peer.on("error", console.log);

peer.on("open", (id) => {
    console.log("peer connected");
});

peer.on("disconnected", (currentId) => {
    console.log("peer disconnected");
});
peer.supports = util.supports;

export default peer;
