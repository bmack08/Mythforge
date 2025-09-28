declare class StatBlock extends Model<any, any> {
    static calculateCR(stats: any): {
        calculatedCR: number;
        defensiveCR: number;
        offensiveCR: number;
        effectiveHP: any;
        maxDamage: number;
    };
    static getXPFromCR(challengeRating: any): any;
    static validateAbilityScores(abilities: any): any[];
    static getAbilityModifier(score: any): number;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    getProficiencyBonus(): 8 | 2 | 6 | 5 | 3 | 9 | 4 | 7;
    validateStatBlock(): {
        isValid: boolean;
        errors: any[];
        warnings: string[];
    };
    toHomebreweryMarkdown(): string;
}
export function initStatBlockModel(sequelize: any): typeof StatBlock;
import { Model } from 'sequelize';
export { StatBlock as model };
//# sourceMappingURL=statblock.model.d.ts.map