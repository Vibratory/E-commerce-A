"use client";

import { useState, useTransition } from "react";

type HideToggleProps = {
  id: string;
  hidden: boolean;
};

export const HideToggle = ({ id, hidden }: HideToggleProps) => {
  const [checked, setChecked] = useState(hidden);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setChecked(newValue); // Optimistic UI

    startTransition(async () => {
      await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: newValue }),
      });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={isPending}
      />
      {isPending && <span className="text-xs text-gray-400">Saving...</span>}
    </div>
  );
};
