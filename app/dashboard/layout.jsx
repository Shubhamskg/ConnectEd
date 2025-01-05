// app/dashboard/layout.jsx
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}