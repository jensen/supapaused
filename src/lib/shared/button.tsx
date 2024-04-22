import { clsx } from "clsx";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const cxButton = clsx(
  "space-x-2 min-w-32",
  "text-sm font-medium px-6 py-2 rounded",
  "shadow-button active:shadow-none"
);

export function DarkButton(props: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        cxButton,
        "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800",
        "text-zinc-300 hover:text-zinc-200 active:text-zinc-300"
      )}
    >
      {props.children}
    </button>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        cxButton,
        "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-500",
        "text-zinc-900 hover:text-zinc-900 active:text-zinc-900"
      )}
    >
      {props.children}
    </button>
  );
}
