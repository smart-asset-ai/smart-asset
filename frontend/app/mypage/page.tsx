"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function MyPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkRoleAndRedirect() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.push("/");
        return;
      }

      // Check if user is registered as a contractor
      const { data: contractor } = await supabase
        .from("contractors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (contractor) {
        router.replace("/contractor/mypage");
      } else {
        router.replace("/owner/mypage");
      }
    }

    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: "3rem" }}>
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
}
