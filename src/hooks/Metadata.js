import { Fragment } from "react";

export const metadata = {
  title: "Kasir Sunik Yohan",
  description:
    "Kasir Sunik Yohan adalah aplikasi kasir untuk toko Sunik Yohan.",
  author: "rineta",
  icons: {
    icon: "/favicon.ico",
  },
};

const Metadata = () => {
  return (
    <Fragment>
      <title>{metadata.title}</title>
      <meta charSet="UTF-8" />
      <meta name="version" content="1.0" />
      <meta name="manifest" content="/manifest.json" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={metadata.description} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="property & designer" />
      <meta name="author" content={metadata.author} />
      <meta name="googlebot" content="index, follow" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="robots" content="index, follow" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
      <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="manifest" href="/manifest.json" />
    </Fragment>
  );
};

export default Metadata;
