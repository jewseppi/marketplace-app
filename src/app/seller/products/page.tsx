import { listSellerProducts } from "@/db";
import { SellerProductsClient } from "./products-client";

export default function SellerProductsPage() {
  return <SellerProductsClient initialProducts={listSellerProducts()} />;
}
