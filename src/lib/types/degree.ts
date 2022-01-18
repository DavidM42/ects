export interface Degree {
    _id: string,
    degree: string,
    lang: string,
    curriculum: [
        [
            {
                _id: string,
                id: string,
                fullname: string,
                shortname: string,
                ects: number,
                relation?: {
                    name: string,
                    color: string
                },
                // TODO standardize typing which options exist
                // but maybe can not be predicted and not important
                types?: string[]
            },
        ]
    ]
}