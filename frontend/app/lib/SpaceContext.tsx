"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, Space } from "@/app/lib/api";

interface SpaceContextType {
    currentSpace: Space | null;
    spaces: Space[];
    setSpace: (space: Space | null) => void;
    refreshSpaces: () => void;
    isLoading: boolean;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: ReactNode }) {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadSpaces = () => {
        setIsLoading(true);
        api.getSpaces()
            .then(data => {
                setSpaces(data);

                // Try to load saved space from localStorage
                const savedId = localStorage.getItem("kolozus_space_id");
                if (savedId) {
                    const found = data.find(s => s.id === savedId);
                    if (found) setCurrentSpace(found);
                    else setCurrentSpace(data.find(s => s.name === "General") || data[0] || null);
                } else {
                    // Default to General
                    const general = data.find(s => s.name === "General");
                    if (general) {
                        setCurrentSpace(general);
                        localStorage.setItem("kolozus_space_id", general.id);
                    }
                }
            })
            .catch(err => console.error("Failed to load spaces", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        loadSpaces();
    }, []);

    const setSpace = (space: Space | null) => {
        setCurrentSpace(space);
        if (space) {
            localStorage.setItem("kolozus_space_id", space.id);
        } else {
            localStorage.removeItem("kolozus_space_id");
        }
    };

    return (
        <SpaceContext.Provider value={{ currentSpace, spaces, setSpace, refreshSpaces: loadSpaces, isLoading }}>
            {children}
        </SpaceContext.Provider>
    );
}

export function useSpace() {
    const context = useContext(SpaceContext);
    if (context === undefined) {
        throw new Error("useSpace must be used within a SpaceProvider");
    }
    return context;
}
