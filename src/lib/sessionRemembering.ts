const LOCALSTORAGE_KEY = 'previousSession'

export interface PreviousSession {
    id: string,
    createdAt: Date
}

export class SessionRemembering {

    /** Save object with all last sessions in localstorage to show on index page */
    static add(sessionId: string): void {
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        const previousSessions = savedSessions ? JSON.parse(savedSessions) : {};
        previousSessions[sessionId] = new Date();
        window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(previousSessions));
    }

    /** Remove a session from session remembering e.g. when you delete session intentionally */
    static remove(sessionId: string): void {
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedSessions) {
            const previousSessions = JSON.parse(savedSessions);
            delete previousSessions[sessionId];
            window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(previousSessions));       
        }
    }

    /** Get a list of previous sessions */
    static get(): PreviousSession[] {
        const savedSessions = window.localStorage.getItem(LOCALSTORAGE_KEY);
        if (!savedSessions) {
            return [];
        }

        const previousSessions = JSON.parse(savedSessions);
        return Object.keys(previousSessions).map(key => {
            return {
                id: key,
                createdAt: new Date(previousSessions[key])
            }
        });
    }

}