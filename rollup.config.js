// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default {
  input: "index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    name: "bundle",
    sourcemap: true,
  },
  plugins: [typescript()],
};
