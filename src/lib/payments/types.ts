/** Mutasi uang masuk yang sudah dinormalisasi, apa pun penyedia pembayarannya. */
export type IncomingPayment = { ref: string; amount: number; raw: unknown };

/** Kontrak penyedia pembayaran, supaya Moota bisa diganti/ditambah (mis. Midtrans, Xendit) tanpa mengubah logika pesanan. */
export interface PaymentProvider {
  name: string;
  verify(rawBody: string, headers: Headers): boolean;
  parse(rawBody: string): IncomingPayment[];
}
