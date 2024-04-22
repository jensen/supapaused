"use client";

import { useEffect, useRef, forwardRef, PropsWithChildren } from "react";

export function useModal() {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (modalRef.current === null) return;

    const modal = modalRef.current;

    const click = (event: MouseEvent) => {
      const rect = modal.getBoundingClientRect();
      if (
        !(
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        )
      ) {
        modalRef.current?.close();
      }
    };

    modal.addEventListener("click", click);

    return () => {
      modal.removeEventListener("click", click);
    };
  }, []);

  return {
    modalRef,
  };
}

interface ModalProps extends PropsWithChildren {}

export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  props,
  ref
) {
  return (
    <dialog
      ref={ref}
      className="absolute max-w-2xl w-1/2 inset-1/2 -translate-y-1/2 -translate-x-1/2 bg-transparent"
    >
      <div className="px-8 py-8 space-y-4 flex flex-col text-zinc-200 bg-zinc-800 border border-zinc-900 rounded-xl shadow-button">
        {props.children}
      </div>
    </dialog>
  );
});
