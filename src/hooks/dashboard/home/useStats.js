import { useState, useEffect } from "react";
import { db } from "@/utils/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

export function useStats() {
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayIncome: 0,
    monthlyIncome: 0,
    totalProducts: 0,
    dailyIncomes: [],
    productStats: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const todayQuery = query(
          collection(db, "transactions"),
          where("date", ">=", today),
          where("date", "<", tomorrow)
        );
        const todaySnapshot = await getDocs(todayQuery);

        const monthQuery = query(
          collection(db, "transactions"),
          where("date", ">=", startOfMonth),
          where("date", "<", tomorrow)
        );
        const monthSnapshot = await getDocs(monthQuery);

        const productsSnapshot = await getDocs(collection(db, "dataBarang"));
        const productData = productsSnapshot.docs.map((doc) => ({
          name: doc.data().nama,
          stock: doc.data().stok,
        }));

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const weekQuery = query(
          collection(db, "transactions"),
          where("date", ">=", sevenDaysAgo),
          where("date", "<", tomorrow),
          orderBy("date", "asc")
        );
        const weekSnapshot = await getDocs(weekQuery);

        const dailyIncomes = {};
        weekSnapshot.docs.forEach((doc) => {
          const date = doc.data().date.toDate().toLocaleDateString();
          dailyIncomes[date] = (dailyIncomes[date] || 0) + doc.data().total;
        });

        const todayIncome = todaySnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().total,
          0
        );
        const monthlyIncome = monthSnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().total,
          0
        );

        setStats({
          todayTransactions: todaySnapshot.docs.length,
          todayIncome,
          monthlyIncome,
          totalProducts: productsSnapshot.docs.length,
          dailyIncomes: Object.entries(dailyIncomes),
          productStats: productData.slice(0, 5),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return { stats };
}
