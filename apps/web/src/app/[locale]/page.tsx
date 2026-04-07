import { redirect } from 'next/navigation';

export default function LocalePage({ params }: { params: { locale: string } }) {
  // Direct web users to the new client login experience by default
  redirect(`/${params.locale}/client/login`);
}
