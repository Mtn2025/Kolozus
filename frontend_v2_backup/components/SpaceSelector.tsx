"use client";

import { useSpace } from "@/app/lib/SpaceContext";
import { useState, useRef, useEffect } from "react";
import { api } from "@/app/lib/api";
import CreateSpaceModal from "./CreateSpaceModal";

import { useLanguage } from "@/app/context/LanguageContext";

export default function SpaceSelector() {
    const { t } = useLanguage();
    const { currentSpace, spaces, setSpace, refreshSpaces, isLoading } = useSpace();
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [newSpaceName, setNewSpaceName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSuccess = (newSpace: any) => {
        refreshSpaces();
        setSpace(newSpace);
        setIsOpen(false);
    };

    const handleDeleteSpace = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (confirm(`${t("Delete Space")} "${name}"?`)) {
            try {
                await api.deleteSpace(id);
                refreshSpaces();
                if (currentSpace?.id === id) {
                    setSpace(null as any); // Force clear if deleted
                }
            } catch (e) {
                alert(t("Failed to delete space"));
            }
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
                    {currentSpace?.name || t("Select Space...")}
                </div>
                <svg className="w-4 h-4 ml-2 -mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
                    <div className="py-1">
                        {spaces.map((space) => (
                            <div key={space.id} className="flex items-center justify-between w-full hover:bg-slate-50 group">
                                <button
                                    onClick={() => {
                                        setSpace(space);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center flex-grow px-4 py-2 text-sm text-left ${currentSpace?.id === space.id ? 'bg-slate-100 text-slate-900 ring-1 ring-indigo-500' : 'text-slate-700'}`}
                                >
                                    <span className="w-2 h-2 mr-2 rounded-full" style={{ backgroundColor: space.color || '#cbd5e1' }}></span>
                                    {space.name}
                                </button>
                                <button
                                    onClick={(e) => handleDeleteSpace(e, space.id, space.name)}
                                    className="px-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title={t("Delete Space")}
                                >
                                    🗑️
                                </button>
                            </div>

                        ))}
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-indigo-600 hover:bg-slate-50"
                        >
                            + {t("New Space")}
                        </button>
                    </div>
                </div>
            )}

            <CreateSpaceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
