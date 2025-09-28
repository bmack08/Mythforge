export default Markdown;
declare namespace Markdown {
    export { Marked as marked };
    export function render(rawBrewText: any, pageNumber?: number): string;
    export function validate(rawBrewText: any): any[];
}
import { marked as Marked } from 'marked';
//# sourceMappingURL=markdown.d.ts.map