const fs = require('fs');
const path = require('path');

const removeExports = (context, ...pkgs) => {
    for (const pkg of pkgs) {
        try {
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
        } catch (e) {
            // if the package is not installed, afterAllResolved is called before the package is installed in node_modules
            // so calling require.resolve(pkgPath) will fail.
            // As there is no way to know when it will be done, we wait a bit and try again, few times.
            // pnpm will get back to installation, will write in node_modules, and eventually we will find the package installed!
            if (context.__mt?.[ pkg ] == 10) {
                console.error(e);
            } else {
                mt = context.__mt = context.__mt || {};
                mt[ pkg ] = mt[ pkg ] === undefined ? 0 : mt[ pkg ];
                ++mt[ pkg ];
                console.log(context.__mt?.[ pkg ]);

                setTimeout(() => {
                    removeExports(context, pkg);
                }, 500);
            }
        }
    }
};

function afterAllResolved(lockfile, context) {
    console.log('caca');
    removeExports(context, 'rxjs');

    return lockfile;
}


module.exports = {
    hooks: {
        // readPackage,
        afterAllResolved
    }
};
