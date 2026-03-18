import dynamic from 'next/dynamic';
import styles from './menu.module.css';

// Skeleton shown on server and during dynamic import — no client state involved
function MenuSkeleton() {
  return (
    <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: '100dvh' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(200,169,110,0.15)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'var(--cream-dim)', letterSpacing: '0.08em' }}>
        Chargement du menu…
      </p>
    </div>
  );
}

// ssr: false — the client component loads only on the browser.
// Server and client both render <MenuSkeleton /> during hydration → no mismatch.
const MenuPageClient = dynamic(() => import('./MenuPageClient'), {
  ssr: false,
  loading: () => <MenuSkeleton />,
});

interface MenuPageProps {
  params: { restaurantSlug: string; tableToken: string };
}

export default function MenuPage({ params }: MenuPageProps) {
  return <MenuPageClient params={params} />;
}
