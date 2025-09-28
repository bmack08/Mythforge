export function initializeModels(config: any): Promise<{
    Homebrew: typeof import("./homebrew.model.js").model;
    Notification: typeof import("./notification.model.js").model;
    Project: typeof import("./project.model.js").model;
    Chapter: typeof import("./chapter.model.js").model;
    Section: typeof import("./section.model.js").model;
    Encounter: typeof import("./encounter.model.js").model;
    StatBlock: typeof import("./statblock.model.js").model;
    MagicItem: typeof import("./magicitem.model.js").model;
    NPC: typeof import("./npc.model.js").model;
    Template: typeof import("./template.model.js").model;
    Version: typeof import("./version.model.js").model;
    sequelize: import("sequelize").Sequelize;
}>;
export function getModels(): any;
//# sourceMappingURL=index.d.ts.map