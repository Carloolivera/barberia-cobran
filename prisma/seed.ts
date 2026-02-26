import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Servicios base
  await db.service.createMany({
    data: [
      { name: "Corte de pelo", durationMinutes: 30, price: 3500, order: 1 },
      { name: "Corte + Barba", durationMinutes: 45, price: 5000, order: 2 },
      { name: "Barba", durationMinutes: 20, price: 2000, order: 3 },
      { name: "Corte niños", durationMinutes: 25, price: 2500, order: 4 },
    ],
    skipDuplicates: true,
  });

  // Horarios (Lunes a Sábado, 9am-7pm)
  await db.workingHour.createMany({
    data: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "19:00" }, // Lunes
      { dayOfWeek: 2, startTime: "09:00", endTime: "19:00" }, // Martes
      { dayOfWeek: 3, startTime: "09:00", endTime: "19:00" }, // Miércoles
      { dayOfWeek: 4, startTime: "09:00", endTime: "19:00" }, // Jueves
      { dayOfWeek: 5, startTime: "09:00", endTime: "19:00" }, // Viernes
      { dayOfWeek: 6, startTime: "09:00", endTime: "15:00" }, // Sábado
    ],
    skipDuplicates: true,
  });

  console.log("Seed completado ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
