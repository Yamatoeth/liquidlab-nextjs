import IndexPage from "@/pages/Index";
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata() {
  return buildMetadata({});
}

export default function Index() {
  return <IndexPage />;
}
