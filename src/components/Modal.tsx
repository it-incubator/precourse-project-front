import React from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children, footer }: Props) {
  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e)=>e.stopPropagation()}>
        {title && <h3 style={{marginTop:0}}>{title}</h3>}
        <div className="gap">{children}</div>
        {footer && <div className="footer-actions">{footer}</div>}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
}
