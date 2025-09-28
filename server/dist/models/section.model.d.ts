declare class Section extends Model<any, any> {
    static getByType(chapterId: any, sectionType: any): Promise<Section[]>;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    validateContent(): any;
    validateStatBlock(): {
        valid: boolean;
        errors: string[];
    };
    validateEncounter(): {
        valid: boolean;
        errors: string[];
    };
    validateMagicItem(): {
        valid: boolean;
        errors: string[];
    };
    validateNPC(): {
        valid: boolean;
        errors: string[];
    };
    validateLocation(): {
        valid: boolean;
        errors: string[];
    };
    validateTable(): {
        valid: boolean;
        errors: string[];
    };
    toHomebreweryMarkdown(): any;
    generateTextMarkdown(): any;
    generateStatBlockMarkdown(): string;
    generateEncounterMarkdown(): string;
    generateMagicItemMarkdown(): string;
    generateNPCMarkdown(): string;
    generateLocationMarkdown(): string;
    generateTableMarkdown(): string;
    generateBoxedTextMarkdown(): string;
    generateSidebarMarkdown(): string;
}
export function initSectionModel(sequelize: any): typeof Section;
import { Model } from 'sequelize';
export { Section as model };
//# sourceMappingURL=section.model.d.ts.map