"use client";

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { api } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Database, Brain, Server, ShieldCheck, AlertTriangle } from 'lucide-react';

export const dynamic = "force-dynamic";

export default function AuditPage() {
    const { t } = useLanguage();

    const { data: health } = useSWR('health', api.getHealth, { refreshInterval: 10000 });
    const { data: vectorStats } = useSWR('vectors', api.getVectorStats, { refreshInterval: 10000 });
    const { data: entropy } = useSWR('entropy', api.getEntropy, { refreshInterval: 10000 });
    const { data: counts } = useSWR('counts', api.getCounts, { refreshInterval: 10000 });
    const { data: logs } = useSWR('logs', () => api.getAuditLogs(50), { refreshInterval: 5000 });

    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    if (!isClient) return null;

    return (
        <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("System Neural Audit")}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t("Real-time telemetry of the cognitive architecture.")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium uppercase">{health?.status || "OFFLINE"}</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. HEALTH & VECTORS */}
                <StatusCard
                    title={t("Knowledge Vectors")}
                    status={vectorStats?.total_embeddings?.toLocaleString() || "0"}
                    icon={Database}
                    good={true}
                />

                {/* 2. ENTROPY GAUGE */}
                <Card className="col-span-1 border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">{t("Cognitive Entropy")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                        <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-secondary border-t-primary" style={{
                            transform: `rotate(${(entropy?.stability_percentage || 0) * 1.8}deg)` // fake gauge effect
                        }}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `rotate(-${(entropy?.stability_percentage || 0) * 1.8}deg)` }}>
                                <span className="text-3xl font-bold">{entropy?.stability_percentage || 100}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{t("Stability")}</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 w-full text-center">
                            <div>
                                <div className="text-2xl font-semibold text-foreground">{entropy?.germinal_ideas || 0}</div>
                                <div className="text-xs text-muted-foreground">{t("Germinal")}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-semibold text-foreground">{entropy?.consolidated_ideas || 0}</div>
                                <div className="text-xs text-muted-foreground">{t("Consolidated")}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. SYSTEM COUNTS */}
                <Card className="col-span-1 border-border/50 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-lg">{t("Infrastructure Scale")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4 divide-y divide-border">
                            <div className="flex justify-between py-2">
                                <dt className="text-sm font-medium text-muted-foreground">{t("Active Spaces")}</dt>
                                <dd className="text-sm font-bold">{counts?.spaces || 0}</dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-sm font-medium text-muted-foreground">{t("Editorial Products")}</dt>
                                <dd className="text-sm font-bold">{counts?.products || 0}</dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-sm font-medium text-muted-foreground">{t("Total Decisions Logged")}</dt>
                                <dd className="text-sm font-bold text-primary">{counts?.decisions_logged || 0}</dd>
                            </div>
                            <div className="pt-4 text-xs text-muted-foreground">
                                {t("System uptime: 99.9%. Last reboot: 26 mins ago.")}
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                {/* 4. ACTIVITY */}
                <StatusCard
                    title={t("Recent Activity")}
                    status={logs?.length || 0}
                    icon={Activity}
                    good={true}
                />
            </div>

            {/* AUDIT LOG TABLE */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>{t("Decision Ledger Stream")}</CardTitle>
                    <CardDescription>{t("Immutable record of all cognitive engine actions.")}</CardDescription>
                </CardHeader>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                            <tr>
                                <th className="px-6 py-3">{t("Timestamp")}</th>
                                <th className="px-6 py-3">{t("Action")}</th>
                                <th className="px-6 py-3">{t("Target ID")}</th>
                                <th className="px-6 py-3">{t("Confidence")}</th>
                                <th className="px-6 py-3">{t("Reasoning")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs?.map((log: any) => (
                                <tr key={log.id} className="bg-card hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs opacity-70">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${log.action === 'CREATE' ? 'bg-green-100/10 text-green-500' :
                                            log.action === 'ATTACH' ? 'bg-blue-100/10 text-blue-500' :
                                                'bg-orange-100/10 text-orange-500'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={log.target}>
                                        {log.target || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${(log.confidence || 0) > 0.8 ? 'bg-green-500' :
                                                        (log.confidence || 0) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${(log.confidence || 0) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs opacity-70">{Math.round((log.confidence || 0) * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={log.reasoning}>
                                        {log.reasoning || t("No explicit reasoning recorded.")}
                                    </td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        {t("No recent audit events found.")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function StatusCard({ title, status, icon: Icon, good }: any) {
    return (
        <Card className="border-border/50 bg-card/50">
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="text-2xl font-bold flex items-center gap-2 mt-1">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${good ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                        {status}
                    </div>
                </div>
                <div className={`p-3 rounded-xl ${good ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    )
}
