"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wallet, X } from "lucide-react";
import { useEffect } from "react";
import {
  useDiscoveredWallets,
  type EIP6963ProviderDetail,
} from "../lib/wallet-discovery";
import { cn } from "../lib/utils";

export function WalletPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (detail: EIP6963ProviderDetail) => void;
}) {
  const wallets = useDiscoveredWallets();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative w-full max-w-md glass-strong rounded-2xl p-5 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Choose a wallet"
          >
            <header className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-zinc-100">
                  Connect a wallet
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pick the wallet you want to use with DeleGate. Only wallets you've
                  installed will appear.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="mt-4 flex flex-col gap-2">
              {wallets.length === 0 ? <NoWalletsCard /> : null}
              {wallets.map((w) => (
                <WalletRow key={w.info.uuid} detail={w} onPick={onPick} />
              ))}
            </div>

            <footer className="mt-5 text-[10px] text-zinc-600 font-mono uppercase tracking-[0.18em]">
              EIP-6963 multi-wallet discovery
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function WalletRow({
  detail,
  onPick,
}: {
  detail: EIP6963ProviderDetail;
  onPick: (detail: EIP6963ProviderDetail) => void;
}) {
  const isMetaMask = detail.info.rdns === "io.metamask";
  return (
    <motion.button
      onClick={() => onPick(detail)}
      whileHover={{ x: 1, scale: 1.005 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5",
        "hover:bg-white/[0.05] hover:border-white/15 transition-colors text-left",
      )}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={detail.info.icon} alt={detail.info.name} className="h-9 w-9 object-contain" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-zinc-100 truncate">
          {detail.info.name}
        </span>
        <span className="block text-[10px] text-zinc-500 font-mono truncate">
          {detail.info.rdns}
        </span>
      </span>
      {isMetaMask ? (
        <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
          recommended
        </span>
      ) : null}
    </motion.button>
  );
}

function NoWalletsCard() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
      <Wallet className="h-5 w-5 mx-auto mb-2 text-zinc-600" />
      No EIP-6963 wallets detected. Install{" "}
      <a
        href="https://metamask.io/download"
        target="_blank"
        rel="noopener noreferrer"
        className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
      >
        MetaMask
      </a>{" "}
      and reload.
    </div>
  );
}
