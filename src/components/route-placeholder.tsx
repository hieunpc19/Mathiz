type RoutePlaceholderProps = {
  title: string;
  description: string;
  route: string;
  detail?: string;
};

export function RoutePlaceholder({
  title,
  description,
  route,
  detail,
}: RoutePlaceholderProps) {
  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-sm text-teal-700">{route}</p>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
          Chưa triển khai
        </span>
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        {description}
      </p>
      {detail ? (
        <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {detail}
        </p>
      ) : null}
    </section>
  );
}
