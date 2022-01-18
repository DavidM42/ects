/**
 * Lookup some status codes (subset of all defined ones). Thx to github copilot for looking it up in github.com/nodejs/node/blob/master/doc/api/http.md
 * and completely writing whole switch 😅 creepy...
 * @param code Status code to lookup
 * @returns Textual representation of the status code
 */
export const statusCodeTextSubsetLookup = (code: number) => {
    switch(code) {
        case 200:
            return "OK";
        case 201:
            return "Created";
        case 204:
            return "No Content";
        case 400:
            return "Bad Request";
        case 401:
            return "Unauthorized";
        case 403:
            return "Forbidden";
        case 404:
            return "Not Found";
        case 500:
            return "Internal Server Error";
        default:
            return "Unknown";
    }
}