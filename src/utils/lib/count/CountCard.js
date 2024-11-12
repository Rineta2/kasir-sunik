"use client";

import useCollectionCount from "@/utils/lib/count/useCollectionCount";

export default function CountCard({ path, name, icon }) {
  const { data } = useCollectionCount({ path });

  return (
    <div className="content-card">
      {icon}
      <div className="box">
        <h1>{name}</h1>
        <h2>{data}</h2>
      </div>
    </div>
  );
}
