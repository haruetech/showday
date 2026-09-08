import { ReactNode } from "react";

export default function SectionRow({
  eyebrow,
  title,
  action,
  children,
  id,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1 text-xs text-muted">{eyebrow}</p>
          )}
          <h2 className="font-display text-2xl text-paper">{title}</h2>
        </div>
        {action}
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {children}
      </div>
    </section>
  );
}
