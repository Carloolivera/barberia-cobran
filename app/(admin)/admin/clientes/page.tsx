import { getKnownClients } from "@/actions/known-clients";
import { KnownClientsManager } from "@/components/admin/known-clients-manager";

export default async function ClientesPage() {
  const clients = await getKnownClients();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes conocidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Los teléfonos en esta lista reciben confirmación automática al reservar
        </p>
      </div>
      <KnownClientsManager initialClients={clients} />
    </div>
  );
}
