# Product Teaser Block

## Overview

The Product Teaser block displays a product card with image, name, and price using the Adobe Commerce Catalog Service GraphQL API. It supports both simple and complex product types with proper price rendering.

## Configuration

| Option | Description | Example |
|--------|-------------|---------|
| `sku` | Product SKU to display | `24-MB01` |

## Integration

### Dropins Used

- Commerce Catalog Service GraphQL API (direct query)
- `scripts/commerce.js` - URL encoding and root link utilities

### Events

- Triggers ACDL product view events for analytics

## Behavior

- Fetches product data via GraphQL using the configured SKU
- Renders product image, name, and price
- Links to the product detail page
- Handles both simple products (single price) and complex products (price range)
