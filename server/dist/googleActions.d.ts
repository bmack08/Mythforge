export default GoogleActions;
declare namespace GoogleActions {
    function authCheck(account: any, res: any, updateTokens?: boolean): import("google-auth-library").OAuth2Client;
    function getGoogleFolder(auth: any): Promise<any>;
    function listGoogleBrews(auth: any): Promise<{
        text: string;
        shareId: any;
        editId: any;
        createdAt: any;
        updatedAt: any;
        gDrive: boolean;
        googleId: any;
        pageCount: number;
        title: any;
        description: any;
        views: number;
        published: boolean;
        systems: never[];
        lang: any;
        thumbnail: any;
        webViewLink: any;
    }[]>;
    function updateGoogleBrew(brew: any, userIp: any): Promise<boolean>;
    function newGoogleBrew(auth: any, brew: any): Promise<any>;
    function getGoogleBrew(auth: any, id: any, accessId: any, accessType: any): Promise<{
        shareId: string;
        editId: string;
        title: string;
        text: any;
        description: string | null | undefined;
        systems: string[];
        authors: never[];
        lang: string;
        published: boolean;
        trashed: boolean | null | undefined;
        createdAt: string | null | undefined;
        updatedAt: string | null | undefined;
        lastViewed: string;
        pageCount: string;
        views: number;
        version: number;
        renderer: string;
        googleId: any;
    } | undefined>;
    function deleteGoogleBrew(auth: any, id: any, accessId: any): Promise<void>;
    function increaseView(id: any, accessId: any, accessType: any, brew: any): Promise<void>;
}
//# sourceMappingURL=googleActions.d.ts.map