export function splitTextStyleAndMetadata(brew: any): void;
export function printCurrentBrew(): void;
export function fetchThemeBundle(obj: any, renderer: any, theme: any): Promise<void>;
export function brewSnippetsToJSON(menuTitle: any, userBrewSnippets: any, themeBundleSnippets?: null, full?: boolean): {
    snippets: ({
        name: any;
        icon: string;
        gen: string;
        subsnippets: {
            name: any;
            icon: string;
            gen: any;
        }[];
    } | {
        name: any;
        subsnippets: {
            name: any;
            gen: any;
        }[];
        icon?: undefined;
        gen?: undefined;
    })[];
};
export function debugTextMismatch(clientTextRaw: any, serverTextRaw: any, label: any): void;
//# sourceMappingURL=helpers.d.ts.map