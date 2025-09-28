declare class Project extends Model<any, any> {
    static getByUser(userId: any, includePrivate?: boolean): Promise<Project[]>;
    static getWithContent(projectId: any, userId?: null): Promise<Project>;
    constructor(values?: import("sequelize").Optional<any, string> | undefined, options?: import("sequelize").BuildOptions);
    calculateXPBudget(): {
        easy: number;
        medium: number;
        hard: number;
        deadly: number;
        selected: number;
    };
    updateProgress(step: any, totalSteps: any, currentTask?: string): Promise<this>;
    generationProgress: {
        step: any;
        totalSteps: any;
        percentage: number;
        currentTask: string;
        updatedAt: Date;
    } | undefined;
}
export function initProjectModel(sequelize: any): typeof Project;
import { Model } from 'sequelize';
export { Project as model };
//# sourceMappingURL=project.model.d.ts.map