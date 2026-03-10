import { UseTheme } from "./UseTheme";

export default function SettingsPage() {
  const { theme, setTheme } = UseTheme();
  const dark = theme === "dark";

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          Settings
        </h1>
        <p className={`text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Manage your admin dashboard preferences.
        </p>
      </div>

      {/* Appearance card */}
      <div className={`rounded-xl border p-5 space-y-4 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <h2 className={`text-sm font-semibold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Appearance
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Light mode option */}
          <button
            onClick={() => setTheme("light")}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-50"
                : dark
                  ? "border-slate-700 bg-slate-800 hover:border-slate-600"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
          >
            {/* Mini preview */}
            <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 bg-white h-16 flex">
              <div className="w-10 bg-white border-r border-slate-200 flex flex-col gap-1 p-1">
                <div className="h-1.5 rounded bg-slate-200 w-full" />
                <div className="h-1.5 rounded bg-slate-100 w-full" />
                <div className="h-1.5 rounded bg-slate-100 w-full" />
              </div>
              <div className="flex-1 bg-slate-100 p-1.5 flex flex-col gap-1">
                <div className="h-2 rounded bg-slate-200 w-3/4" />
                <div className="h-1.5 rounded bg-slate-200 w-1/2" />
              </div>
            </div>
            <div className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-800"}`}>Light</div>
            <div className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Clean & bright</div>
            {theme === "light" && (
              <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                ✓
              </span>
            )}
          </button>

          {/* Dark mode option */}
          <button
            onClick={() => setTheme("dark")}
            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-500/10"
                : dark
                  ? "border-slate-700 bg-slate-800 hover:border-slate-600"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
            }`}
          >
            {/* Mini preview */}
            <div className="mb-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 h-16 flex">
              <div className="w-10 bg-slate-900 border-r border-slate-700 flex flex-col gap-1 p-1">
                <div className="h-1.5 rounded bg-slate-700 w-full" />
                <div className="h-1.5 rounded bg-slate-800 w-full" />
                <div className="h-1.5 rounded bg-slate-800 w-full" />
              </div>
              <div className="flex-1 bg-slate-950 p-1.5 flex flex-col gap-1">
                <div className="h-2 rounded bg-slate-700 w-3/4" />
                <div className="h-1.5 rounded bg-slate-800 w-1/2" />
              </div>
            </div>
            <div className={`text-sm font-medium ${dark ? "text-slate-200" : "text-slate-800"}`}>Dark</div>
            <div className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Easy on the eyes</div>
            {theme === "dark" && (
              <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">
                ✓
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}