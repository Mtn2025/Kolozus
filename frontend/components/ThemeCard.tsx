import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeDef } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemeCardProps {
    theme: ThemeDef;
    isActive: boolean;
    onSelect: (key: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
    theme,
    isActive,
    onSelect
}) => {
    return (
        <Card
            className={cn(
                "cursor-pointer transition-all relative overflow-hidden h-full flex flex-col",
                isActive ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
            )}
            onClick={() => onSelect(theme.key)}
        >
            {isActive && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 z-10">
                    <Check className="w-3 h-3" />
                </div>
            )}

            {/* Visual Preview */}
            <div className={`h-24 w-full ${theme.colors.bg} relative border-b`}>
                <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className={`w-8 h-8 rounded-md shadow-sm ${theme.colors.primary}`}></div>
                    <div className={`w-8 h-8 rounded-md shadow-sm bg-white border`}></div>
                    <div className={`w-8 h-8 rounded-md shadow-sm bg-slate-900 border`}></div>
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-base">{theme.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{theme.description}</CardDescription>
            </CardHeader>
        </Card>
    );
};
