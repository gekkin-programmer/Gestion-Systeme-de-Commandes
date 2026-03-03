import dk from '@/styles/dark.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className={dk.card} style={{ marginBottom: 0 }}>
      <span className={dk.sectionLabel}>{title}</span>
      <p className={dk.playfair} style={{ fontSize: 26, color: 'var(--gold)', lineHeight: 1.1 }}>
        {value}
      </p>
      {subtitle && (
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: 'var(--cream-dim)', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
