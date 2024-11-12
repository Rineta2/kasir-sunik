"use client";

import { collection, getCountFromServer } from "firebase/firestore";
import useSWR from "swr";
import { db } from "@/utils/lib/firebase";

const fetcher = async (path) => {
  const snapshot = await getCountFromServer(collection(db, path));
  return snapshot.data().count;
};

export default function useCollectionCount({ path }) {
  const { data, error, isLoading } = useSWR(path, fetcher);

  return {
    data,
    error,
    isLoading,
  };
}
