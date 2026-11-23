import { getAccount, getFeatures, getSettings } from "@/lib/plans";
import { FeaturesForm } from "./features-form";
import { QrisForm } from "./qris-form";
import { BrandForm } from "./brand-form";
import { WaStatus } from "./wa-status";
import { AssistantForm } from "./assistant-form";
import { assistantConfig } from "@/lib/assistant-config";

export const metadata = { title: "Admin · Paket" };

export default async function AdminPlans() {
  const [features, settings, account] = await Promise.all([getFeatures(), getSettings(), getAccount()]);
  return (
    <>
      {account.role === "super_admin" && (
        <WaStatus
          env={[
            { label: "FONNTE_TOKEN", ok: !!process.env.FONNTE_TOKEN },
            { label: "CRON_SECRET", ok: !!process.env.CRON_SECRET },
            { label: "SUPABASE_SERVICE_ROLE_KEY", ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
            { label: "ANTHROPIC_API_KEY (AI)", ok: !!process.env.ANTHROPIC_API_KEY },
          ]}
        />
      )}
      {account.role === "super_admin" && <BrandForm logo={String(settings.logo_url ?? "")} logoDark={String(settings.logo_dark_url ?? "")} icon={String(settings.icon_url ?? "")} />}
      {account.role === "super_admin" && <QrisForm current={String(settings.qris_image_url ?? "")} />}
      {account.role === "super_admin" && <AssistantForm {...assistantConfig(settings)} />}
      <FeaturesForm features={features} settings={settings} canEdit={account.role === "super_admin"} />
    </>
  );
}
