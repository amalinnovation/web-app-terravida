"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { lots, type Lot } from "@/data/lots";
import { findLot } from "@/lib/lots";

type LotSelection = { selectedLot: Lot; selectLot: (id: string) => void };

const LotSelectionContext = createContext<LotSelection | null>(null);

export function LotSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedLot, setSelectedLot] = useState<Lot>(lots[0]);

  const selectLot = useCallback((id: string) => {
    const lot = findLot(id);
    if (lot) setSelectedLot(lot);
  }, []);

  const value = useMemo(() => ({ selectedLot, selectLot }), [selectedLot, selectLot]);

  return <LotSelectionContext.Provider value={value}>{children}</LotSelectionContext.Provider>;
}

export function useLotSelection(): LotSelection {
  const context = useContext(LotSelectionContext);
  if (!context) throw new Error("useLotSelection debe usarse dentro de LotSelectionProvider");
  return context;
}
