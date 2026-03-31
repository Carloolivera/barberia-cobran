import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js server modules
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({
    get: vi.fn(() => null),
  })),
}));
