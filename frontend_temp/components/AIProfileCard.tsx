import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, Sparkles, Shield, GraduationCap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIModelConfig {
    provider: string;
    model_name: string;
}

interface AIProfile {
    name: string;
    blueprinter: AIModelConfig;
    drafter: AIModelConfig;
    summarizer: AIModelConfig;
    embedding: AIModelConfig;
}

interface AIProfileCardProps {
    profileKey: string;
    title: string;
    description: string;
    isActive: boolean;
    config?: AIProfile;
    onSelect: (key: string) => void;
}

const ICONS: Record<string, LucideIcon> = {
    maestro: GraduationCap,
    spark: Sparkles,
    guardian: Shield,
    custom: Settings
};

const COLORS: Record<string, string> = {
    maestro: "border-purple-500/50 bg-purple-500/5",
    spark: "border-yellow-500/50 bg-yellow-500/5",
    guardian: "border-green-500/50 bg-green-500/5",
    custom: "border-gray-500/50 bg-gray-500/5"
};

export const AIProfileCard: React.FC<AIProfileCardProps> = ({
    profileKey,
    title,
    description,
    isActive,
    onSelect
}) => {
    const Icon = ICONS[profileKey] || Settings;
    const activeClass = isActive ? `ring-2 ring-primary ${COLORS[profileKey] || ""}` : "hover:border-primary/50 cursor-pointer";

    return (
        <Card
            className={cn("transition-all relative overflow-hidden", activeClass)}
            onClick={() => onSelect(profileKey)}
        >
            {isActive && (
                <div className="absolute top-0 right-0 p-2">
                    <Badge variant="default" className="bg-primary text-primary-foreground">Active</Badge>
                </div>
            )}
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className={cn("p-2 rounded-lg", isActive ? "bg-background/50" : "bg-muted")}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
};
