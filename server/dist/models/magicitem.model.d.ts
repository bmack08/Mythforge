declare class MagicItem extends Model<any, any> {
    static getPriceRange(rarity: any): any;
    static validateAttunement(attunementType: any, attunementRequirement: any): string[];
    static categorizeItem(itemType: any, properties: any): any;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    calculateTreasureValue(partyLevel?: number): number;
    isAppropriateForLevel(partyLevel: any): any;
    validateMagicItem(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    toHomebreweryMarkdown(): string;
    useCharges(amount?: number): Promise<any>;
    properties: any;
    recharge(amount?: null): Promise<any>;
}
export function initMagicItemModel(sequelize: any): typeof MagicItem;
import { Model } from 'sequelize';
export { MagicItem as model };
//# sourceMappingURL=magicitem.model.d.ts.map