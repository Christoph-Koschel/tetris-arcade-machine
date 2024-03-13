const {ConfigBuilder} = require("./engine/config");
const {PLUGINS} = require("./engine/plugins");
let builder = new ConfigBuilder();

builder.add_module("app", [
    "./main"
])
    .use(PLUGINS.TSB.MINIFIER)
    .add_loader("./main/app.ts");

builder.add_module("driver", [
    "./driver"
])
    .use(PLUGINS.TSB.MINIFIER);

builder.add_module("renderer", [
    "./renderer"
])
    .use(PLUGINS.TSB.MINIFIER)
    .dependence("driver")
    .add_loader("./renderer/loader.ts");

builder.create_build_queue("all")
    .compile_module("app")
    .compile_module("driver")
    .compile_module("renderer")
    .copy("./index.html", "./out", true)
    .copy("./package.json", "./out", true)
    .copy("./assets", "./out")
    .done();

exports.default = builder.build();