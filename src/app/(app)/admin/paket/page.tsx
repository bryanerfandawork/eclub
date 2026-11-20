import { getAccount, getFeatures, getSettings } from "@/lib/plans";
import { FeaturesForm } from "./features-form";

export const metadata = { title: "Admin · Paket" };

export default async function AdminPlans() {
  const [features, settings, account] = await Promise.all([getFeatures(), getSettings(), getAccount()]);
  return <FeaturesForm features={features} settings={settings} canEdit={account.role === "super_admin"} />;
}
