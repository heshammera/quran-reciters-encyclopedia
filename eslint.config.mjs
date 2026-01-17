import { nextVitals, nextTs } from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/*"],
  },
  nextVitals,
  nextTs,
];

export default eslintConfig;
