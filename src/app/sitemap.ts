import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://classquest.app',
            lastModified: new Date(),
        },
    ]
}