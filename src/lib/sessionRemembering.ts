const LOCALSTORAGE_KEY = 'previousSession'

export interface PreviousSession {
    id: string,
    updatedAt: Date,
    degrees: string[],
    passedEcts: number,
    ectsSum: number,
    meanGrade: number,
}

export class SessionRemembering {

    /** Save object with all last sessions in localstorage to show on index page */
    static addOrUpdate(sessionId: string, degrees: string[], passedEcts: number, ectsSum: number, meanGrade: number): void {
        console.log(`Adding or updating localstorage rememberance of session ${sessionId}`);
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        const previousSessions = savedSessions ? JSON.parse(savedSessions) : {};
        previousSessions[sessionId] = {
            updatedAt: new Date(),
            degrees: degrees,
            passedEcts: passedEcts,
            ectsSum: ectsSum,
            meanGrade: meanGrade
        };
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(previousSessions));
    }

    /** Remove a session from session remembering e.g. when you delete session intentionally */
    static remove(sessionId: string): void {
        console.log(`Removing session ${sessionId} from localstorage remeberance`);
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedSessions) {
            const previousSessions = JSON.parse(savedSessions);
            delete previousSessions[sessionId];
            window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(previousSessions));       
        }
    }

    /** Get a list of previous sessions */
    static get(): PreviousSession[] {
        console.log('Getting remembered sessions from localstorage');
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (!savedSessions) {
            return [];
        }

        const previousSessions = JSON.parse(savedSessions);
        return Object.keys(previousSessions).map(key => {
            return {
                id: key,
                updatedAt: new Date(previousSessions[key].updatedAt),
                degrees: previousSessions[key].degrees,
                passedEcts: previousSessions[key].passedEcts,
                ectsSum: previousSessions[key].ectsSum,
                meanGrade: previousSessions[key].meanGrade
            }
        });
    }

}