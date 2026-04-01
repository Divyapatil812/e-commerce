export default async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get("query");
  const count = parseInt(url.searchParams.get("count") || "15", 10);

  if (!query) {
    return Response.json({ error: "query parameter is required" }, { status: 400 });
  }

  const apiKey = Netlify.env.get("SRC_IMAGE_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "Image API key not configured" }, { status: 500 });
  }

  const perPage = Math.min(count, 80);

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`,
      { headers: { Authorization: apiKey } }
    );

    if (!response.ok) {
      return Response.json({ error: "Image API request failed" }, { status: 502 });
    }

    const data = await response.json();
    const images = (data.photos || []).map((photo) => ({
      url: photo.src.medium,
      tiny: photo.src.tiny,
      alt: photo.alt || query,
    }));

    return Response.json({ images }, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    return Response.json({ error: "Failed to fetch images" }, { status: 500 });
  }
};

export const config = {
  path: "/api/product-images",
};
