const path = require("path");

var config = {
    entry: "./esm/index.js",
    output: {
        path: path.resolve(__dirname, "src"),
        library: {
            name: "wwtlib",
            type: "umd"
        }
    },
};

module.exports = (_env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
        config.output.filename = "index.js";
    }

    if (argv.mode === "production") {
        config.output.filename = "index.min.js";
    }

    return config;
};
