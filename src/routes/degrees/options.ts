
import type { DefaultDegreeOptions } from '$lib/types/degreeOptions';
import type { EndpointOutput } from '@sveltejs/kit';
import * as fs  from 'fs';
import * as JSONC from 'jsonc-parser';

const degreePaths = './degreeDefaults';

export function get(): EndpointOutput {
    try {
        const fileList = fs.readdirSync(`${degreePaths}/`);

        const options: Array<DefaultDegreeOptions> = [];

        for (const fileName of fileList) {
            const content = fs.readFileSync(`${degreePaths}/${fileName}`);
            const json = JSONC.parse(content.toString()); 

            options.push({
                degree: json['degree'],
                lang: json['lang'],
                id: fileName.replace('.jsonc', '')
            });
        }

        return {
            body: JSON.stringify(options)
        };

    } catch(e) {
        console.error(e);
        return {
            body: "internal error at listing degrees",
            status: 500
        };
    }

}