/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer (PDF generation in route handlers) ships fontkit and
  // other Node-native bits that must not be bundled — keep it external so it
  // runs from node_modules at request time.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
