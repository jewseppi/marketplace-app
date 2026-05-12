import { listOrderDetails } from "@/db";
import { SellerOrdersClient } from "./orders-client";

export default function SellerOrdersPage() {
  return <SellerOrdersClient initialOrders={listOrderDetails()} />;
}
