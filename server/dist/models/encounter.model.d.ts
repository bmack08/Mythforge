declare class Encounter extends Model<any, any> {
    static getXPMultiplier(numberOfCreatures: any, partySize?: number): any;
    static getDifficultyThresholds(level: any): any;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    calculateXPValue(): {
        baseXP: number;
        adjustedXP: number;
        creatureCount: number;
    };
    getDifficulty(partyLevel: any, partySize?: number): {
        level: string;
        color: string;
    };
    validateBalance(partyLevel: any, partySize?: number): {
        isValid: boolean;
        difficulty: string;
        adjustedXP: number;
        warnings: string[];
        errors: string[];
    };
    suggestModifications(targetDifficulty: any, partyLevel: any, partySize?: number): ({
        type: string;
        description: string;
        targetXP: number;
        excessXP?: undefined;
    } | {
        type: string;
        description: string;
        excessXP: number;
        targetXP?: undefined;
    })[];
}
export function initEncounterModel(sequelize: any): typeof Encounter;
import { Model } from 'sequelize';
export { Encounter as model };
//# sourceMappingURL=encounter.model.d.ts.map