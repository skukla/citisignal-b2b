# Products Carousel Block

## Overview

The Products Carousel block displays a horizontally-scrollable carousel of product cards fetched directly from the Adobe Commerce Catalog Service GraphQL API. Authors configure a comma-separated list of SKUs; the block resolves product data at runtime and renders each product as a card with image, name, price, and an Add to Cart or View Options action.

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `skus` | string | Yes | Comma-separated list of product SKUs to display (e.g. `24-MB01, 24-MB02, 24-MB03`) |
| `title` | string | No | Optional heading rendered above the carousel |

## Integration

### Dropins / APIs Used

- **Adobe Commerce Catalog Service GraphQL** — `products(skus: [...])` query via `commerceEndpointWithQueryParams()` and `getHeaders('cs')` from `@dropins/tools/lib/aem/configs.js`
- **Cart Dropin** — `@dropins/storefront-cart/api.js` `addProductsToCart()` (dynamically imported on Add to Cart click)

### Events

- No custom events emitted or consumed.
- Cart state updates are handled by the Cart dropin after `addProductsToCart()` is called.

## Behavior Patterns

### Rendering Flow

1. Block reads `skus` and `title` from block config via `readBlockConfig()`
2. SKUs are split, trimmed, and validated — an empty state message renders if none are provided
3. Products are fetched in a single GraphQL batch query
4. Each product renders as a `<li>` slide inside a flex track with `scroll-snap-type: x mandatory`
5. Prev/next buttons scroll the track by one slide width (296px); hidden on mobile where native swipe applies

### Product Card Actions

- **Simple products** with `addToCartAllowed: true` — "Add to Cart" button; disables during the async cart call, re-enables after
- **All other product types** (configurable, bundle, out-of-stock) — "View Options" link to the product detail page

### Error Handling

- If the GraphQL fetch fails or returns no data, an empty-state paragraph is shown
- Image URLs starting with `//` are normalized to `https://`
- If `addProductsToCart` throws, the button is re-enabled via `finally`
