import React, { createContext, useContext, useState } from "react";

type Toast = { id: number; type: "error" | "success"; title?: string; message: string; };
type Ctx = { push: (t: Omit<Toast, "id">) => void; };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  function push(t: Omit<Toast, "id">) {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter(i => i.id !== id)), 5000);
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toaster">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div style={{fontWeight:600, marginBottom: 4}}>{t.title || (t.type === "error" ? "Ошибка" : "Готово")}</div>
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
