"use client";

import useSWR from "swr";
import Link from "next/link";
import { GraphNode } from "./lib/types";
import { useSpace } from "./lib/SpaceContext";
import { useLanguage } from "./context/LanguageContext";
import { api } from "./lib/api";

const fetcher = ([key, spaceId]: [string, string | undefined]) => api.getKnowledgeGraph(spaceId);

export default function Dashboard() {
  const { currentSpace } = useSpace();

  const { data: nodes = [], error, isLoading } = useSWR(
    ["knowledge-graph", currentSpace?.id],
    ([url, id]) => api.getKnowledgeGraph(id),
    {
      refreshInterval: 5000,
      fallbackData: []
    }
  );

  const loading = isLoading;

  const stats = {
    total: nodes.length,
    germinal: nodes.filter(n => n.status === "germinal").length,
    exploration: nodes.filter(n => n.status === "exploration").length,
    consolidated: nodes.filter(n => n.status === "consolidated").length
  };

  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
            {t("Knowledge Overview")}
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            {t("Real-time insight into cognitive fragments and evolutionary states.")}
          </p>
          <div className="mt-2 text-xs text-foreground/40">
            {t("Context: ")} {currentSpace?.name || t("Global")}
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/ingest" className="ml-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            {t("Inject Knowledge")}
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-secondary/50 px-4 py-5 shadow sm:p-6 border border-border">
          <dt className="truncate text-sm font-medium text-foreground/70">{t("Total Fragments")}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{stats.total}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-secondary/50 px-4 py-5 shadow sm:p-6 border border-border">
          <dt className="truncate text-sm font-medium text-foreground/70">{t("In Exploration")}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-primary">{stats.exploration}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-secondary/50 px-4 py-5 shadow sm:p-6 border border-border">
          <dt className="truncate text-sm font-medium text-foreground/70">{t("Germinal State")}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{stats.germinal}</dd>
        </div>
      </dl>

      {/* RECENT IDEAS TABLE / GRID */}
      <div className="bg-secondary/30 shadow sm:rounded-lg border border-border">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold leading-6 text-foreground">{t("Active Entities")}</h3>
            <Link href="/library" className="text-sm font-semibold text-primary hover:text-primary/80">
              {t("View all entities")}
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-foreground/50">{t("Loading ecosystem...")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodes.slice(0, 6).map(node => (
                <Link key={node.id} href={`/idea/${node.id}`} className="block group">
                  <div className="relative flex items-center space-x-3 rounded-lg border border-border bg-background px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:border-primary/50 hover:bg-secondary/50 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <div className="flex justify-between items-center mb-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${node.status === 'germinal' ? 'bg-secondary text-foreground/70 ring-border' :
                            node.status === 'exploration' ? 'bg-primary/10 text-primary ring-primary/20' :
                              'bg-green-500/10 text-green-600 ring-green-500/20'
                            }`}>
                            {node.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                          {node.label || t("Untitled Idea")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
