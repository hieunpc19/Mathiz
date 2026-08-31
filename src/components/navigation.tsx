import Link from "next/link";

type NavigationItem = {
  href: string;
  label: string;
};

type NavigationProps = {
  items: readonly NavigationItem[];
};

export function Navigation({ items }: NavigationProps) {
  return (
    <nav aria-label="Điều hướng khu vực">
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
