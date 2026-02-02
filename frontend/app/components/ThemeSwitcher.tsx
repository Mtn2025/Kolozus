"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: "evo", name: "Evo (Default)" },
        { id: "classic", name: "Classic" },
        { id: "minimal", name: "Minimal" }
    ];

    return (
        <div className="flex items-center ml-2">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="
                    appearance-none
                    bg-transparent
                    px-2 py-1.5 
                    text-xs font-medium text-slate-500 hover:text-slate-900
                    border border-transparent hover:border-slate-300 rounded-md
                    focus:outline-none focus:ring-1 focus:ring-slate-400
                    cursor-pointer
                "
                title="Design Theme"
            >
                {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
        </div>
    );
}
