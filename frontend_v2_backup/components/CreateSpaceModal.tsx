"use client";

import { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { api } from "@/app/lib/api";

interface CreateSpaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newSpace: any) => void;
}

export default function CreateSpaceModal({ isOpen, onClose, onSuccess }: CreateSpaceModalProps) {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const newSpace = await api.createSpace(name, description);
            onSuccess(newSpace);
            setName("");
            setDescription("");
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(t("Failed to create space"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">{t("New Space")}</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">{t("Space Name")}</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("e.g., Personal Knowledge")}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">{t("Description")} ({t("Optional")})</label>
                        <textarea
                            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("What is this space for?")}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? t("Creating...") : t("Create Space")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
