export interface Bill {
  id: string;
  creator: string;
  type: string;
  sku: string;
  orderId: string;
  displayName: string;
  displayAmount: string;
  amount: number;
  currency: string;
  created: string;
}
