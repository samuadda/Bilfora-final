"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) return null; // أو Spinner لو تبي

  return (
    <div className="p-4 text-center text-lg font-semibold">
      أهلًا، {user?.user_metadata?.full_name || "مستخدم"} 👋
    </div>
  );
}
