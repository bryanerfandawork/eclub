import { getAccount, getFeatures, getSettings } from "@/lib/plans";
import { FeaturesForm } from "./features-form";
import { QrisForm } from "./qris-form";

export const metadata = { title: "Admin · Paket" };

export default async function AdminPlans() {
  const [features, settings, account] = await Promise.all([getFeatures(), getSettings(), getAccount()]);
  return (
    <>
      {account.role === "super_admin" && <QrisForm current={String(settings.qris_image_url ?? "")} />}
      <FeaturesForm features={features} settings={settings} canEdit={account.role === "super_admin"} />
    </>
  );
}
