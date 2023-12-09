"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigBuilder = exports.QueueBuilder = exports.Serialization = exports.QueueKind = void 0;
const fs = require("fs");
const path = require("path");
var QueueKind;
(function (QueueKind) {
    QueueKind[QueueKind["COMPILE_MODULE"] = 0] = "COMPILE_MODULE";
    QueueKind[QueueKind["COPY"] = 1] = "COPY";
    QueueKind[QueueKind["REMOVE"] = 2] = "REMOVE";
    QueueKind[QueueKind["SYNC_PLUGIN"] = 3] = "SYNC_PLUGIN";
    QueueKind[QueueKind["PACK"] = 4] = "PACK";
})(QueueKind || (exports.QueueKind = QueueKind = {}));
class Serialization {
}
exports.Serialization = Serialization;
class QueueBuilder {
    from;
    queue;
    name;
    constructor(from, name) {
        this.from = from;
        this.name = name;
        this.queue = [];
    }
    compile_module(module) {
        this.queue.push({
            kind: QueueKind.COMPILE_MODULE,
            information: {
                moduleName: module
            }
        });
        return this;
    }
    remove(path, recursive = false) {
        this.queue.push({
            kind: QueueKind.REMOVE,
            information: {
                target: path,
                recursive: recursive
            }
        });
        return this;
    }
    copy(from, to, overwrite = false) {
        this.queue.push({
            kind: QueueKind.COPY,
            information: {
                from: from,
                to: to,
                overwrite: overwrite
            }
        });
        return this;
    }
    pack(module) {
        this.queue.push({
            kind: QueueKind.PACK,
            information: {
                moduleName: module
            }
        });
        return this;
    }
    done() {
        this.from.set_queue(this.name, this.queue);
        return this.from;
    }
}
exports.QueueBuilder = QueueBuilder;
class ConfigBuilder {
    modules;
    loaders;
    dependencies;
    moduleType;
    plugins;
    queues;
    constructor() {
        this.modules = new Map();
        this.loaders = new Map();
        this.dependencies = new Map();
        this.moduleType = new Map();
        this.plugins = new Map();
        this.queues = new Map();
    }
    current = null;
    add_module(name, paths) {
        let convertedPaths = [];
        paths.forEach(value => {
            const loop = (root) => {
                fs.readdirSync(root).forEach(item => {
                    const itemPath = path.join(root, item);
                    if (fs.statSync(itemPath).isFile() && (itemPath.endsWith(".tsx") || itemPath.endsWith(".ts"))) {
                        convertedPaths.push(itemPath.replace(/\\/gi, "/"));
                    }
                    else if (fs.statSync(itemPath).isDirectory()) {
                        loop(itemPath);
                    }
                });
            };
            if (!fs.existsSync(value)) {
                console.log(`WARNING: The path '${value}' dont exist`);
                return;
            }
            if (fs.statSync(value).isFile()) {
                convertedPaths.push(value.replace(/\\/gi, "/"));
            }
            else if (fs.statSync(value).isDirectory()) {
                loop(value);
            }
        });
        this.modules.set(name, convertedPaths);
        this.moduleType.set(name, "module");
        this.loaders.set(name, []);
        this.plugins.set(name, []);
        this.current = name;
        return this;
    }
    select_module(name) {
        if (this.modules.has(name)) {
            this.current = name;
        }
        else {
            console.log(`ERROR: The module '${name}' dont exist`);
            process.exit(1);
        }
        return this;
    }
    add_loader(path) {
        if (!fs.existsSync(path)) {
            console.log(`WARNING: The path '${path}' dont exist`);
        }
        if (this.current == null) {
            console.log("ERROR: No module selected at 'add_loader'\nAt one with 'add_module' or select one with 'select_module'");
            process.exit(1);
        }
        if (!this.loaders.has(this.current)) {
            this.loaders.set(this.current, [path]);
        }
        else {
            this.loaders.get(this.current).push(path);
        }
        return this;
    }
    use(name, ...parameters) {
        if (this.current == null) {
            console.log("ERROR: No module selected at 'use'\nAt one with 'add_module' or select one with 'select_module'");
            process.exit(1);
        }
        if (!this.plugins.has(this.current)) {
            this.plugins.set(this.current, [
                {
                    name: name,
                    parameters: parameters
                }
            ]);
        }
        else {
            this.plugins.get(this.current).push({
                name: name,
                parameters: parameters
            });
        }
        return this;
    }
    dependence(name) {
        if (this.current == null) {
            console.log("ERROR: No module selected at 'dependence'\nAt one with 'add_module' or select one with 'select_module'");
            process.exit(1);
        }
        if (!this.dependencies.has(this.current)) {
            this.dependencies.set(this.current, [name]);
        }
        else {
            this.dependencies.get(this.current).push(name);
        }
        return this;
    }
    type(type) {
        if (this.current == null) {
            console.log("ERROR: No module selected at 'dependence'\nAt one with 'type' or select one with 'select_module'");
            process.exit(1);
        }
        this.moduleType.set(this.current, type);
        return this;
    }
    create_build_queue(name = "all") {
        return new QueueBuilder(this, name);
    }
    set_queue(name, queue) {
        this.queues.set(name, queue);
    }
    build() {
        let modules = {};
        this.modules.forEach((value, key) => {
            modules[key] = value;
        });
        let loaders = {};
        this.loaders.forEach((value, key) => {
            loaders[key] = value;
        });
        let dependencies = {};
        this.dependencies.forEach((value, key) => {
            dependencies[key] = value;
        });
        let plugins = {};
        this.plugins.forEach((value, key) => {
            plugins[key] = value;
        });
        let moduleType = {};
        this.moduleType.forEach((value, key) => {
            moduleType[key] = value;
        });
        if (this.queues.size == 0) {
            const queue = [];
            this.modules.forEach((value, key) => {
                queue.push({
                    kind: QueueKind.COMPILE_MODULE,
                    information: {
                        moduleName: key
                    }
                });
                this.queues.set("all", queue);
            });
        }
        const queues = {};
        this.queues.forEach((value, key) => {
            queues[key] = value;
        });
        return {
            queues: queues,
            modules: modules,
            loaders: loaders,
            moduleType: moduleType,
            dependencies: dependencies,
            plugins: plugins
        };
    }
    write(filePath) {
        const config = this.build();
        const plugins = {};
        for (let pluginKey in config.plugins) {
            plugins[pluginKey] = [];
            config.plugins[pluginKey].forEach(information => {
                const parameters = [];
                information.parameters.forEach(value => {
                    if (value instanceof Serialization) {
                        parameters.push(value.deserialize());
                    }
                    else {
                        parameters.push(value);
                    }
                });
                plugins[pluginKey].push({
                    name: information.name,
                    parameters: parameters
                });
            });
        }
        fs.writeFileSync(filePath, JSON.stringify({
            modules: config.modules,
            loaders: config.loaders,
            moduleType: config.moduleType,
            dependencies: config.dependencies,
            queues: config.queues,
            plugins: plugins
        }, null, 4));
    }
}
exports.ConfigBuilder = ConfigBuilder;
//# sourceMappingURL=config.js.map