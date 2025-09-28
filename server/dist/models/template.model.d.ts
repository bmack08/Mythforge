declare class Template extends Model<any, any> {
    static getTemplateCategories(): {
        encounter: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        npc: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        location: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        quest: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        item: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        organization: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
        event: {
            description: string;
            subcategories: string[];
            requiredFields: string[];
        };
    };
    static validateTemplateStructure(templateData: any, category: any): any[];
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    processTemplate(variables?: {}): {
        title: any;
        content: any;
        processedAt: Date;
        variables: {};
    };
    processConditionals(content: any, variables: any): any;
    processLoops(content: any, variables: any): any;
    rollDice(diceNotation: any): any;
    validateTemplate(): {
        isValid: boolean;
        errors: any[];
        warnings: any[];
    };
    cloneTemplate(newName: any, userId: any): Promise<Template>;
    generatePreview(sampleVariables?: {}): {
        title: any;
        content: any;
        processedAt: Date;
        variables: {};
    };
}
export function initTemplateModel(sequelize: any): typeof Template;
import { Model } from 'sequelize';
export { Template as model };
//# sourceMappingURL=template.model.d.ts.map