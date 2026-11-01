import { redirect } from 'next/navigation';

interface PlayLevelProps {
  params: Promise<{ levelId: string }>;
}

export default async function PlayLevelPage({ params }: PlayLevelProps) {
  const { levelId } = await params;
  const [chap, verse] = levelId.split('.');
  redirect(`/learn/${chap || 1}/${verse || 1}`);
}
