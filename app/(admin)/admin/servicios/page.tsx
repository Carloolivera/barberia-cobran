import { getServices } from "@/actions/services";
import { ServicesManager } from "@/components/admin/services-manager";

export default async function ServiciosPage() {
  const services = await getServices();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configurá los servicios que ofrecés con precio y duración
        </p>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
