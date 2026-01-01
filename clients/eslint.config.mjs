const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // stop ESLint reporting unused eslint-disable comments
    reportUnusedDisableDirectives: "off",

    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
