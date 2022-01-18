
import type { EndpointOutput, Request } from '@sveltejs/kit';
import * as fs  from 'fs';
import * as JSONC from 'jsonc-parser';

const coursePaths = './degreeDefaults';

export async function get({params}: Request): Promise<EndpointOutput> {
    try {
        // TODO sanitize input here to not read files outside of the courseDefaults folder
        // safe path construction helper in nodejs?
        const path = `${coursePaths}/${params.degreeKey}.jsonc`;

        const fileContent = fs.readFileSync(path);
        const json = JSONC.parse(fileContent.toString()); 

        return {
            body: JSON.stringify(json),
        };

    } catch(e) {
        console.error(e);
        return {
            body: "not found",
            status: 404
        };
    }

}