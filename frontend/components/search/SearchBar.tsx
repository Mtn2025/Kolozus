"use client"

import { useDebouncedCallback } from "use-debounce"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SearchBarProps {
    onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
    const [value, setValue] = useState("")

    const debounced = useDebouncedCallback((query: string) => {
        onSearch(query)
    }, 400) // 400ms debounce

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue(val)
        debounced(val)
    }

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Busca ideas, fragmentos o conceptos..."
                className="pl-9"
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}
