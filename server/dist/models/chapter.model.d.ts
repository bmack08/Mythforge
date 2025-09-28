declare class Chapter extends Model<any, any> {
    static getProjectTree(projectId: any): Promise<any[]>;
    static buildHierarchy(chapters: any): any[];
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    getPath(): Promise<string>;
    getDescendants(): any;
    calculateWordCount(): number;
}
export function initChapterModel(sequelize: any): typeof Chapter;
import { Model } from 'sequelize';
export { Chapter as model };
//# sourceMappingURL=chapter.model.d.ts.map