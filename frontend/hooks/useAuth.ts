import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Supabase 認証状態を管理するカスタムフック
 * - userId: ログイン済みユーザーのUUID（未ログイン時はnull）
 * - loading: セッション確認中はtrue
 */
export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期セッション確認
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });

    // 認証状態の変化を監視（ログイン/ログアウト）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { userId, loading };
}
