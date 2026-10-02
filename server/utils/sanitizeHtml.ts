import sanitizeHtml from 'sanitize-html';

// M2: stored rich text (shelf_books.content*, content.body_*) is rendered with
// dangerouslySetInnerHTML (public /library reader, admin previews). Sanitize
// ONCE at every write with a strict allowlist:
// - no script/style/iframe/object/embed/form/svg/math/base/link/meta — no XSS
//   and no UI-redress/phishing markup even when CSP is off (dev / CMS_CSP_MODE=off);
// - no event-handler attributes (onerror, onload, ...);
// - no javascript:/data: schemes on href/src;
// - no class/style attributes: keeps rendered HTML inside the reader's own
//   typography, blocks overlay/reflow tricks.
// Plain text passes through unchanged (current DB rows are tag-free).
export function sanitizeRich(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'blockquote', 'a', 'span', 'pre', 'code',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
  });
}

export function sanitizeRichOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return sanitizeRich(String(v));
}
