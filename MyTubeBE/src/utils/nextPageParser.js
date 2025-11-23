import { callqRPC, qRPCPayload } from "./rpcFuncs.js";

export async function extractNextMediaInfo(albumId, nextPage, key) {
    const url = "https://photos.google.com/_/PhotosUi/data/batchexecute";
    let payload = qRPCPayload(
        "snAcKc",
        [albumId, nextPage, null, key],
        null,
        "generic"
    );
    payload = [[payload]];
    payload = JSON.stringify(payload);

    const response = await callqRPC(url, payload);
    
    let inner;
    try {
        inner = JSON.parse(response[0][2]);
    } catch {
        console.log("Failed to parse item[2]:", response[0][2]);
    }

    const nextMediaInfo = inner[1];
    const nextPageToken = inner[2];
    // console.log("last 10 objects of nextMediaInfo:", nextMediaInfo.slice(-10));
    return { nextMediaInfo, nextPageToken };
}
