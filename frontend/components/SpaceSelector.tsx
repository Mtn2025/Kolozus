"use client";

import { useSpace } from "@/app/lib/SpaceContext";
import { useState, useRef, useEffect } from "react";
import { api } from "@/app/lib/api";

export default function SpaceSelector() {
    const { currentSpace, spaces, setSpace, refreshSpaces, isLoading } = useSpace();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreating(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreate = async () => {
        if (!newSpaceName.trim()) return;
        try {
            const newSpace = await api.createSpace(newSpaceName);
            refreshSpaces();
            setSpace(newSpace);
            setNewSpaceName("");
            setIsCreating(false);
            setIsOpen(false);
        } catch (e) {
            alert("Failed to create space");
        }
    };

    if (isLoading) return <div className="text-sm text-slate-400">Loading...</div>;

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-between w-48 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <div className="flex items-center truncate">
                    <span className="w-2.5 h-2.5 mr-2 rounded-full" style={{ backgroundColor: currentSpace?.color || '#cbd5e1' }}></span>
                    {currentSpace?.name || "Select Space..."}
                </div>
                <svg className="w-4 h-4 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
                    <div className="py-1">
                        {!isCreating && (
                            <>
                                {spaces.map((space) => (
                                    <button
                                        key={space.id}
                                        onClick={() => {
                                            setSpace(space);
                                            setIsOpen(false);
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm text-left ${currentSpace?.id === space.id ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <span className="w-2 h-2 mr-2 rounded-full" style={{ backgroundColor: space.color || '#cbd5e1' }}></span>
                                        {space.name}
                                    </button>
                                ))}
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-indigo-600 hover:bg-slate-50"
                                >
                                    + New Space
                                </button>
                            </>
                        )}

                        {isCreating && (
                            <div className="px-4 py-2">
                                <input
                                    autoFocus
                                    type="text"
                                    className="block w-full px-2 py-1 text-sm border-slate-300 rounded mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="Space Name"
                                    value={newSpaceName}
                                    onChange={(e) => setNewSpaceName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                        if (e.key === 'Escape') setIsCreating(false);
                                    }}
                                />
                                <div className="flex justify-between">
                                    <button onClick={() => setIsCreating(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                    <button onClick={handleCreate} className="text-xs text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700">Create</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
