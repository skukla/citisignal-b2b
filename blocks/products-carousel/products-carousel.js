import { readBlockConfig } from '../../scripts/aem.js';
import { getProductLink, commerceEndpointWithQueryParams } from '../../scripts/commerce.js';
import { getHeaders } from '@dropins/tools/lib/aem/configs.js';

const PRODUCTS_CAROUSEL_QUERY = `
query productsCarousel($skus: [String!]!) {
  products(skus: $skus) {
    sku
    urlKey
    name
    addToCartAllowed
    __typename
    images(roles: []) {
      url
      label
    }
    ... on SimpleProductView {
      price {
        regular { amount { currency value } }
        final { amount { currency value } }
      }
    }
    ... on ComplexProductView {
      priceRange {
        minimum {
          regular { amount { currency value } }
          final { amount { currency value } }
        }
      }
    }
  }
}`;

async function fetchProducts(skus) {
  const headers = { ...getHeaders('cs'), 'Content-Type': 'application/json' };
  const endpoint = await commerceEndpointWithQueryParams();
  endpoint.searchParams.append('query', PRODUCTS_CAROUSEL_QUERY.replace(/\s+/g, ' ').trim());
  endpoint.searchParams.append('variables', JSON.stringify({ skus }));
  const res = await fetch(endpoint, { method: 'GET', headers });
  if (!res.ok) return [];
  const { data } = await res.json();
  return data?.products ?? [];
}

function formatPrice(product) {
  const amount = product.price?.final?.amount ?? product.priceRange?.minimum?.final?.amount;
  if (!amount) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: amount.currency,
  }).format(amount.value);
}

function buildSlide(product) {
  const imageUrl = product.images?.[0]?.url ?? '';
  const imageLabel = product.images?.[0]?.label ?? product.name;
  const link = getProductLink(product.urlKey, product.sku);
  const price = formatPrice(product);
  const isSimple = product.__typename === 'SimpleProductView';
  const normalizedUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;

  const slide = document.createElement('li');
  slide.classList.add('products-carousel-slide');
  slide.innerHTML = `
    <a class="products-carousel-image" href="${link}">
      <img src="${normalizedUrl}" alt="${imageLabel}" loading="lazy" width="280" height="280" />
    </a>
    <div class="products-carousel-details">
      <a class="products-carousel-name" href="${link}">${product.name}</a>
      ${price ? `<span class="products-carousel-price">${price}</span>` : ''}
      <div class="products-carousel-actions">
        ${isSimple && product.addToCartAllowed
    ? `<button class="products-carousel-atc button" data-sku="${product.sku}" type="button">Add to Cart</button>`
    : `<a class="button secondary products-carousel-options" href="${link}">View Options</a>`}
      </div>
    </div>`;
  return slide;
}

function bindNav(track, scrollAmount) {
  const prev = track.closest('.products-carousel-viewport').querySelector('.products-carousel-prev');
  const next = track.closest('.products-carousel-viewport').querySelector('.products-carousel-next');
  prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

function bindAddToCart(block) {
  block.querySelectorAll('.products-carousel-atc').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const { sku } = btn.dataset;
      btn.disabled = true;
      try {
        const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
        await addProductsToCart([{ sku, quantity: 1 }]);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const skus = (config.skus || '').split(',').map((s) => s.trim()).filter(Boolean);
  const title = config.title || '';

  block.textContent = '';

  if (!skus.length) {
    block.innerHTML = '<p class="products-carousel-empty">No products configured.</p>';
    return;
  }

  const products = await fetchProducts(skus);
  if (!products.length) {
    block.innerHTML = '<p class="products-carousel-empty">No products found.</p>';
    return;
  }

  if (title) {
    const heading = document.createElement('h2');
    heading.classList.add('products-carousel-title');
    heading.textContent = title;
    block.appendChild(heading);
  }

  const viewport = document.createElement('div');
  viewport.classList.add('products-carousel-viewport');

  const track = document.createElement('ul');
  track.classList.add('products-carousel-track');
  track.setAttribute('role', 'list');

  products.forEach((product) => track.appendChild(buildSlide(product)));
  viewport.appendChild(track);

  if (products.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.classList.add('products-carousel-prev');
    prevBtn.setAttribute('aria-label', 'Previous products');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.classList.add('products-carousel-next');
    nextBtn.setAttribute('aria-label', 'Next products');

    viewport.appendChild(prevBtn);
    viewport.appendChild(nextBtn);
  }

  block.appendChild(viewport);

  if (products.length > 1) {
    const slideWidth = 296;
    bindNav(track, slideWidth);
  }

  bindAddToCart(block);
}
