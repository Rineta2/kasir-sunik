"use client";

import { useEffect, useState } from "react";

import { db } from "@/utils/lib/firebase";

import { collection, getDocs } from "firebase/firestore";

export default function useCollectionCount({ path }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, path));
        const totalCount = querySnapshot.size;
        setData(totalCount);
      } catch (err) {
        setError("Gagal memuat data.");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [path]);

  return { data, isLoading, error };
}
