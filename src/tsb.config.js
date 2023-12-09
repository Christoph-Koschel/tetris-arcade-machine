const {ConfigBuilder} = require("./engine/config");
let builder = new ConfigBuilder();

builder.add_module("app", [
    "./main"
]).add_loader("./main/app.ts");

builder.add_module("renderer", [
    "./renderer"
]).add_loader("./renderer/loader.ts");

builder.create_build_queue("all")
    .compile_module("app")
    .compile_module("renderer")
    .copy("./index.html", "./out", true)
    .copy("./package.json", "./out", true)
    .done();

exports.default = builder.build();