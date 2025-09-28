import { z } from 'zod';
export interface ContentBlockDefinition {
    type: string;
    name: string;
    description: string;
    icon: string;
    category: 'text' | 'layout' | 'interactive' | 'media' | 'data';
    schema: z.ZodSchema;
    renderer: (content: unknown, metadata?: Record<string, unknown>) => string;
    validator?: (content: unknown) => {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    defaultContent: unknown;
    examples: Array<{
        name: string;
        description: string;
        content: unknown;
        metadata?: Record<string, unknown>;
    }>;
}
export declare const TextBlockDefinition: ContentBlockDefinition;
export declare const BoxedTextBlockDefinition: ContentBlockDefinition;
export declare const SidebarBlockDefinition: ContentBlockDefinition;
export declare const TableBlockDefinition: ContentBlockDefinition;
export declare const StatBlockContentDefinition: ContentBlockDefinition;
export declare const ImageBlockDefinition: ContentBlockDefinition;
export declare const HandoutBlockDefinition: ContentBlockDefinition;
export declare const ContentBlockRegistry: Record<string, ContentBlockDefinition>;
export declare class ContentBlockProcessor {
    static getBlockDefinition(type: string): ContentBlockDefinition | null;
    static validateBlock(type: string, content: unknown): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    };
    static renderBlock(type: string, content: unknown, metadata?: Record<string, unknown>): string;
    static getAllBlockTypes(): string[];
    static getBlocksByCategory(category: string): ContentBlockDefinition[];
    static createDefaultBlock(type: string): {
        type: string;
        content: unknown;
        metadata: Record<string, unknown>;
    };
    static getBlockExamples(type: string): Array<{
        name: string;
        description: string;
        content: unknown;
        metadata?: Record<string, unknown>;
    }>;
}
export declare class ContentBlockBuilder {
    private blocks;
    addBlock(type: string, content?: unknown, metadata?: Record<string, unknown>): this;
    addText(content: string, formatting?: any): this;
    addBoxedText(content: string, title?: string, style?: string): this;
    addSidebar(title: string, content: string, options?: any): this;
    addTable(headers: string[], rows: string[][], title?: string, options?: any): this;
    addStatBlock(statBlockId?: string, customData?: any): this;
    addImage(src: string, alt: string, options?: any): this;
    addHandout(title: string, content: string, options?: any): this;
    validate(): {
        isValid: boolean;
        errors: Array<{
            blockId: string;
            errors: string[];
        }>;
        warnings: Array<{
            blockId: string;
            warnings: string[];
        }>;
    };
    render(): string;
    getBlocks(): Array<{
        id: string;
        type: string;
        content: unknown;
        metadata: Record<string, unknown>;
    }>;
    clear(): this;
}
export { ContentBlockRegistry, ContentBlockProcessor, ContentBlockBuilder, TextBlockDefinition, BoxedTextBlockDefinition, SidebarBlockDefinition, TableBlockDefinition, StatBlockContentDefinition, ImageBlockDefinition, HandoutBlockDefinition, };
export type { ContentBlockDefinition };
//# sourceMappingURL=index.d.ts.map