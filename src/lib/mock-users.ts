export type UserRole = "seller" | "admin" | "buyer";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "suspended";
};

export const DEFAULT_MOCK_USERS: MockUser[] = [
  {
    id: "user-seller-1",
    name: "Atelier Seller",
    email: "seller@cryptocouture.test",
    role: "seller",
    status: "active",
  },
  {
    id: "user-admin-1",
    name: "Platform Admin",
    email: "admin@cryptocouture.test",
    role: "admin",
    status: "active",
  },
  {
    id: "user-buyer-1",
    name: "VIP Buyer",
    email: "buyer@cryptocouture.test",
    role: "buyer",
    status: "active",
  },
  {
    id: "user-buyer-2",
    name: "Waitlist Buyer",
    email: "waitlist@cryptocouture.test",
    role: "buyer",
    status: "suspended",
  },
];
