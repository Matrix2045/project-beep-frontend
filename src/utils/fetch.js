export default async function(url, options) {
    let res = await fetch(url, {
        ...options,
    });
    return await res.json()
}
