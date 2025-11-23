import fetch from "node-fetch";
import { extractMediaInfo, extractDataArray } from "../utils/extract.js";
import { saveAlbum, saveMediaItems } from "../repositories/mediaRepository.js";
import { callqRPC, qRPCPayload } from "../utils/rpcFuncs.js";
import { extractNextMediaInfo } from "../utils/nextPageParser.js";

async function fetchPublicMediaDetails(internalIds, key) {
    const url = "https://photos.google.com/_/PhotosUi/data/batchexecute";

    let payload = internalIds.map((id) =>
        qRPCPayload("fDcn4b", [id, null, key, null, null, [2]], null, "1")
    );

    payload = [payload];
    payload = JSON.stringify(payload);

    const parsed = await callqRPC(url, payload);
    const items = [];
    for (const item of parsed) {
        if (!item[2]) continue;
        try {
            const inner = JSON.parse(item[2]);
            items.push(inner);
        } catch { }
    }

    return items
        .filter((v) => Array.isArray(v))
        .map((entry) => ({ [entry[0][0]]: entry[0][2] }))
        .filter(Boolean);
}

export async function scrapeAlbum(obj, userId) {
    const { albumName, url } = obj;

    const response = await fetch(url, { redirect: "manual" });
    const redirectUrl = response.headers.get("location");
    if (!redirectUrl) throw new Error("No redirect URL found");

    const albumIdWithKey = redirectUrl.split("/")[4];
    const [albumId, keyFull] = albumIdWithKey.split("?");
    const key = keyFull.split("=")[1];

    await saveAlbum(albumId, albumName, key, userId);

    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();

    const callbackRegex = /AF_initDataCallback\s*\(\s*({[\s\S]*?})\s*\)/g;
    let blocks = [];
    let match;

    while ((match = callbackRegex.exec(html)) !== null) {
        blocks.push(match[1]);
    }

    let allMedia = [];

    for (let block of blocks) {
        const dataText = extractDataArray(block);
        if (!dataText) continue;

        const dataList = Function(`"use strict"; return (${dataText});`)();
        if (!dataList || !dataList[1]) continue;

        const mediaInfo = dataList[1];
        let nextPage = dataList[2];

        while (nextPage !== "") {
            const { nextMediaInfo, nextPageToken } = await extractNextMediaInfo(
                albumId,
                nextPage,
                key
            );
            nextPage = nextPageToken;
            mediaInfo.push(...nextMediaInfo);
        }

        const [idList, mediaItems] = extractMediaInfo(mediaInfo);
        const resMeta = await fetchPublicMediaDetails(idList, key);

        const metaMap = {};
        resMeta.forEach((entry) => {
            const internalId = Object.keys(entry)[0];
            metaMap[internalId] = entry[internalId];
        });

        const merged = mediaItems.map((item) => ({
            ...item,
            fileName: metaMap[item.internalId] || null,
        }));
        allMedia.push(...merged);
    }

    await saveMediaItems(albumId, allMedia, userId);

    return {
        albumId,
        total: allMedia.length,
    };
}
