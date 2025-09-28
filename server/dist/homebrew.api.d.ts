export default api;
declare namespace api {
    export { router as homebrewApi };
    export function getId(req: any): {
        id: any;
        googleId: any;
    };
    export function getUsersBrewThemes(username: any): Promise<{}>;
    export function getBrew(accessType: any, stubOnly?: boolean): (req: any, res: any, next: any) => Promise<void>;
    export function getCSS(req: any, res: any): Promise<any>;
    export function mergeBrewText(brew: any): any;
    export function getGoodBrewTitle(text: any): any;
    export function excludePropsFromUpdate(brew: any): any;
    export function excludeGoogleProps(brew: any): any;
    export function excludeStubProps(brew: any): any;
    export function beforeNewSave(account: any, brew: any): void;
    export function newGoogleBrew(account: any, brew: any, res: any): Promise<any>;
    export function newBrew(req: any, res: any): Promise<void>;
    export function getThemeBundle(req: any, res: any): Promise<any>;
    export function updateBrew(req: any, res: any): Promise<any>;
    export function deleteGoogleBrew(account: any, id: any, editId: any, res: any): Promise<boolean>;
    export function deleteBrew(req: any, res: any, next: any): Promise<any>;
}
declare const router: any;
//# sourceMappingURL=homebrew.api.d.ts.map