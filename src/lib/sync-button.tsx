"use client";

import { DarkButton, PrimaryButton } from "./shared/button";
import { sync } from "@/app/sync/actions";
import { useModal, Modal } from "./modal";

export function SyncButton() {
  const { modalRef } = useModal();

  return (
    <>
      <DarkButton onClick={() => modalRef.current?.showModal()}>
        Sync
      </DarkButton>
      <Modal ref={modalRef}>
        <h3 className="text-xl font-bold">Would you like to sync?</h3>
        <p className="pr-8 text-sm leading-6">
          After providing temporary elevated permission, Supapaused scans your
          inbox for email{" "}
          <span className="text-sm px-1 py-0.5 rounded bg-inky border border-zinc-600 font-mono">
            from:ant@supabase.io
          </span>
          .
        </p>
        <form className="flex justify-end space-x-2">
          <DarkButton type="button" onClick={() => modalRef.current?.close()}>
            Cancel
          </DarkButton>
          <PrimaryButton formAction={sync}>Proceed</PrimaryButton>
        </form>
      </Modal>
    </>
  );
}
