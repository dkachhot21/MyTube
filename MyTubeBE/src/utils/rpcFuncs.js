import fetch from "node-fetch";

export function qRPCPayload(func, params, idx2, idx3) {
  return [func, JSON.stringify(params), idx2, idx3];
}


export async function callqRPC(url, payload) {
    const response =  await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: `f.req=${encodeURIComponent(payload)}`,
    })

    let text = await response.text();
    if (text.startsWith(")]}'")) text = text.slice(4);

    try {
        return JSON.parse(text);
    } catch {
        return [];
    }
}