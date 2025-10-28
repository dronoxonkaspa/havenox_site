import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createListing, getListings } from "../lib/apiClient";

const ListingsContext = createContext();

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Fetch listings from HavenOx API
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getListings();
      const items = Array.isArray(data?.listings) ? data.listings : [];
      setListings(items);
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔁 Refresh listings every 20s
  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 20000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  // ➕ Create new listing
  const addListing = useCallback(
    async (payload) => {
      const response = await createListing(payload);
      await fetchListings();
      return response;
    },
    [fetchListings]
  );

  return (
    <ListingsContext.Provider
      value={{ listings, loading, fetchListings, addListing }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useListings() {
  return useContext(ListingsContext);
}
