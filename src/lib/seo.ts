import siteConfig from '@/config/seo';

type MetaInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

export function buildMetadata({ title, description, path, image }: MetaInput) {
  const resolvedTitle = title ? `${title} | ${siteConfig.title}` : siteConfig.title;
  const url = path ? `${siteConfig.siteUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : siteConfig.siteUrl;
  const imageUrl = image ?? siteConfig.openGraphImage;

  return {
    title: resolvedTitle,
    description: description ?? siteConfig.description,
    openGraph: {
      title: resolvedTitle,
      description: description ?? siteConfig.description,
      url,
      images: [imageUrl],
    },
    twitter: {
      card: siteConfig.twitter.card,
    },
    alternates: {
      canonical: url,
    },
  } as const;
}

export default buildMetadata;
