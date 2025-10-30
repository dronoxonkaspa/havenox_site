// src/context/ListingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { fetchListings, postListing } from "../lib/apiClient";

const ListingsContext = createContext();

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetchListings();
      setListings(res.listings || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function addListing(data) {
    const record = await postListing(data);
    setListings((prev) => [...prev, record]);
    return record;
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ListingsContext.Provider
      value={{ listings, loading, error, refresh, addListing }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export const useListings = () => useContext(ListingsContext);
