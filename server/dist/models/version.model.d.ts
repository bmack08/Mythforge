declare class Version extends Model<any, any> {
    static calculateContentHash(content: any): string;
    static generateSemanticVersion(lastVersion: any, changeType: any): string;
    static calculateDiff(oldContent: any, newContent: any): {
        additions: number;
        deletions: number;
        modifications: number;
        details: never[];
    };
    static getVersionHistory(entityType: any, entityId: any, options?: {}): Promise<Version[]>;
    static createSnapshot(entityType: any, entityId: any, content: any, metadata?: {}): Promise<Version>;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    restoreVersion(): Promise<{
        entityType: any;
        entityId: any;
        content: any;
        version: any;
        restoredAt: Date;
    }>;
    compareWith(otherVersionId: any): Promise<{
        fromVersion: any;
        toVersion: any;
        fromDate: any;
        toDate: any;
        diff: {
            additions: number;
            deletions: number;
            modifications: number;
            details: never[];
        };
        summary: string;
    }>;
    generateChangelogEntry(): string;
    validateIntegrity(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
}
export function initVersionModel(sequelize: any): typeof Version;
import { Model } from 'sequelize';
export { Version as model };
//# sourceMappingURL=version.model.d.ts.map