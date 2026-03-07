import { useState } from "react";

function objectToRows(specifications = {}) {
  const entries = Object.entries(specifications);

  if (entries.length === 0) {
    return [{ id: crypto.randomUUID(), key: "", value: "" }];
  }

  return entries.map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: value ?? "",
  }));
}

function rowsToObject(rows) {
  return rows.reduce((acc, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key || !value) return acc;

    acc[key] = value;
    return acc;
  }, {});
}

export default function SpecificationsEditor({
  specifications = {},
  onChange,
}) {
  const [rows, setRows] = useState(() => objectToRows(specifications));

  function updateRow(id, field, nextValue) {
    setRows((prev) => {
      const nextRows = prev.map((row) =>
        row.id === id ? { ...row, [field]: nextValue } : row
      );

      onChange(rowsToObject(nextRows));
      return nextRows;
    });
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  }

  function removeRow(id) {
    setRows((prev) => {
      const nextRows =
        prev.length === 1
          ? [{ id: crypto.randomUUID(), key: "", value: "" }]
          : prev.filter((row) => row.id !== id);

      onChange(rowsToObject(nextRows));
      return nextRows;
    });
  }

  return (
    <div className="md:col-span-2">
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm text-slate-300">Specifications</label>
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          + Add Spec
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
        <div className="grid grid-cols-[1fr_1.5fr_auto] gap-3 border-b border-slate-700 px-3 py-2 text-sm text-slate-400">
          <div>Spec Name</div>
          <div>Value</div>
          <div></div>
        </div>

        <div className="divide-y divide-slate-700">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_1.5fr_auto] gap-3 px-3 py-2"
            >
              <input
                type="text"
                value={row.key}
                onChange={(e) => updateRow(row.id, "key", e.target.value)}
                placeholder="e.g. display"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-slate-500"
              />

              <input
                type="text"
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
                placeholder="e.g. 16.2-inch Liquid Retina XDR"
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-slate-500"
              />

              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}