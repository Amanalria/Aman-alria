import { useRef, useState, type ReactNode } from "react";

export type AccordionItem = {
  title: string;
  meta?: string;
  body: ReactNode;
};

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="stagger border-t border-border">
      {items.map((item, i) => (
        <Row
          key={item.title}
          index={i}
          item={item}
          open={open === i}
          onToggle={() => setOpen(open === i ? null : i)}
        />
      ))}
    </div>
  );
}

function Row({
  index,
  item,
  open,
  onToggle,
}: {
  index: number;
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
}) {
  const inner = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-5 py-7 text-left md:py-9"
      >
        <span
          className={`mono-label w-8 shrink-0 transition-colors duration-500 ${
            open ? "text-accent" : "text-subtle"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`display-tight block text-2xl transition-all duration-500 group-hover:translate-x-1 md:text-4xl ${
              open ? "text-accent" : "text-foreground"
            }`}
          >
            {item.title}
          </span>
          {item.meta && (
            <span className="mono-label mt-2 block text-subtle">{item.meta}</span>
          )}
        </span>
        <span
          className={`shrink-0 text-lg leading-none text-accent transition-transform duration-500 ${
            open ? "rotate-180" : "group-hover:translate-y-0.5"
          }`}
        >
          ⌃
        </span>
      </button>

      <div
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        className="grid transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="overflow-hidden">
          <div
            ref={inner}
            className={`pb-8 pl-13 transition-all duration-500 md:pl-13 ${
              open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`}
          >
            {item.body}
          </div>
        </div>
      </div>
    </div>
  );
}
