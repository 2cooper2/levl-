"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VerificationProcess } from "@/components/verification/verification-process"
import type { VerificationLevel } from "@/components/ui/verification-badge"

interface VerificationModalProps {
  userId: string
  currentLevel?: VerificationLevel | null
  trigger?: React.ReactNode
  onComplete?: (level: VerificationLevel) => void
}

export function VerificationModal({ userId, currentLevel = null, trigger, onComplete }: VerificationModalProps) {
  const [open, setOpen] = useState(false)

  const handleComplete = (level: VerificationLevel) => {
    onComplete?.(level)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Get Verified</Button>}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verification Center</DialogTitle>
          <DialogDescription>Complete the verification process to build trust and credibility</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <VerificationProcess userId={userId} currentLevel={currentLevel} onComplete={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
