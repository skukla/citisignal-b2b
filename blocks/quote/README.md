# Quote Block

## Overview

The Quote block renders styled blockquote content with optional attribution. It supports quotation marks, author citations, and responsive layout.

## Configuration

The block uses semantic HTML structure via the block editor:

| Row | Purpose | Example |
|-----|---------|---------|
| 1 | Quote text | "Design is not just what it looks like..." |
| 2 | Attribution (optional) | Steve Jobs |

## Behavior

- Wraps content in a semantic `<blockquote>` element
- Adds decorative quotation marks via CSS
- Supports optional author attribution
- Responsive padding adjusts at 900px breakpoint

## Styling

- `.quote blockquote` - Main quote container (max-width: 900px)
- `.quote-quotation` - Quote text (120% font size)
- `.quote-attribution` - Author citation
