"use client";

import React, { createContext, useContext, useReducer, type ReactNode } from "react";
import {
    type Doctor,
    type Company,
    type AnnotationBatch,
    type Annotation,
    mockDoctors as initialDoctors,
    mockCompanies as initialCompanies,
    mockBatches as initialBatches,
    mockActivityFeed as initialFeed,
} from "./mock-data";

/* ────────────────────────────── Types ────────────────────────────── */

export interface ActivityItem {
    type: string;
    message: string;
    time: string;
    amount?: string;
}

export interface MLModel {
    id: string;
    name: string;
    batchId: string;
    status: "queued" | "training" | "completed" | "failed";
    accuracy?: number;
    epoch?: number;
    totalEpochs: number;
    createdAt: string;
    architecture: string;
    metrics?: any; // Final SSE response object containing precision/recall/confusion/chart_data
}

interface AppState {
    doctors: Doctor[];
    companies: Company[];
    batches: AnnotationBatch[];
    activityFeed: ActivityItem[];
    annotations: Record<string, Annotation[]>; // batchId→annotations
    models: MLModel[];
    escrowBalances: Record<string, number>; // batchId→locked USDC
}

type Action =
    | { type: "ADD_BATCH"; batch: AnnotationBatch }
    | { type: "ACCEPT_BATCH"; batchId: string; doctorId: string }
    | { type: "SUBMIT_ANNOTATION"; batchId: string; annotation: Annotation; doctorId: string; hash: string }
    | { type: "RELEASE_PAYMENT"; batchId: string }
    | { type: "FUND_ESCROW"; batchId: string; amount: number }
    | { type: "APPROVE_DOCTOR"; doctorId: string }
    | { type: "ADD_ACTIVITY"; item: ActivityItem }
    | { type: "START_TRAINING"; model: MLModel }
    | { type: "COMPLETE_BATCH"; batchId: string }
    | { type: "UPDATE_MODEL"; modelId: string; updates: Partial<MLModel> };

/* ────────────────────────────── Initial ────────────────────────────── */

const initialState: AppState = {
    doctors: initialDoctors,
    companies: initialCompanies,
    batches: initialBatches,
    activityFeed: initialFeed,
    annotations: {},
    models: [],
    escrowBalances: {
        "batch-1": 125.0,
        "batch-2": 90.0,
    },
};

/* ────────────────────────────── Reducer ────────────────────────────── */

