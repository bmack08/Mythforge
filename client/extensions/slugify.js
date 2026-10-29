/**
 * slugify — shared heading-anchor slug generator.
 *
 * Single source of truth so HeadingWithId (which writes `id` attrs on heading
 * NodeViews) and OutlinePanel (which jumps to those ids) never drift. Mirrors
 * the original inline implementation that lived in HeadingWithId.js.
 */
export default function slugify(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove non-word chars
    .replace(/[\s_-]+/g, '-')   // Collapse spaces/underscores to a single dash
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing dashes
}
