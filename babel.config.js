module.exports = function (api) {
  api.cache(true);

  return {
    include: [
      // __dirname,
      '/node_modules/@leansdk/',
      // './',
    ],
    exclude: [/node_modules\/(?!@leansdk)/],
    presets: ["@babel/preset-env"],
    plugins: [
      "@babel/plugin-syntax-flow",
      "flow-runtime",
      /*["flow-runtime", {
        "assert": true,
        "annotate": true
      }],*/
      "@babel/plugin-transform-flow-strip-types",
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ["@babel/plugin-proposal-class-properties", { "loose": true }],
      "@babel/plugin-transform-runtime"
    ]
  };
}