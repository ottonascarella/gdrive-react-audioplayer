function getFile(headers, url) {

    const req = new XMLHttpRequest();

    req.open('GET', url, true);

    if (headers !== undefined) {
        Object.keys(headers).forEach(key => req.setRequestHeader(key, headers[key]));
    }

    return req;
}

export default getFile;