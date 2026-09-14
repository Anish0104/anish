import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** Next 16 ships native flat configs, so no FlatCompat shim is needed. */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
