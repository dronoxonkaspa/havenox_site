import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ListingsContext = createContext();

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setListings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchListings();

    // 🔴 Realtime subscription
    const channel = supabase
      .channel("realtime:listings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => fetchListings()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <ListingsContext.Provider value={{ listings, loading, fetchListings }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  return useContext(ListingsContext);
}