function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "ADD_BATCH": {
            const now = new Date();
            return {
                ...state,
                batches: [action.batch, ...state.batches],
                activityFeed: [
                    {
                        type: "batch",
                        message: `New batch uploaded: ${action.batch.title}`,
                        time: "Just now",
                        amount: `$${action.batch.totalBudget.toFixed(2)}`,
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "ACCEPT_BATCH": {
            return {
                ...state,
                batches: state.batches.map((b) =>
                    b.id === action.batchId
                        ? {
                            ...b,
                            status: b.status === "open" ? "in_progress" : b.status,
                            assignedDoctors: [...b.assignedDoctors, action.doctorId],
                        }
                        : b
                ),
                activityFeed: [
                    {
                        type: "batch",
                        message: `Batch accepted by ${state.doctors.find((d) => d.id === action.doctorId)?.name || "Doctor"}`,
                        time: "Just now",
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "COMPLETE_BATCH": {
            const batch = state.batches.find((b) => b.id === action.batchId);
            return {
                ...state,
                batches: state.batches.map((b) =>
                    b.id === action.batchId ? { ...b, status: "completed" } : b
                ),
                activityFeed: [
                    {
                        type: "batch",
                        message: `Batch completed: ${batch?.title}`,
                        time: "Just now",
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "SUBMIT_ANNOTATION": {
            const batch = state.batches.find((b) => b.id === action.batchId);
            const reward = batch ? batch.rewardPerImage : 0;
            return {
                ...state,
                batches: state.batches.map((b) =>
                    b.id === action.batchId
                        ? {
                            ...b,
                            annotatedImages: b.annotatedImages + 1,
                            assignedDoctors: b.assignedDoctors.includes(action.doctorId)
                                ? b.assignedDoctors
                                : [...b.assignedDoctors, action.doctorId]
                        }
                        : b
                ),
                annotations: {
                    ...state.annotations,
                    [action.batchId]: [
                        ...(state.annotations[action.batchId] || []),
                        action.annotation,
                    ],
                },
                doctors: state.doctors.map((d) =>
                    d.id === action.doctorId
                        ? {
                            ...d,
                            annotationCount: d.annotationCount + 1,
                            earnings: d.earnings + reward,
                        }
                        : d
                ),
                activityFeed: [
                    {
                        type: "annotation",
                        message: `Annotation hash committed: ${action.hash.slice(0, 18)}…`,
                        time: "Just now",
                        amount: `+$${reward.toFixed(2)}`,
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "RELEASE_PAYMENT": {
            const batch = state.batches.find((b) => b.id === action.batchId);
            if (!batch) return state;
            const escrowAmount = state.escrowBalances[action.batchId] || batch.totalBudget;
            const doctorShare = escrowAmount * 0.9;
            const numDoctors = batch.assignedDoctors.length || 1;
            const perDoctor = doctorShare / numDoctors;

            return {
                ...state,
                batches: state.batches.map((b) =>
                    b.id === action.batchId ? { ...b, status: "paid" } : b
                ),
                escrowBalances: {
                    ...state.escrowBalances,
                    [action.batchId]: 0,
                },
                doctors: state.doctors.map((d) =>
                    batch.assignedDoctors.includes(d.id)
                        ? {
                            ...d,
                            earnings: d.earnings + perDoctor,
                            reputationScore: Math.min(100, d.reputationScore + 2),
                        }
                        : d
                ),
                companies: state.companies.map((c) =>
                    c.id === batch.companyId
                        ? { ...c, totalSpent: c.totalSpent + escrowAmount }
                        : c
                ),
                activityFeed: [
                    {
                        type: "payment",
                        message: `Payment released for ${batch.title}: $${doctorShare.toFixed(2)} to ${numDoctors} annotator(s)`,
                        time: "Just now",
                        amount: `$${escrowAmount.toFixed(2)}`,
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "FUND_ESCROW": {
            return {
                ...state,
                escrowBalances: {
                    ...state.escrowBalances,
                    [action.batchId]: (state.escrowBalances[action.batchId] || 0) + action.amount,
                },
                activityFeed: [
                    {
                        type: "deposit",
                        message: `Escrow funded: $${action.amount.toFixed(2)} USDC locked`,
                        time: "Just now",
                        amount: `$${action.amount.toFixed(2)}`,
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "APPROVE_DOCTOR": {
            return {
                ...state,
                doctors: state.doctors.map((d) =>
                    d.id === action.doctorId ? { ...d, verified: true } : d
                ),
                activityFeed: [
                    {
                        type: "sbt",
                        message: `SBT minted: ${state.doctors.find((d) => d.id === action.doctorId)?.name || "Doctor"} verified`,
                        time: "Just now",
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "ADD_ACTIVITY": {
            return {
                ...state,
                activityFeed: [action.item, ...state.activityFeed],
            };
        }

        case "START_TRAINING": {
            return {
                ...state,
                models: [...state.models, action.model],
                activityFeed: [
                    {
                        type: "model",
                        message: `ML model training started: ${action.model.name}`,
                        time: "Just now",
                    },
                    ...state.activityFeed,
                ],
            };
        }

        case "UPDATE_MODEL": {
            return {
                ...state,
                models: state.models.map((m) =>
                    m.id === action.modelId ? { ...m, ...action.updates } : m
                ),
            };
        }

        default:
            return state;
    }
}

/* ────────────────────────────── Context ────────────────────────────── */

const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppStore() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
    return ctx;
}
