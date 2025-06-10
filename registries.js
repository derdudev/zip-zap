const _registries = {};

export function registerRegistry(name, initialValue) {
    _registries[name] = initialValue;
}

export function getRegistryData(name) {
    return _registries[name];
}

export function updateRegistry(name, updater) {
    _registries[name] = updater(_registries[name]);
}
