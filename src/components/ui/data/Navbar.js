import { MdOutlineStorage } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { FaHistory } from "react-icons/fa";
import { SlNotebook } from "react-icons/sl";
import { CiHome } from "react-icons/ci";

export const dataNavbar = [
  {
    id: 1,
    tile: "Dashboard",
    icons: <CiHome size={25} />,
    path: "/dashboard",
  },

  {
    id: 2,
    tile: "Data Barang",
    icons: <MdOutlineStorage size={25} />,
    path: "/dashboard/data-barang",
  },

  {
    id: 3,
    tile: "Transaksi",
    icons: <GrTransaction size={25} />,
    path: "/dashboard/transaksi",
  },

  {
    id: 4,
    tile: "Data Transaksi",
    icons: <FaHistory size={25} />,
    path: "/dashboard/data-transaksi",
  },

  {
    id: 5,
    tile: "Rekapitulasi",
    icons: <SlNotebook size={25} />,
    path: "/dashboard/rekapitulasi",
  },
];
