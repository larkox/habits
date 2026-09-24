const packageJson = require('../package.json');

const dependencySections = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
];
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const unpinnedDependencies = dependencySections.flatMap((section) =>
    Object.entries(packageJson[section] ?? {})
        .filter(([, version]) => !exactVersionPattern.test(version))
        .map(([name, version]) => `${section}.${name}: ${version}`),
);

if (unpinnedDependencies.length > 0) {
    console.error('Dependencies must use exact semantic versions:');
    console.error(unpinnedDependencies.join('\n'));
    process.exitCode = 1;
}
