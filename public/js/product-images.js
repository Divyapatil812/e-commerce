/**
 * Fetches product images from Pexels via the Netlify Function proxy.
 * Uses each product's NAME as the search query for relevant images.
 *
 * @param {Array} products - Array of product objects with `name` field
 * @param {string} imageField - The field name for the image URL ('image' or 'img')
 */
async function loadProductImages(products, imageField) {
  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const fetchPromises = batch.map(async (product) => {
      try {
        const res = await fetch(
          `/api/product-images?query=${encodeURIComponent(product.name)}&count=1`
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          product[imageField] = data.images[0].url;
        }
      } catch {
        // Keep existing image on failure
      }
    });
    await Promise.all(fetchPromises);
  }
}
