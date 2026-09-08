import { myAlerts } from "@/lib/dummy-data";

export default function AlertsPanel() {
  return (
    <section id="alerts" className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5">
        <p className="mb-1 text-xs text-muted">MY ALERTS</p>
        <h2 className="font-display font-bold text-2xl text-paper">조건형 알림</h2>
      </div>

      <div className="divide-y divide-line border border-line bg-surface">
        {myAlerts.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-paper">“{a.label}”</p>
            <span className="rounded-full border border-gold px-2.5 py-0.5 text-xs text-gold">
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
