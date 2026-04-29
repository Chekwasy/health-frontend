import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// 👇 Use healthcare schema
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "healthcare" },
});

class DBClient {
  // ❗ Let TypeScript infer type (fixes your error)
  public client;

  constructor() {
    this.client = supabase;
  }

  async isAlive(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from("profiles")
        .select("id")
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  async nbUsers(): Promise<number> {
    const { count, error } = await this.client
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  }

  async nbDoctors(): Promise<number> {
    const { count, error } = await this.client
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "DOCTOR");

    if (error) throw error;
    return count || 0;
  }

  async nbPatients(): Promise<number> {
    const { count, error } = await this.client
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "PATIENT");

    if (error) throw error;
    return count || 0;
  }

  async nbAppointments(): Promise<number> {
    const { count, error } = await this.client
      .from("appointments")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  }
}

export default new DBClient();