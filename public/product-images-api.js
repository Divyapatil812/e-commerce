const PRODUCT_IMAGE_API_KEY = "X03vqUGn2lqSvhcK0VLVuh4bIm3L7nD6vhIDQlHQUUpm58G6B2nF4DNz";

function getImageUrl(imgId) {
  return `https://fakestoreapi.com/img/${imgId}.jpg?apiKey=${PRODUCT_IMAGE_API_KEY}`;
}

// Export for use in HTML
window.ProductImagesAPI = { PRODUCT_IMAGE_API_KEY, getImageUrl };

