"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const paymentRecordSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.enum(["cash", "bank_transfer", "other"]),
  payment_date: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentRecordValues = z.infer<typeof paymentRecordSchema>;

interface PaymentRecordModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: number;
  invoiceAmount: number;
  onSubmit: (data: PaymentRecordValues) => void;
}

export function PaymentRecordModal({
  open,
  onClose,
  invoiceId,
  invoiceAmount,
  onSubmit,
}: PaymentRecordModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentRecordValues>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      amount: invoiceAmount.toString(),
      payment_method: "cash",
      payment_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleFormSubmit = (data: PaymentRecordValues) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETB)</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount")}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-xs text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              defaultValue="cash"
              onValueChange={(value) => setValue("payment_method", value as any)}
            >
              <SelectTrigger className={errors.payment_method ? "border-red-500" : ""}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-xs text-red-600">{errors.payment_method.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              {...register("payment_date")}
              className={errors.payment_date ? "border-red-500" : ""}
            />
            {errors.payment_date && (
              <p className="text-xs text-red-600">{errors.payment_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" {...register("notes")} placeholder="Payment reference or notes" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#2563eb] hover:bg-[#1d4ed8]">
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
