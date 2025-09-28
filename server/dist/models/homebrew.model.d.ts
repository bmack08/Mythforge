declare class Homebrew extends Model<any, any> {
    static increaseView(query: any): Promise<Homebrew | null>;
    static get(query: any, fields?: null): Promise<Homebrew>;
    static getByUser(username: any, allowAccess?: boolean, fields?: null, filter?: {}): Promise<Homebrew[]>;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    saveWithCompression(): Promise<this>;
    textBin: Buffer<ArrayBufferLike> | undefined;
    text: any;
}
export function initHomebrewModel(sequelize: any): typeof Homebrew;
import { Model } from 'sequelize';
export { Homebrew as model };
//# sourceMappingURL=homebrew.model.d.ts.map