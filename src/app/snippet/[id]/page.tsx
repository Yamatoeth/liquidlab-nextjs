import ProductDetailPage from "@/pages/ProductDetail";
import { snippets } from '@/client/data/snippets';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const snippet = snippets.find((s) => s.id === id);
  if (!snippet) return buildMetadata({ title: 'Snippet' });

  return buildMetadata({ title: snippet.title, description: snippet.description, path: `/snippets/${snippet.id}`, image: snippet.images?.[0] });
}

export default function ProductDetail() {
  return <ProductDetailPage />;
}
