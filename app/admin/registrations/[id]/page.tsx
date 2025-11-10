import { getRegistrationById } from "@/lib/db";
import RegistrationDetailClient from "./RegistrationDetailClient";

export default async function RegistrationDetailPage({ params }: { params: { id: string } }) {
  const registration = await getRegistrationById(params.id);
  
  if (!registration) return <div>Kayıt bulunamadı.</div>;
  
  return <RegistrationDetailClient registration={registration} />;
}