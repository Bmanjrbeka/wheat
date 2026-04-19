import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to dashboard for Wheat-Guard
  redirect("/dashboard");
}
