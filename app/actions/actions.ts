"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.date(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, status, amount } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    status: formData.get("status"),
    amount: formData.get("amount"),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    INSERT INTO invoices (customer_Id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return { message: "Database Error: failed to create invoice" };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, status, amount } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    status: formData.get("status"),
    amount: formData.get("amount"),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
  
    UPDATE invoices
    SET customer_id = ${customerId}, amount=${amount}, status=${status}
    WHERE id = ${id}

  `;
  } catch (error) {
    return { message: "Database Error: Failed to update Invoice" };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  throw new Error("testing errord");

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");
  } catch (error) {
    return { message: "Database Error: failed to delete invoice" };
  }
}
