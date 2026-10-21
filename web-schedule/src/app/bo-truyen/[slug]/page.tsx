import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BoTruyenSlugRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/tac-pham/${slug}`);
}
