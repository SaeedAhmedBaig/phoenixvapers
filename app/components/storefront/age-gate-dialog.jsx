"use client";

import { useState } from "react";
import { ShieldAlert, UserCheck } from "lucide-react";
import { useAge } from "../../lib/store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export function AgeGateDialog() {
  const { verified, ready, confirm } = useAge();
  const [declined, setDeclined] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!ready || verified) return null;

  async function onConfirm() {
    setConfirming(true);
    try {
      await confirm();
    } finally {
      setConfirming(false);
    }
  }

  return (
    <Dialog open modal>
      <DialogContent showClose={false} className="max-w-sm p-0">
        <div className="bg-surface-dark px-6 py-8 text-center text-surface-dark-foreground">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-white/10">
            <UserCheck className="h-7 w-7" />
          </span>
          <DialogHeader className="mt-4 p-0">
            <DialogTitle className="text-center text-surface-dark-foreground">Are you 18 or over?</DialogTitle>
            <DialogDescription className="text-center text-surface-dark-muted">
              Phoenix Vapers sells age-restricted nicotine products. Confirm your age to enter the shop.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          {declined ? (
            <div className="rounded-3xl bg-secondary p-5 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
              <p className="mt-3 text-sm font-bold leading-6 text-foreground">
                You must be 18 or over to shop with Phoenix Vapers. Please close this page.
              </p>
              <Button variant="link" className="mt-3" onClick={() => setDeclined(false)}>
                Go back
              </Button>
            </div>
          ) : (
            <DialogFooter className="p-0">
              <Button className="w-full" onClick={onConfirm} disabled={confirming}>
                {confirming ? "Confirming…" : "Yes, I am 18 or over"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setDeclined(true)}>
                No, I am under 18
              </Button>
              <p className="mt-1 text-center text-xs leading-5 text-muted-foreground">
                Nicotine is addictive. Entering confirms you are a UK adult and agree to our age policy.
              </p>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
