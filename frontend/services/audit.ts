import { api } from "./api"
import { AuditLog, VectorStats, EntropyStats, SystemCounts } from "@/types/audit"

export const auditService = {
    getLogs: async (limit: number = 50) => {
        return api.get<AuditLog[]>("/audit/logs", { params: { limit } })
    },

    getVectorStats: async () => {
        return api.get<VectorStats>("/stats/vectors")
    },

    getEntropyStats: async () => {
        return api.get<EntropyStats>("/stats/entropy")
    },

    getSystemCounts: async () => {
        return api.get<SystemCounts>("/stats/counts")
    }
}
