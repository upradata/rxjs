const fs = require('fs');
const path = require('path');

const removeExports = (context, ...pkgs) => {
    for (const pkg of pkgs) {
        const pkgPath = path.join(pkg, 'package.json');
        const resolvedPkgPath = require.resolve(pkgPath);

        if (fs.existsSync(resolvedPkgPath)) {
            const pkgJson = require(pkgPath);
            delete pkgJson.exports;

            fs.writeFileSync(require.resolve(pkgPath), JSON.stringify(pkgJson, null, 4), { encoding: 'utf-8' });
            context.log(`‣ ${pkgPath} "exports" field REMOVED !`);
        } else {
            // context.log(`‣ ${pkgPath} does not exist ! ${require.resolve(pkgPath)}`);
        }
    }
};

function afterAllResolved(lockfile, context) {
    removeExports(context, 'rxjs');

    return lockfile;
}


module.exports = {
    hooks: {
        // readPackage,
        afterAllResolved
    }
};
