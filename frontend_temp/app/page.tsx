"use client";

import useSWR from "swr";
import Link from "next/link";
import { GraphNode } from "./lib/types";
import { useSpace } from "./lib/SpaceContext";
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

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Knowledge Overview
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time insight into cognitive fragments and evolutionary states.
          </p>
          <div className="mt-2 text-xs text-slate-400">
             Context: {currentSpace?.name || "Global"}
          </div>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link href="/ingest" className="ml-3 inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600">
            Inject Knowledge
          </Link>
        </div>
      </div>

      {/* STATS GRID */}
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Total Fragments</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{stats.total}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">In Exploration</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">{stats.exploration}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Germinal State</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{stats.germinal}</dd>
        </div>
      </dl>

      {/* RECENT IDEAS TABLE / GRID */}
      <div className="bg-white shadow sm:rounded-lg border border-slate-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Active Entities</h3>
            <Link href="/library" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
              View all entities
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading ecosystem...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodes.slice(0, 6).map(node => (
                <Link key={node.id} href={`/idea/${node.id}`} className="block group">
                  <div className="relative flex items-center space-x-3 rounded-lg border border-slate-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-slate-400 hover:bg-slate-50 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <div className="flex justify-between items-center mb-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${node.status === 'germinal' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                            node.status === 'exploration' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                              'bg-green-50 text-green-700 ring-green-600/20'
                            }`}>
                            {node.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-relaxed">
                          {node.label || "Untitled Idea"}
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
