import { redirect } from 'next/navigation';

export default function MenuRedirect({ params }: { params: { locale: string, hotelSlug: string, id: string } }) {
  // Redirect old restaurant QR codes to the new Stay flow
  redirect(`/${params.locale}/stay/${params.id}`);
}
