"use client";

import { useFormStatus } from "react-dom";

type Props = {
  label?: string;
};

export function ExecuteButton({ label = "Execute" }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-black px-4 py-2 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-500"
    >
      {pending ? "Running..." : label}
    </button>
  );
}
