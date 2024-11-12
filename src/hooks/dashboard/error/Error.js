import "@/components/styles/error.scss";

import { erorData } from "@/components/ui/data/Error";

import Image from "next/image";

import Link from "next/link";

export default function Error() {
  return (
    <div className="error__container container">
      <div className="content">
        {erorData.map((item) => {
          return (
            <div className="text" key={item.id}>
              <h1>{item.title}</h1>
              <p>{item.desc}</p>
              <div className="btn">
                <Link href="/">Kembali Login</Link>
              </div>
            </div>
          );
        })}

        {erorData.map((img) => {
          return (
            <div className="img" key={img.id}>
              <Image src={img.img} alt="image" quality={100} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
