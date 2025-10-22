import { useEffect, useState } from 'react';
import { create } from 'zustand';

export interface AiOperation {
  id: string;
  type: 'creating' | 'editing' | 'deleting' | 'analyzing';
  target: string; // file path or name
  content?: string;
  progress: number; // 0-100
  timestamp: number;
}

interface AiOperationStore {
  operations: AiOperation[];
  addOperation: (op: Omit<AiOperation, 'id' | 'timestamp'>) => string;
  updateOperation: (id: string, updates: Partial<AiOperation>) => void;
  removeOperation: (id: string) => void;
  clearOperations: () => void;
}

export const useAiOperationStore = create<AiOperationStore>((set) => ({
  operations: [],
  addOperation: (op) => {
    const id = `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const operation: AiOperation = {
      ...op,
      id,
      timestamp: Date.now(),
    };
    set((state) => ({
      operations: [...state.operations, operation],
    }));
    return id;
  },
  updateOperation: (id, updates) => {
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op
      ),
    }));
  },
  removeOperation: (id) => {
    set((state) => ({
      operations: state.operations.filter((op) => op.id !== id),
    }));
  },
  clearOperations: () => {
    set({ operations: [] });
  },
}));

// Hook to track AI operations
export const useAiOperations = () => {
  const { operations, addOperation, updateOperation, removeOperation } = useAiOperationStore();

  const startOperation = (type: AiOperation['type'], target: string, content?: string) => {
    return addOperation({ type, target, content, progress: 0 });
  };

  const completeOperation = (id: string) => {
    updateOperation(id, { progress: 100 });
    setTimeout(() => removeOperation(id), 2000); // Remove after 2s
  };

  return {
    operations,
    startOperation,
    updateOperation,
    completeOperation,
    removeOperation,
  };
};