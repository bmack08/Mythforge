declare class NPC extends Model<any, any> {
    static generateRandomPersonality(): {
        trait: string;
        ideal: string;
        bond: string;
        flaw: string;
    };
    static generateVoiceProfile(): {
        accent: string;
        speechPattern: string;
        mannerism: string;
        pitch: string;
        volume: string;
    };
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    generateDialogueSample(context?: string): any;
    calculateSocialCR(): number;
    validateNPC(): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    toHomebreweryMarkdown(): string;
    addRelationship(targetNPCId: any, relationshipType: any, description: any): Promise<this>;
    relationships: any;
}
export function initNPCModel(sequelize: any): typeof NPC;
import { Model } from 'sequelize';
export { NPC as model };
//# sourceMappingURL=npc.model.d.ts.map