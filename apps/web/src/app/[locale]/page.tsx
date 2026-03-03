import { redirect } from 'next/navigation';

// Dev shortcut → customer menu (Table 1, Restaurant Le Baobab)
// For staff/admin access go to /{locale}/login directly
const DEMO_SLUG  = 'restaurant-le-baobab';
const DEMO_TOKEN = '13863c0a-bf90-4ed3-9ccb-86b2c88f5157';

export default function LocalePage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/menu/${DEMO_SLUG}/${DEMO_TOKEN}`);
}
