#!/usr/bin/env node

/* eslint-disable max-len, flowtype/require-valid-file-annotation, flowtype/require-return-type */
/* global packageInformationStores, null, $$SETUP_STATIC_TABLES */

// Used for the resolveUnqualified part of the resolution (ie resolving folder/index.js & file extensions)
// Deconstructed so that they aren't affected by any fs monkeypatching occuring later during the execution
const {statSync, lstatSync, readlinkSync, readFileSync, existsSync, realpathSync} = require('fs');

const Module = require('module');
const path = require('path');
const StringDecoder = require('string_decoder');

const ignorePattern = null ? new RegExp(null) : null;

const pnpFile = path.resolve(__dirname, __filename);
const builtinModules = new Set(Module.builtinModules || Object.keys(process.binding('natives')));

const topLevelLocator = {name: null, reference: null};
const blacklistedLocator = {name: NaN, reference: NaN};

// Used for compatibility purposes - cf setupCompatibilityLayer
const patchedModules = [];
const fallbackLocators = [topLevelLocator];

// Matches backslashes of Windows paths
const backwardSlashRegExp = /\\/g;

// Matches if the path must point to a directory (ie ends with /)
const isDirRegExp = /\/$/;

// Matches if the path starts with a valid path qualifier (./, ../, /)
// eslint-disable-next-line no-unused-vars
const isStrictRegExp = /^\.{0,2}\//;

// Splits a require request into its components, or return null if the request is a file path
const pathRegExp = /^(?![a-zA-Z]:[\\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^\/]+\/)?[^\/]+)\/?(.*|)$/;

// Keep a reference around ("module" is a common name in this context, so better rename it to something more significant)
const pnpModule = module;

/**
 * Used to disable the resolution hooks (for when we want to fallback to the previous resolution - we then need
 * a way to "reset" the environment temporarily)
 */

let enableNativeHooks = true;

/**
 * Simple helper function that assign an error code to an error, so that it can more easily be caught and used
 * by third-parties.
 */

function makeError(code, message, data = {}) {
  const error = new Error(message);
  return Object.assign(error, {code, data});
}

/**
 * Ensures that the returned locator isn't a blacklisted one.
 *
 * Blacklisted packages are packages that cannot be used because their dependencies cannot be deduced. This only
 * happens with peer dependencies, which effectively have different sets of dependencies depending on their parents.
 *
 * In order to deambiguate those different sets of dependencies, the Yarn implementation of PnP will generate a
 * symlink for each combination of <package name>/<package version>/<dependent package> it will find, and will
 * blacklist the target of those symlinks. By doing this, we ensure that files loaded through a specific path
 * will always have the same set of dependencies, provided the symlinks are correctly preserved.
 *
 * Unfortunately, some tools do not preserve them, and when it happens PnP isn't able anymore to deduce the set of
 * dependencies based on the path of the file that makes the require calls. But since we've blacklisted those paths,
 * we're able to print a more helpful error message that points out that a third-party package is doing something
 * incompatible!
 */

// eslint-disable-next-line no-unused-vars
function blacklistCheck(locator) {
  if (locator === blacklistedLocator) {
    throw makeError(
      `BLACKLISTED`,
      [
        `A package has been resolved through a blacklisted path - this is usually caused by one of your tools calling`,
        `"realpath" on the return value of "require.resolve". Since the returned values use symlinks to disambiguate`,
        `peer dependencies, they must be passed untransformed to "require".`,
      ].join(` `)
    );
  }

  return locator;
}

let packageInformationStores = new Map([
  ["handlebars", new Map([
    ["4.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-handlebars-4.1.2-b6b37c1ced0306b221e094fc7aca3ec23b131b67/node_modules/handlebars/"),
      packageDependencies: new Map([
        ["neo-async", "2.6.1"],
        ["optimist", "0.6.1"],
        ["source-map", "0.6.1"],
        ["uglify-js", "3.5.15"],
        ["handlebars", "4.1.2"],
      ]),
    }],
  ])],
  ["neo-async", new Map([
    ["2.6.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-neo-async-2.6.1-ac27ada66167fa8849a6addd837f6b189ad2081c/node_modules/neo-async/"),
      packageDependencies: new Map([
        ["neo-async", "2.6.1"],
      ]),
    }],
  ])],
  ["optimist", new Map([
    ["0.6.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-optimist-0.6.1-da3ea74686fa21a19a111c326e90eb15a0196686/node_modules/optimist/"),
      packageDependencies: new Map([
        ["minimist", "0.0.10"],
        ["wordwrap", "0.0.3"],
        ["optimist", "0.6.1"],
      ]),
    }],
  ])],
  ["minimist", new Map([
    ["0.0.10", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-minimist-0.0.10-de3f98543dbf96082be48ad1a0c7cda836301dcf/node_modules/minimist/"),
      packageDependencies: new Map([
        ["minimist", "0.0.10"],
      ]),
    }],
    ["0.0.8", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-minimist-0.0.8-857fcabfc3397d2625b8228262e86aa7a011b05d/node_modules/minimist/"),
      packageDependencies: new Map([
        ["minimist", "0.0.8"],
      ]),
    }],
  ])],
  ["wordwrap", new Map([
    ["0.0.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-wordwrap-0.0.3-a3d5da6cd5c0bc0008d37234bbaf1bed63059107/node_modules/wordwrap/"),
      packageDependencies: new Map([
        ["wordwrap", "0.0.3"],
      ]),
    }],
  ])],
  ["source-map", new Map([
    ["0.6.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263/node_modules/source-map/"),
      packageDependencies: new Map([
        ["source-map", "0.6.1"],
      ]),
    }],
  ])],
  ["uglify-js", new Map([
    ["3.5.15", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-uglify-js-3.5.15-fe2b5378fd0b09e116864041437bff889105ce24/node_modules/uglify-js/"),
      packageDependencies: new Map([
        ["commander", "2.20.0"],
        ["source-map", "0.6.1"],
        ["uglify-js", "3.5.15"],
      ]),
    }],
  ])],
  ["commander", new Map([
    ["2.20.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-commander-2.20.0-d58bb2b5c1ee8f87b0d340027e9e94e222c5a422/node_modules/commander/"),
      packageDependencies: new Map([
        ["commander", "2.20.0"],
      ]),
    }],
  ])],
  ["html-pdf", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-html-pdf-2.2.0-4bcf91c24cb560e47aa3facfd033e0e1bf241b91/node_modules/html-pdf/"),
      packageDependencies: new Map([
        ["phantomjs-prebuilt", "2.1.16"],
        ["html-pdf", "2.2.0"],
      ]),
    }],
  ])],
  ["phantomjs-prebuilt", new Map([
    ["2.1.16", {
      packageLocation: path.resolve(__dirname, "./.pnp/unplugged/npm-phantomjs-prebuilt-2.1.16-efd212a4a3966d3647684ea8ba788549be2aefef/node_modules/phantomjs-prebuilt/"),
      packageDependencies: new Map([
        ["es6-promise", "4.2.6"],
        ["extract-zip", "1.6.7"],
        ["fs-extra", "1.0.0"],
        ["hasha", "2.2.0"],
        ["kew", "0.7.0"],
        ["progress", "1.1.8"],
        ["request", "2.88.0"],
        ["request-progress", "2.0.1"],
        ["which", "1.3.1"],
        ["phantomjs-prebuilt", "2.1.16"],
      ]),
    }],
  ])],
  ["es6-promise", new Map([
    ["4.2.6", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-es6-promise-4.2.6-b685edd8258886365ea62b57d30de28fadcd974f/node_modules/es6-promise/"),
      packageDependencies: new Map([
        ["es6-promise", "4.2.6"],
      ]),
    }],
  ])],
  ["extract-zip", new Map([
    ["1.6.7", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-extract-zip-1.6.7-a840b4b8af6403264c8db57f4f1a74333ef81fe9/node_modules/extract-zip/"),
      packageDependencies: new Map([
        ["concat-stream", "1.6.2"],
        ["debug", "2.6.9"],
        ["mkdirp", "0.5.1"],
        ["yauzl", "2.4.1"],
        ["extract-zip", "1.6.7"],
      ]),
    }],
  ])],
  ["concat-stream", new Map([
    ["1.6.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-concat-stream-1.6.2-904bdf194cd3122fc675c77fc4ac3d4ff0fd1a34/node_modules/concat-stream/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
        ["inherits", "2.0.3"],
        ["readable-stream", "2.3.6"],
        ["typedarray", "0.0.6"],
        ["concat-stream", "1.6.2"],
      ]),
    }],
  ])],
  ["buffer-from", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef/node_modules/buffer-from/"),
      packageDependencies: new Map([
        ["buffer-from", "1.1.1"],
      ]),
    }],
  ])],
  ["inherits", new Map([
    ["2.0.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-inherits-2.0.3-633c2c83e3da42a502f52466022480f4208261de/node_modules/inherits/"),
      packageDependencies: new Map([
        ["inherits", "2.0.3"],
      ]),
    }],
  ])],
  ["readable-stream", new Map([
    ["2.3.6", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-readable-stream-2.3.6-b11c27d88b8ff1fbe070643cf94b0c79ae1b0aaf/node_modules/readable-stream/"),
      packageDependencies: new Map([
        ["core-util-is", "1.0.2"],
        ["inherits", "2.0.3"],
        ["isarray", "1.0.0"],
        ["process-nextick-args", "2.0.0"],
        ["safe-buffer", "5.1.2"],
        ["string_decoder", "1.1.1"],
        ["util-deprecate", "1.0.2"],
        ["readable-stream", "2.3.6"],
      ]),
    }],
  ])],
  ["core-util-is", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-core-util-is-1.0.2-b5fd54220aa2bc5ab57aab7140c940754503c1a7/node_modules/core-util-is/"),
      packageDependencies: new Map([
        ["core-util-is", "1.0.2"],
      ]),
    }],
  ])],
  ["isarray", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-isarray-1.0.0-bb935d48582cba168c06834957a54a3e07124f11/node_modules/isarray/"),
      packageDependencies: new Map([
        ["isarray", "1.0.0"],
      ]),
    }],
  ])],
  ["process-nextick-args", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-process-nextick-args-2.0.0-a37d732f4271b4ab1ad070d35508e8290788ffaa/node_modules/process-nextick-args/"),
      packageDependencies: new Map([
        ["process-nextick-args", "2.0.0"],
      ]),
    }],
  ])],
  ["safe-buffer", new Map([
    ["5.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-safe-buffer-5.1.2-991ec69d296e0313747d59bdfd2b745c35f8828d/node_modules/safe-buffer/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.1.2"],
      ]),
    }],
  ])],
  ["string_decoder", new Map([
    ["1.1.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-string-decoder-1.1.1-9cf1611ba62685d7030ae9e4ba34149c3af03fc8/node_modules/string_decoder/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.1.2"],
        ["string_decoder", "1.1.1"],
      ]),
    }],
  ])],
  ["util-deprecate", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-util-deprecate-1.0.2-450d4dc9fa70de732762fbd2d4a28981419a0ccf/node_modules/util-deprecate/"),
      packageDependencies: new Map([
        ["util-deprecate", "1.0.2"],
      ]),
    }],
  ])],
  ["typedarray", new Map([
    ["0.0.6", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-typedarray-0.0.6-867ac74e3864187b1d3d47d996a78ec5c8830777/node_modules/typedarray/"),
      packageDependencies: new Map([
        ["typedarray", "0.0.6"],
      ]),
    }],
  ])],
  ["debug", new Map([
    ["2.6.9", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-debug-2.6.9-5d128515df134ff327e90a4c93f4e077a536341f/node_modules/debug/"),
      packageDependencies: new Map([
        ["ms", "2.0.0"],
        ["debug", "2.6.9"],
      ]),
    }],
  ])],
  ["ms", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-ms-2.0.0-5608aeadfc00be6c2901df5f9861788de0d597c8/node_modules/ms/"),
      packageDependencies: new Map([
        ["ms", "2.0.0"],
      ]),
    }],
  ])],
  ["mkdirp", new Map([
    ["0.5.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-mkdirp-0.5.1-30057438eac6cf7f8c4767f38648d6697d75c903/node_modules/mkdirp/"),
      packageDependencies: new Map([
        ["minimist", "0.0.8"],
        ["mkdirp", "0.5.1"],
      ]),
    }],
  ])],
  ["yauzl", new Map([
    ["2.4.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-yauzl-2.4.1-9528f442dab1b2284e58b4379bb194e22e0c4005/node_modules/yauzl/"),
      packageDependencies: new Map([
        ["fd-slicer", "1.0.1"],
        ["yauzl", "2.4.1"],
      ]),
    }],
  ])],
  ["fd-slicer", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-fd-slicer-1.0.1-8b5bcbd9ec327c5041bf9ab023fd6750f1177e65/node_modules/fd-slicer/"),
      packageDependencies: new Map([
        ["pend", "1.2.0"],
        ["fd-slicer", "1.0.1"],
      ]),
    }],
  ])],
  ["pend", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-pend-1.2.0-7a57eb550a6783f9115331fcf4663d5c8e007a50/node_modules/pend/"),
      packageDependencies: new Map([
        ["pend", "1.2.0"],
      ]),
    }],
  ])],
  ["fs-extra", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-fs-extra-1.0.0-cd3ce5f7e7cb6145883fcae3191e9877f8587950/node_modules/fs-extra/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.1.15"],
        ["jsonfile", "2.4.0"],
        ["klaw", "1.3.1"],
        ["fs-extra", "1.0.0"],
      ]),
    }],
  ])],
  ["graceful-fs", new Map([
    ["4.1.15", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-graceful-fs-4.1.15-ffb703e1066e8a0eeaa4c8b80ba9253eeefbfb00/node_modules/graceful-fs/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.1.15"],
      ]),
    }],
  ])],
  ["jsonfile", new Map([
    ["2.4.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-jsonfile-2.4.0-3736a2b428b87bbda0cc83b53fa3d633a35c2ae8/node_modules/jsonfile/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.1.15"],
        ["jsonfile", "2.4.0"],
      ]),
    }],
  ])],
  ["klaw", new Map([
    ["1.3.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-klaw-1.3.1-4088433b46b3b1ba259d78785d8e96f73ba02439/node_modules/klaw/"),
      packageDependencies: new Map([
        ["graceful-fs", "4.1.15"],
        ["klaw", "1.3.1"],
      ]),
    }],
  ])],
  ["hasha", new Map([
    ["2.2.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-hasha-2.2.0-78d7cbfc1e6d66303fe79837365984517b2f6ee1/node_modules/hasha/"),
      packageDependencies: new Map([
        ["is-stream", "1.1.0"],
        ["pinkie-promise", "2.0.1"],
        ["hasha", "2.2.0"],
      ]),
    }],
  ])],
  ["is-stream", new Map([
    ["1.1.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-is-stream-1.1.0-12d4a3dd4e68e0b79ceb8dbc84173ae80d91ca44/node_modules/is-stream/"),
      packageDependencies: new Map([
        ["is-stream", "1.1.0"],
      ]),
    }],
  ])],
  ["pinkie-promise", new Map([
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-pinkie-promise-2.0.1-2135d6dfa7a358c069ac9b178776288228450ffa/node_modules/pinkie-promise/"),
      packageDependencies: new Map([
        ["pinkie", "2.0.4"],
        ["pinkie-promise", "2.0.1"],
      ]),
    }],
  ])],
  ["pinkie", new Map([
    ["2.0.4", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-pinkie-2.0.4-72556b80cfa0d48a974e80e77248e80ed4f7f870/node_modules/pinkie/"),
      packageDependencies: new Map([
        ["pinkie", "2.0.4"],
      ]),
    }],
  ])],
  ["kew", new Map([
    ["0.7.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-kew-0.7.0-79d93d2d33363d6fdd2970b335d9141ad591d79b/node_modules/kew/"),
      packageDependencies: new Map([
        ["kew", "0.7.0"],
      ]),
    }],
  ])],
  ["progress", new Map([
    ["1.1.8", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-progress-1.1.8-e260c78f6161cdd9b0e56cc3e0a85de17c7a57be/node_modules/progress/"),
      packageDependencies: new Map([
        ["progress", "1.1.8"],
      ]),
    }],
  ])],
  ["request", new Map([
    ["2.88.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-request-2.88.0-9c2fca4f7d35b592efe57c7f0a55e81052124fef/node_modules/request/"),
      packageDependencies: new Map([
        ["aws-sign2", "0.7.0"],
        ["aws4", "1.8.0"],
        ["caseless", "0.12.0"],
        ["combined-stream", "1.0.8"],
        ["extend", "3.0.2"],
        ["forever-agent", "0.6.1"],
        ["form-data", "2.3.3"],
        ["har-validator", "5.1.3"],
        ["http-signature", "1.2.0"],
        ["is-typedarray", "1.0.0"],
        ["isstream", "0.1.2"],
        ["json-stringify-safe", "5.0.1"],
        ["mime-types", "2.1.24"],
        ["oauth-sign", "0.9.0"],
        ["performance-now", "2.1.0"],
        ["qs", "6.5.2"],
        ["safe-buffer", "5.1.2"],
        ["tough-cookie", "2.4.3"],
        ["tunnel-agent", "0.6.0"],
        ["uuid", "3.3.2"],
        ["request", "2.88.0"],
      ]),
    }],
  ])],
  ["aws-sign2", new Map([
    ["0.7.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-aws-sign2-0.7.0-b46e890934a9591f2d2f6f86d7e6a9f1b3fe76a8/node_modules/aws-sign2/"),
      packageDependencies: new Map([
        ["aws-sign2", "0.7.0"],
      ]),
    }],
  ])],
  ["aws4", new Map([
    ["1.8.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-aws4-1.8.0-f0e003d9ca9e7f59c7a508945d7b2ef9a04a542f/node_modules/aws4/"),
      packageDependencies: new Map([
        ["aws4", "1.8.0"],
      ]),
    }],
  ])],
  ["caseless", new Map([
    ["0.12.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-caseless-0.12.0-1b681c21ff84033c826543090689420d187151dc/node_modules/caseless/"),
      packageDependencies: new Map([
        ["caseless", "0.12.0"],
      ]),
    }],
  ])],
  ["combined-stream", new Map([
    ["1.0.8", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-combined-stream-1.0.8-c3d45a8b34fd730631a110a8a2520682b31d5a7f/node_modules/combined-stream/"),
      packageDependencies: new Map([
        ["delayed-stream", "1.0.0"],
        ["combined-stream", "1.0.8"],
      ]),
    }],
  ])],
  ["delayed-stream", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-delayed-stream-1.0.0-df3ae199acadfb7d440aaae0b29e2272b24ec619/node_modules/delayed-stream/"),
      packageDependencies: new Map([
        ["delayed-stream", "1.0.0"],
      ]),
    }],
  ])],
  ["extend", new Map([
    ["3.0.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-extend-3.0.2-f8b1136b4071fbd8eb140aff858b1019ec2915fa/node_modules/extend/"),
      packageDependencies: new Map([
        ["extend", "3.0.2"],
      ]),
    }],
  ])],
  ["forever-agent", new Map([
    ["0.6.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-forever-agent-0.6.1-fbc71f0c41adeb37f96c577ad1ed42d8fdacca91/node_modules/forever-agent/"),
      packageDependencies: new Map([
        ["forever-agent", "0.6.1"],
      ]),
    }],
  ])],
  ["form-data", new Map([
    ["2.3.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-form-data-2.3.3-dcce52c05f644f298c6a7ab936bd724ceffbf3a6/node_modules/form-data/"),
      packageDependencies: new Map([
        ["asynckit", "0.4.0"],
        ["combined-stream", "1.0.8"],
        ["mime-types", "2.1.24"],
        ["form-data", "2.3.3"],
      ]),
    }],
  ])],
  ["asynckit", new Map([
    ["0.4.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-asynckit-0.4.0-c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79/node_modules/asynckit/"),
      packageDependencies: new Map([
        ["asynckit", "0.4.0"],
      ]),
    }],
  ])],
  ["mime-types", new Map([
    ["2.1.24", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-mime-types-2.1.24-b6f8d0b3e951efb77dedeca194cff6d16f676f81/node_modules/mime-types/"),
      packageDependencies: new Map([
        ["mime-db", "1.40.0"],
        ["mime-types", "2.1.24"],
      ]),
    }],
  ])],
  ["mime-db", new Map([
    ["1.40.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-mime-db-1.40.0-a65057e998db090f732a68f6c276d387d4126c32/node_modules/mime-db/"),
      packageDependencies: new Map([
        ["mime-db", "1.40.0"],
      ]),
    }],
  ])],
  ["har-validator", new Map([
    ["5.1.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-har-validator-5.1.3-1ef89ebd3e4996557675eed9893110dc350fa080/node_modules/har-validator/"),
      packageDependencies: new Map([
        ["ajv", "6.10.0"],
        ["har-schema", "2.0.0"],
        ["har-validator", "5.1.3"],
      ]),
    }],
  ])],
  ["ajv", new Map([
    ["6.10.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-ajv-6.10.0-90d0d54439da587cd7e843bfb7045f50bd22bdf1/node_modules/ajv/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "2.0.1"],
        ["fast-json-stable-stringify", "2.0.0"],
        ["json-schema-traverse", "0.4.1"],
        ["uri-js", "4.2.2"],
        ["ajv", "6.10.0"],
      ]),
    }],
  ])],
  ["fast-deep-equal", new Map([
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-fast-deep-equal-2.0.1-7b05218ddf9667bf7f370bf7fdb2cb15fdd0aa49/node_modules/fast-deep-equal/"),
      packageDependencies: new Map([
        ["fast-deep-equal", "2.0.1"],
      ]),
    }],
  ])],
  ["fast-json-stable-stringify", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-fast-json-stable-stringify-2.0.0-d5142c0caee6b1189f87d3a76111064f86c8bbf2/node_modules/fast-json-stable-stringify/"),
      packageDependencies: new Map([
        ["fast-json-stable-stringify", "2.0.0"],
      ]),
    }],
  ])],
  ["json-schema-traverse", new Map([
    ["0.4.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660/node_modules/json-schema-traverse/"),
      packageDependencies: new Map([
        ["json-schema-traverse", "0.4.1"],
      ]),
    }],
  ])],
  ["uri-js", new Map([
    ["4.2.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-uri-js-4.2.2-94c540e1ff772956e2299507c010aea6c8838eb0/node_modules/uri-js/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
        ["uri-js", "4.2.2"],
      ]),
    }],
  ])],
  ["punycode", new Map([
    ["2.1.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec/node_modules/punycode/"),
      packageDependencies: new Map([
        ["punycode", "2.1.1"],
      ]),
    }],
    ["1.4.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-punycode-1.4.1-c0d5a63b2718800ad8e1eb0fa5269c84dd41845e/node_modules/punycode/"),
      packageDependencies: new Map([
        ["punycode", "1.4.1"],
      ]),
    }],
  ])],
  ["har-schema", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-har-schema-2.0.0-a94c2224ebcac04782a0d9035521f24735b7ec92/node_modules/har-schema/"),
      packageDependencies: new Map([
        ["har-schema", "2.0.0"],
      ]),
    }],
  ])],
  ["http-signature", new Map([
    ["1.2.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-http-signature-1.2.0-9aecd925114772f3d95b65a60abb8f7c18fbace1/node_modules/http-signature/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
        ["jsprim", "1.4.1"],
        ["sshpk", "1.16.1"],
        ["http-signature", "1.2.0"],
      ]),
    }],
  ])],
  ["assert-plus", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-assert-plus-1.0.0-f12e0f3c5d77b0b1cdd9146942e4e96c1e4dd525/node_modules/assert-plus/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
      ]),
    }],
  ])],
  ["jsprim", new Map([
    ["1.4.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-jsprim-1.4.1-313e66bc1e5cc06e438bc1b7499c2e5c56acb6a2/node_modules/jsprim/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
        ["extsprintf", "1.3.0"],
        ["json-schema", "0.2.3"],
        ["verror", "1.10.0"],
        ["jsprim", "1.4.1"],
      ]),
    }],
  ])],
  ["extsprintf", new Map([
    ["1.3.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-extsprintf-1.3.0-96918440e3041a7a414f8c52e3c574eb3c3e1e05/node_modules/extsprintf/"),
      packageDependencies: new Map([
        ["extsprintf", "1.3.0"],
      ]),
    }],
    ["1.4.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-extsprintf-1.4.0-e2689f8f356fad62cca65a3a91c5df5f9551692f/node_modules/extsprintf/"),
      packageDependencies: new Map([
        ["extsprintf", "1.4.0"],
      ]),
    }],
  ])],
  ["json-schema", new Map([
    ["0.2.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-json-schema-0.2.3-b480c892e59a2f05954ce727bd3f2a4e882f9e13/node_modules/json-schema/"),
      packageDependencies: new Map([
        ["json-schema", "0.2.3"],
      ]),
    }],
  ])],
  ["verror", new Map([
    ["1.10.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-verror-1.10.0-3a105ca17053af55d6e270c1f8288682e18da400/node_modules/verror/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
        ["core-util-is", "1.0.2"],
        ["extsprintf", "1.4.0"],
        ["verror", "1.10.0"],
      ]),
    }],
  ])],
  ["sshpk", new Map([
    ["1.16.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-sshpk-1.16.1-fb661c0bef29b39db40769ee39fa70093d6f6877/node_modules/sshpk/"),
      packageDependencies: new Map([
        ["asn1", "0.2.4"],
        ["assert-plus", "1.0.0"],
        ["bcrypt-pbkdf", "1.0.2"],
        ["dashdash", "1.14.1"],
        ["ecc-jsbn", "0.1.2"],
        ["getpass", "0.1.7"],
        ["jsbn", "0.1.1"],
        ["safer-buffer", "2.1.2"],
        ["tweetnacl", "0.14.5"],
        ["sshpk", "1.16.1"],
      ]),
    }],
  ])],
  ["asn1", new Map([
    ["0.2.4", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-asn1-0.2.4-8d2475dfab553bb33e77b54e59e880bb8ce23136/node_modules/asn1/"),
      packageDependencies: new Map([
        ["safer-buffer", "2.1.2"],
        ["asn1", "0.2.4"],
      ]),
    }],
  ])],
  ["safer-buffer", new Map([
    ["2.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-safer-buffer-2.1.2-44fa161b0187b9549dd84bb91802f9bd8385cd6a/node_modules/safer-buffer/"),
      packageDependencies: new Map([
        ["safer-buffer", "2.1.2"],
      ]),
    }],
  ])],
  ["bcrypt-pbkdf", new Map([
    ["1.0.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-bcrypt-pbkdf-1.0.2-a4301d389b6a43f9b67ff3ca11a3f6637e360e9e/node_modules/bcrypt-pbkdf/"),
      packageDependencies: new Map([
        ["tweetnacl", "0.14.5"],
        ["bcrypt-pbkdf", "1.0.2"],
      ]),
    }],
  ])],
  ["tweetnacl", new Map([
    ["0.14.5", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-tweetnacl-0.14.5-5ae68177f192d4456269d108afa93ff8743f4f64/node_modules/tweetnacl/"),
      packageDependencies: new Map([
        ["tweetnacl", "0.14.5"],
      ]),
    }],
  ])],
  ["dashdash", new Map([
    ["1.14.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-dashdash-1.14.1-853cfa0f7cbe2fed5de20326b8dd581035f6e2f0/node_modules/dashdash/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
        ["dashdash", "1.14.1"],
      ]),
    }],
  ])],
  ["ecc-jsbn", new Map([
    ["0.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-ecc-jsbn-0.1.2-3a83a904e54353287874c564b7549386849a98c9/node_modules/ecc-jsbn/"),
      packageDependencies: new Map([
        ["jsbn", "0.1.1"],
        ["safer-buffer", "2.1.2"],
        ["ecc-jsbn", "0.1.2"],
      ]),
    }],
  ])],
  ["jsbn", new Map([
    ["0.1.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-jsbn-0.1.1-a5e654c2e5a2deb5f201d96cefbca80c0ef2f513/node_modules/jsbn/"),
      packageDependencies: new Map([
        ["jsbn", "0.1.1"],
      ]),
    }],
  ])],
  ["getpass", new Map([
    ["0.1.7", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-getpass-0.1.7-5eff8e3e684d569ae4cb2b1282604e8ba62149fa/node_modules/getpass/"),
      packageDependencies: new Map([
        ["assert-plus", "1.0.0"],
        ["getpass", "0.1.7"],
      ]),
    }],
  ])],
  ["is-typedarray", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-is-typedarray-1.0.0-e479c80858df0c1b11ddda6940f96011fcda4a9a/node_modules/is-typedarray/"),
      packageDependencies: new Map([
        ["is-typedarray", "1.0.0"],
      ]),
    }],
  ])],
  ["isstream", new Map([
    ["0.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-isstream-0.1.2-47e63f7af55afa6f92e1500e690eb8b8529c099a/node_modules/isstream/"),
      packageDependencies: new Map([
        ["isstream", "0.1.2"],
      ]),
    }],
  ])],
  ["json-stringify-safe", new Map([
    ["5.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-json-stringify-safe-5.0.1-1296a2d58fd45f19a0f6ce01d65701e2c735b6eb/node_modules/json-stringify-safe/"),
      packageDependencies: new Map([
        ["json-stringify-safe", "5.0.1"],
      ]),
    }],
  ])],
  ["oauth-sign", new Map([
    ["0.9.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-oauth-sign-0.9.0-47a7b016baa68b5fa0ecf3dee08a85c679ac6455/node_modules/oauth-sign/"),
      packageDependencies: new Map([
        ["oauth-sign", "0.9.0"],
      ]),
    }],
  ])],
  ["performance-now", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-performance-now-2.1.0-6309f4e0e5fa913ec1c69307ae364b4b377c9e7b/node_modules/performance-now/"),
      packageDependencies: new Map([
        ["performance-now", "2.1.0"],
      ]),
    }],
  ])],
  ["qs", new Map([
    ["6.5.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-qs-6.5.2-cb3ae806e8740444584ef154ce8ee98d403f3e36/node_modules/qs/"),
      packageDependencies: new Map([
        ["qs", "6.5.2"],
      ]),
    }],
  ])],
  ["tough-cookie", new Map([
    ["2.4.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-tough-cookie-2.4.3-53f36da3f47783b0925afa06ff9f3b165280f781/node_modules/tough-cookie/"),
      packageDependencies: new Map([
        ["psl", "1.1.31"],
        ["punycode", "1.4.1"],
        ["tough-cookie", "2.4.3"],
      ]),
    }],
  ])],
  ["psl", new Map([
    ["1.1.31", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-psl-1.1.31-e9aa86d0101b5b105cbe93ac6b784cd547276184/node_modules/psl/"),
      packageDependencies: new Map([
        ["psl", "1.1.31"],
      ]),
    }],
  ])],
  ["tunnel-agent", new Map([
    ["0.6.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-tunnel-agent-0.6.0-27a5dea06b36b04a0a9966774b290868f0fc40fd/node_modules/tunnel-agent/"),
      packageDependencies: new Map([
        ["safe-buffer", "5.1.2"],
        ["tunnel-agent", "0.6.0"],
      ]),
    }],
  ])],
  ["uuid", new Map([
    ["3.3.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-uuid-3.3.2-1b4af4955eb3077c501c23872fc6513811587131/node_modules/uuid/"),
      packageDependencies: new Map([
        ["uuid", "3.3.2"],
      ]),
    }],
  ])],
  ["request-progress", new Map([
    ["2.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-request-progress-2.0.1-5d36bb57961c673aa5b788dbc8141fdf23b44e08/node_modules/request-progress/"),
      packageDependencies: new Map([
        ["throttleit", "1.0.0"],
        ["request-progress", "2.0.1"],
      ]),
    }],
  ])],
  ["throttleit", new Map([
    ["1.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-throttleit-1.0.0-9e785836daf46743145a5984b6268d828528ac6c/node_modules/throttleit/"),
      packageDependencies: new Map([
        ["throttleit", "1.0.0"],
      ]),
    }],
  ])],
  ["which", new Map([
    ["1.3.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-which-1.3.1-a45043d54f5805316da8d62f9f50918d3da70b0a/node_modules/which/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
        ["which", "1.3.1"],
      ]),
    }],
  ])],
  ["isexe", new Map([
    ["2.0.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10/node_modules/isexe/"),
      packageDependencies: new Map([
        ["isexe", "2.0.0"],
      ]),
    }],
  ])],
  ["markdown-it", new Map([
    ["8.4.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-markdown-it-8.4.2-386f98998dc15a37722aa7722084f4020bdd9b54/node_modules/markdown-it/"),
      packageDependencies: new Map([
        ["argparse", "1.0.10"],
        ["entities", "1.1.2"],
        ["linkify-it", "2.1.0"],
        ["mdurl", "1.0.1"],
        ["uc.micro", "1.0.6"],
        ["markdown-it", "8.4.2"],
      ]),
    }],
  ])],
  ["argparse", new Map([
    ["1.0.10", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-argparse-1.0.10-bcd6791ea5ae09725e17e5ad988134cd40b3d911/node_modules/argparse/"),
      packageDependencies: new Map([
        ["sprintf-js", "1.0.3"],
        ["argparse", "1.0.10"],
      ]),
    }],
  ])],
  ["sprintf-js", new Map([
    ["1.0.3", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-sprintf-js-1.0.3-04e6926f662895354f3dd015203633b857297e2c/node_modules/sprintf-js/"),
      packageDependencies: new Map([
        ["sprintf-js", "1.0.3"],
      ]),
    }],
  ])],
  ["entities", new Map([
    ["1.1.2", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-entities-1.1.2-bdfa735299664dfafd34529ed4f8522a275fea56/node_modules/entities/"),
      packageDependencies: new Map([
        ["entities", "1.1.2"],
      ]),
    }],
  ])],
  ["linkify-it", new Map([
    ["2.1.0", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-linkify-it-2.1.0-c4caf38a6cd7ac2212ef3c7d2bde30a91561f9db/node_modules/linkify-it/"),
      packageDependencies: new Map([
        ["uc.micro", "1.0.6"],
        ["linkify-it", "2.1.0"],
      ]),
    }],
  ])],
  ["uc.micro", new Map([
    ["1.0.6", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-uc-micro-1.0.6-9c411a802a409a91fc6cf74081baba34b24499ac/node_modules/uc.micro/"),
      packageDependencies: new Map([
        ["uc.micro", "1.0.6"],
      ]),
    }],
  ])],
  ["mdurl", new Map([
    ["1.0.1", {
      packageLocation: path.resolve(__dirname, "../../.cache/yarn/v4/npm-mdurl-1.0.1-fe85b2ec75a59037f2adfec100fd6c601761152e/node_modules/mdurl/"),
      packageDependencies: new Map([
        ["mdurl", "1.0.1"],
      ]),
    }],
  ])],
  [null, new Map([
    [null, {
      packageLocation: path.resolve(__dirname, "./"),
      packageDependencies: new Map([
        ["handlebars", "4.1.2"],
        ["html-pdf", "2.2.0"],
        ["markdown-it", "8.4.2"],
      ]),
    }],
  ])],
]);

let locatorsByLocations = new Map([
  ["../../.cache/yarn/v4/npm-handlebars-4.1.2-b6b37c1ced0306b221e094fc7aca3ec23b131b67/node_modules/handlebars/", {"name":"handlebars","reference":"4.1.2"}],
  ["../../.cache/yarn/v4/npm-neo-async-2.6.1-ac27ada66167fa8849a6addd837f6b189ad2081c/node_modules/neo-async/", {"name":"neo-async","reference":"2.6.1"}],
  ["../../.cache/yarn/v4/npm-optimist-0.6.1-da3ea74686fa21a19a111c326e90eb15a0196686/node_modules/optimist/", {"name":"optimist","reference":"0.6.1"}],
  ["../../.cache/yarn/v4/npm-minimist-0.0.10-de3f98543dbf96082be48ad1a0c7cda836301dcf/node_modules/minimist/", {"name":"minimist","reference":"0.0.10"}],
  ["../../.cache/yarn/v4/npm-minimist-0.0.8-857fcabfc3397d2625b8228262e86aa7a011b05d/node_modules/minimist/", {"name":"minimist","reference":"0.0.8"}],
  ["../../.cache/yarn/v4/npm-wordwrap-0.0.3-a3d5da6cd5c0bc0008d37234bbaf1bed63059107/node_modules/wordwrap/", {"name":"wordwrap","reference":"0.0.3"}],
  ["../../.cache/yarn/v4/npm-source-map-0.6.1-74722af32e9614e9c287a8d0bbde48b5e2f1a263/node_modules/source-map/", {"name":"source-map","reference":"0.6.1"}],
  ["../../.cache/yarn/v4/npm-uglify-js-3.5.15-fe2b5378fd0b09e116864041437bff889105ce24/node_modules/uglify-js/", {"name":"uglify-js","reference":"3.5.15"}],
  ["../../.cache/yarn/v4/npm-commander-2.20.0-d58bb2b5c1ee8f87b0d340027e9e94e222c5a422/node_modules/commander/", {"name":"commander","reference":"2.20.0"}],
  ["../../.cache/yarn/v4/npm-html-pdf-2.2.0-4bcf91c24cb560e47aa3facfd033e0e1bf241b91/node_modules/html-pdf/", {"name":"html-pdf","reference":"2.2.0"}],
  ["./.pnp/unplugged/npm-phantomjs-prebuilt-2.1.16-efd212a4a3966d3647684ea8ba788549be2aefef/node_modules/phantomjs-prebuilt/", {"name":"phantomjs-prebuilt","reference":"2.1.16"}],
  ["../../.cache/yarn/v4/npm-es6-promise-4.2.6-b685edd8258886365ea62b57d30de28fadcd974f/node_modules/es6-promise/", {"name":"es6-promise","reference":"4.2.6"}],
  ["../../.cache/yarn/v4/npm-extract-zip-1.6.7-a840b4b8af6403264c8db57f4f1a74333ef81fe9/node_modules/extract-zip/", {"name":"extract-zip","reference":"1.6.7"}],
  ["../../.cache/yarn/v4/npm-concat-stream-1.6.2-904bdf194cd3122fc675c77fc4ac3d4ff0fd1a34/node_modules/concat-stream/", {"name":"concat-stream","reference":"1.6.2"}],
  ["../../.cache/yarn/v4/npm-buffer-from-1.1.1-32713bc028f75c02fdb710d7c7bcec1f2c6070ef/node_modules/buffer-from/", {"name":"buffer-from","reference":"1.1.1"}],
  ["../../.cache/yarn/v4/npm-inherits-2.0.3-633c2c83e3da42a502f52466022480f4208261de/node_modules/inherits/", {"name":"inherits","reference":"2.0.3"}],
  ["../../.cache/yarn/v4/npm-readable-stream-2.3.6-b11c27d88b8ff1fbe070643cf94b0c79ae1b0aaf/node_modules/readable-stream/", {"name":"readable-stream","reference":"2.3.6"}],
  ["../../.cache/yarn/v4/npm-core-util-is-1.0.2-b5fd54220aa2bc5ab57aab7140c940754503c1a7/node_modules/core-util-is/", {"name":"core-util-is","reference":"1.0.2"}],
  ["../../.cache/yarn/v4/npm-isarray-1.0.0-bb935d48582cba168c06834957a54a3e07124f11/node_modules/isarray/", {"name":"isarray","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-process-nextick-args-2.0.0-a37d732f4271b4ab1ad070d35508e8290788ffaa/node_modules/process-nextick-args/", {"name":"process-nextick-args","reference":"2.0.0"}],
  ["../../.cache/yarn/v4/npm-safe-buffer-5.1.2-991ec69d296e0313747d59bdfd2b745c35f8828d/node_modules/safe-buffer/", {"name":"safe-buffer","reference":"5.1.2"}],
  ["../../.cache/yarn/v4/npm-string-decoder-1.1.1-9cf1611ba62685d7030ae9e4ba34149c3af03fc8/node_modules/string_decoder/", {"name":"string_decoder","reference":"1.1.1"}],
  ["../../.cache/yarn/v4/npm-util-deprecate-1.0.2-450d4dc9fa70de732762fbd2d4a28981419a0ccf/node_modules/util-deprecate/", {"name":"util-deprecate","reference":"1.0.2"}],
  ["../../.cache/yarn/v4/npm-typedarray-0.0.6-867ac74e3864187b1d3d47d996a78ec5c8830777/node_modules/typedarray/", {"name":"typedarray","reference":"0.0.6"}],
  ["../../.cache/yarn/v4/npm-debug-2.6.9-5d128515df134ff327e90a4c93f4e077a536341f/node_modules/debug/", {"name":"debug","reference":"2.6.9"}],
  ["../../.cache/yarn/v4/npm-ms-2.0.0-5608aeadfc00be6c2901df5f9861788de0d597c8/node_modules/ms/", {"name":"ms","reference":"2.0.0"}],
  ["../../.cache/yarn/v4/npm-mkdirp-0.5.1-30057438eac6cf7f8c4767f38648d6697d75c903/node_modules/mkdirp/", {"name":"mkdirp","reference":"0.5.1"}],
  ["../../.cache/yarn/v4/npm-yauzl-2.4.1-9528f442dab1b2284e58b4379bb194e22e0c4005/node_modules/yauzl/", {"name":"yauzl","reference":"2.4.1"}],
  ["../../.cache/yarn/v4/npm-fd-slicer-1.0.1-8b5bcbd9ec327c5041bf9ab023fd6750f1177e65/node_modules/fd-slicer/", {"name":"fd-slicer","reference":"1.0.1"}],
  ["../../.cache/yarn/v4/npm-pend-1.2.0-7a57eb550a6783f9115331fcf4663d5c8e007a50/node_modules/pend/", {"name":"pend","reference":"1.2.0"}],
  ["../../.cache/yarn/v4/npm-fs-extra-1.0.0-cd3ce5f7e7cb6145883fcae3191e9877f8587950/node_modules/fs-extra/", {"name":"fs-extra","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-graceful-fs-4.1.15-ffb703e1066e8a0eeaa4c8b80ba9253eeefbfb00/node_modules/graceful-fs/", {"name":"graceful-fs","reference":"4.1.15"}],
  ["../../.cache/yarn/v4/npm-jsonfile-2.4.0-3736a2b428b87bbda0cc83b53fa3d633a35c2ae8/node_modules/jsonfile/", {"name":"jsonfile","reference":"2.4.0"}],
  ["../../.cache/yarn/v4/npm-klaw-1.3.1-4088433b46b3b1ba259d78785d8e96f73ba02439/node_modules/klaw/", {"name":"klaw","reference":"1.3.1"}],
  ["../../.cache/yarn/v4/npm-hasha-2.2.0-78d7cbfc1e6d66303fe79837365984517b2f6ee1/node_modules/hasha/", {"name":"hasha","reference":"2.2.0"}],
  ["../../.cache/yarn/v4/npm-is-stream-1.1.0-12d4a3dd4e68e0b79ceb8dbc84173ae80d91ca44/node_modules/is-stream/", {"name":"is-stream","reference":"1.1.0"}],
  ["../../.cache/yarn/v4/npm-pinkie-promise-2.0.1-2135d6dfa7a358c069ac9b178776288228450ffa/node_modules/pinkie-promise/", {"name":"pinkie-promise","reference":"2.0.1"}],
  ["../../.cache/yarn/v4/npm-pinkie-2.0.4-72556b80cfa0d48a974e80e77248e80ed4f7f870/node_modules/pinkie/", {"name":"pinkie","reference":"2.0.4"}],
  ["../../.cache/yarn/v4/npm-kew-0.7.0-79d93d2d33363d6fdd2970b335d9141ad591d79b/node_modules/kew/", {"name":"kew","reference":"0.7.0"}],
  ["../../.cache/yarn/v4/npm-progress-1.1.8-e260c78f6161cdd9b0e56cc3e0a85de17c7a57be/node_modules/progress/", {"name":"progress","reference":"1.1.8"}],
  ["../../.cache/yarn/v4/npm-request-2.88.0-9c2fca4f7d35b592efe57c7f0a55e81052124fef/node_modules/request/", {"name":"request","reference":"2.88.0"}],
  ["../../.cache/yarn/v4/npm-aws-sign2-0.7.0-b46e890934a9591f2d2f6f86d7e6a9f1b3fe76a8/node_modules/aws-sign2/", {"name":"aws-sign2","reference":"0.7.0"}],
  ["../../.cache/yarn/v4/npm-aws4-1.8.0-f0e003d9ca9e7f59c7a508945d7b2ef9a04a542f/node_modules/aws4/", {"name":"aws4","reference":"1.8.0"}],
  ["../../.cache/yarn/v4/npm-caseless-0.12.0-1b681c21ff84033c826543090689420d187151dc/node_modules/caseless/", {"name":"caseless","reference":"0.12.0"}],
  ["../../.cache/yarn/v4/npm-combined-stream-1.0.8-c3d45a8b34fd730631a110a8a2520682b31d5a7f/node_modules/combined-stream/", {"name":"combined-stream","reference":"1.0.8"}],
  ["../../.cache/yarn/v4/npm-delayed-stream-1.0.0-df3ae199acadfb7d440aaae0b29e2272b24ec619/node_modules/delayed-stream/", {"name":"delayed-stream","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-extend-3.0.2-f8b1136b4071fbd8eb140aff858b1019ec2915fa/node_modules/extend/", {"name":"extend","reference":"3.0.2"}],
  ["../../.cache/yarn/v4/npm-forever-agent-0.6.1-fbc71f0c41adeb37f96c577ad1ed42d8fdacca91/node_modules/forever-agent/", {"name":"forever-agent","reference":"0.6.1"}],
  ["../../.cache/yarn/v4/npm-form-data-2.3.3-dcce52c05f644f298c6a7ab936bd724ceffbf3a6/node_modules/form-data/", {"name":"form-data","reference":"2.3.3"}],
  ["../../.cache/yarn/v4/npm-asynckit-0.4.0-c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79/node_modules/asynckit/", {"name":"asynckit","reference":"0.4.0"}],
  ["../../.cache/yarn/v4/npm-mime-types-2.1.24-b6f8d0b3e951efb77dedeca194cff6d16f676f81/node_modules/mime-types/", {"name":"mime-types","reference":"2.1.24"}],
  ["../../.cache/yarn/v4/npm-mime-db-1.40.0-a65057e998db090f732a68f6c276d387d4126c32/node_modules/mime-db/", {"name":"mime-db","reference":"1.40.0"}],
  ["../../.cache/yarn/v4/npm-har-validator-5.1.3-1ef89ebd3e4996557675eed9893110dc350fa080/node_modules/har-validator/", {"name":"har-validator","reference":"5.1.3"}],
  ["../../.cache/yarn/v4/npm-ajv-6.10.0-90d0d54439da587cd7e843bfb7045f50bd22bdf1/node_modules/ajv/", {"name":"ajv","reference":"6.10.0"}],
  ["../../.cache/yarn/v4/npm-fast-deep-equal-2.0.1-7b05218ddf9667bf7f370bf7fdb2cb15fdd0aa49/node_modules/fast-deep-equal/", {"name":"fast-deep-equal","reference":"2.0.1"}],
  ["../../.cache/yarn/v4/npm-fast-json-stable-stringify-2.0.0-d5142c0caee6b1189f87d3a76111064f86c8bbf2/node_modules/fast-json-stable-stringify/", {"name":"fast-json-stable-stringify","reference":"2.0.0"}],
  ["../../.cache/yarn/v4/npm-json-schema-traverse-0.4.1-69f6a87d9513ab8bb8fe63bdb0979c448e684660/node_modules/json-schema-traverse/", {"name":"json-schema-traverse","reference":"0.4.1"}],
  ["../../.cache/yarn/v4/npm-uri-js-4.2.2-94c540e1ff772956e2299507c010aea6c8838eb0/node_modules/uri-js/", {"name":"uri-js","reference":"4.2.2"}],
  ["../../.cache/yarn/v4/npm-punycode-2.1.1-b58b010ac40c22c5657616c8d2c2c02c7bf479ec/node_modules/punycode/", {"name":"punycode","reference":"2.1.1"}],
  ["../../.cache/yarn/v4/npm-punycode-1.4.1-c0d5a63b2718800ad8e1eb0fa5269c84dd41845e/node_modules/punycode/", {"name":"punycode","reference":"1.4.1"}],
  ["../../.cache/yarn/v4/npm-har-schema-2.0.0-a94c2224ebcac04782a0d9035521f24735b7ec92/node_modules/har-schema/", {"name":"har-schema","reference":"2.0.0"}],
  ["../../.cache/yarn/v4/npm-http-signature-1.2.0-9aecd925114772f3d95b65a60abb8f7c18fbace1/node_modules/http-signature/", {"name":"http-signature","reference":"1.2.0"}],
  ["../../.cache/yarn/v4/npm-assert-plus-1.0.0-f12e0f3c5d77b0b1cdd9146942e4e96c1e4dd525/node_modules/assert-plus/", {"name":"assert-plus","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-jsprim-1.4.1-313e66bc1e5cc06e438bc1b7499c2e5c56acb6a2/node_modules/jsprim/", {"name":"jsprim","reference":"1.4.1"}],
  ["../../.cache/yarn/v4/npm-extsprintf-1.3.0-96918440e3041a7a414f8c52e3c574eb3c3e1e05/node_modules/extsprintf/", {"name":"extsprintf","reference":"1.3.0"}],
  ["../../.cache/yarn/v4/npm-extsprintf-1.4.0-e2689f8f356fad62cca65a3a91c5df5f9551692f/node_modules/extsprintf/", {"name":"extsprintf","reference":"1.4.0"}],
  ["../../.cache/yarn/v4/npm-json-schema-0.2.3-b480c892e59a2f05954ce727bd3f2a4e882f9e13/node_modules/json-schema/", {"name":"json-schema","reference":"0.2.3"}],
  ["../../.cache/yarn/v4/npm-verror-1.10.0-3a105ca17053af55d6e270c1f8288682e18da400/node_modules/verror/", {"name":"verror","reference":"1.10.0"}],
  ["../../.cache/yarn/v4/npm-sshpk-1.16.1-fb661c0bef29b39db40769ee39fa70093d6f6877/node_modules/sshpk/", {"name":"sshpk","reference":"1.16.1"}],
  ["../../.cache/yarn/v4/npm-asn1-0.2.4-8d2475dfab553bb33e77b54e59e880bb8ce23136/node_modules/asn1/", {"name":"asn1","reference":"0.2.4"}],
  ["../../.cache/yarn/v4/npm-safer-buffer-2.1.2-44fa161b0187b9549dd84bb91802f9bd8385cd6a/node_modules/safer-buffer/", {"name":"safer-buffer","reference":"2.1.2"}],
  ["../../.cache/yarn/v4/npm-bcrypt-pbkdf-1.0.2-a4301d389b6a43f9b67ff3ca11a3f6637e360e9e/node_modules/bcrypt-pbkdf/", {"name":"bcrypt-pbkdf","reference":"1.0.2"}],
  ["../../.cache/yarn/v4/npm-tweetnacl-0.14.5-5ae68177f192d4456269d108afa93ff8743f4f64/node_modules/tweetnacl/", {"name":"tweetnacl","reference":"0.14.5"}],
  ["../../.cache/yarn/v4/npm-dashdash-1.14.1-853cfa0f7cbe2fed5de20326b8dd581035f6e2f0/node_modules/dashdash/", {"name":"dashdash","reference":"1.14.1"}],
  ["../../.cache/yarn/v4/npm-ecc-jsbn-0.1.2-3a83a904e54353287874c564b7549386849a98c9/node_modules/ecc-jsbn/", {"name":"ecc-jsbn","reference":"0.1.2"}],
  ["../../.cache/yarn/v4/npm-jsbn-0.1.1-a5e654c2e5a2deb5f201d96cefbca80c0ef2f513/node_modules/jsbn/", {"name":"jsbn","reference":"0.1.1"}],
  ["../../.cache/yarn/v4/npm-getpass-0.1.7-5eff8e3e684d569ae4cb2b1282604e8ba62149fa/node_modules/getpass/", {"name":"getpass","reference":"0.1.7"}],
  ["../../.cache/yarn/v4/npm-is-typedarray-1.0.0-e479c80858df0c1b11ddda6940f96011fcda4a9a/node_modules/is-typedarray/", {"name":"is-typedarray","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-isstream-0.1.2-47e63f7af55afa6f92e1500e690eb8b8529c099a/node_modules/isstream/", {"name":"isstream","reference":"0.1.2"}],
  ["../../.cache/yarn/v4/npm-json-stringify-safe-5.0.1-1296a2d58fd45f19a0f6ce01d65701e2c735b6eb/node_modules/json-stringify-safe/", {"name":"json-stringify-safe","reference":"5.0.1"}],
  ["../../.cache/yarn/v4/npm-oauth-sign-0.9.0-47a7b016baa68b5fa0ecf3dee08a85c679ac6455/node_modules/oauth-sign/", {"name":"oauth-sign","reference":"0.9.0"}],
  ["../../.cache/yarn/v4/npm-performance-now-2.1.0-6309f4e0e5fa913ec1c69307ae364b4b377c9e7b/node_modules/performance-now/", {"name":"performance-now","reference":"2.1.0"}],
  ["../../.cache/yarn/v4/npm-qs-6.5.2-cb3ae806e8740444584ef154ce8ee98d403f3e36/node_modules/qs/", {"name":"qs","reference":"6.5.2"}],
  ["../../.cache/yarn/v4/npm-tough-cookie-2.4.3-53f36da3f47783b0925afa06ff9f3b165280f781/node_modules/tough-cookie/", {"name":"tough-cookie","reference":"2.4.3"}],
  ["../../.cache/yarn/v4/npm-psl-1.1.31-e9aa86d0101b5b105cbe93ac6b784cd547276184/node_modules/psl/", {"name":"psl","reference":"1.1.31"}],
  ["../../.cache/yarn/v4/npm-tunnel-agent-0.6.0-27a5dea06b36b04a0a9966774b290868f0fc40fd/node_modules/tunnel-agent/", {"name":"tunnel-agent","reference":"0.6.0"}],
  ["../../.cache/yarn/v4/npm-uuid-3.3.2-1b4af4955eb3077c501c23872fc6513811587131/node_modules/uuid/", {"name":"uuid","reference":"3.3.2"}],
  ["../../.cache/yarn/v4/npm-request-progress-2.0.1-5d36bb57961c673aa5b788dbc8141fdf23b44e08/node_modules/request-progress/", {"name":"request-progress","reference":"2.0.1"}],
  ["../../.cache/yarn/v4/npm-throttleit-1.0.0-9e785836daf46743145a5984b6268d828528ac6c/node_modules/throttleit/", {"name":"throttleit","reference":"1.0.0"}],
  ["../../.cache/yarn/v4/npm-which-1.3.1-a45043d54f5805316da8d62f9f50918d3da70b0a/node_modules/which/", {"name":"which","reference":"1.3.1"}],
  ["../../.cache/yarn/v4/npm-isexe-2.0.0-e8fbf374dc556ff8947a10dcb0572d633f2cfa10/node_modules/isexe/", {"name":"isexe","reference":"2.0.0"}],
  ["../../.cache/yarn/v4/npm-markdown-it-8.4.2-386f98998dc15a37722aa7722084f4020bdd9b54/node_modules/markdown-it/", {"name":"markdown-it","reference":"8.4.2"}],
  ["../../.cache/yarn/v4/npm-argparse-1.0.10-bcd6791ea5ae09725e17e5ad988134cd40b3d911/node_modules/argparse/", {"name":"argparse","reference":"1.0.10"}],
  ["../../.cache/yarn/v4/npm-sprintf-js-1.0.3-04e6926f662895354f3dd015203633b857297e2c/node_modules/sprintf-js/", {"name":"sprintf-js","reference":"1.0.3"}],
  ["../../.cache/yarn/v4/npm-entities-1.1.2-bdfa735299664dfafd34529ed4f8522a275fea56/node_modules/entities/", {"name":"entities","reference":"1.1.2"}],
  ["../../.cache/yarn/v4/npm-linkify-it-2.1.0-c4caf38a6cd7ac2212ef3c7d2bde30a91561f9db/node_modules/linkify-it/", {"name":"linkify-it","reference":"2.1.0"}],
  ["../../.cache/yarn/v4/npm-uc-micro-1.0.6-9c411a802a409a91fc6cf74081baba34b24499ac/node_modules/uc.micro/", {"name":"uc.micro","reference":"1.0.6"}],
  ["../../.cache/yarn/v4/npm-mdurl-1.0.1-fe85b2ec75a59037f2adfec100fd6c601761152e/node_modules/mdurl/", {"name":"mdurl","reference":"1.0.1"}],
  ["./", topLevelLocator],
]);
exports.findPackageLocator = function findPackageLocator(location) {
  let relativeLocation = normalizePath(path.relative(__dirname, location));

  if (!relativeLocation.match(isStrictRegExp))
    relativeLocation = `./${relativeLocation}`;

  if (location.match(isDirRegExp) && relativeLocation.charAt(relativeLocation.length - 1) !== '/')
    relativeLocation = `${relativeLocation}/`;

  let match;

  if (relativeLocation.length >= 139 && relativeLocation[138] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 139)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 127 && relativeLocation[126] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 127)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 125 && relativeLocation[124] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 125)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 120 && relativeLocation[119] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 120)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 119 && relativeLocation[118] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 119)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 117 && relativeLocation[116] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 117)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 115 && relativeLocation[114] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 115)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 113 && relativeLocation[112] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 113)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 111 && relativeLocation[110] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 111)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 110 && relativeLocation[109] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 110)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 109 && relativeLocation[108] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 109)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 108 && relativeLocation[107] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 108)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 107 && relativeLocation[106] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 107)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 106 && relativeLocation[105] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 106)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 105 && relativeLocation[104] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 105)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 104 && relativeLocation[103] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 104)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 103 && relativeLocation[102] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 103)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 102 && relativeLocation[101] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 102)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 101 && relativeLocation[100] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 101)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 100 && relativeLocation[99] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 100)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 99 && relativeLocation[98] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 99)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 98 && relativeLocation[97] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 98)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 97 && relativeLocation[96] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 97)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 95 && relativeLocation[94] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 95)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 94 && relativeLocation[93] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 94)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 93 && relativeLocation[92] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 93)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 91 && relativeLocation[90] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 91)))
      return blacklistCheck(match);

  if (relativeLocation.length >= 2 && relativeLocation[1] === '/')
    if (match = locatorsByLocations.get(relativeLocation.substr(0, 2)))
      return blacklistCheck(match);

  return null;
};


/**
 * Returns the module that should be used to resolve require calls. It's usually the direct parent, except if we're
 * inside an eval expression.
 */

function getIssuerModule(parent) {
  let issuer = parent;

  while (issuer && (issuer.id === '[eval]' || issuer.id === '<repl>' || !issuer.filename)) {
    issuer = issuer.parent;
  }

  return issuer;
}

/**
 * Returns information about a package in a safe way (will throw if they cannot be retrieved)
 */

function getPackageInformationSafe(packageLocator) {
  const packageInformation = exports.getPackageInformation(packageLocator);

  if (!packageInformation) {
    throw makeError(
      `INTERNAL`,
      `Couldn't find a matching entry in the dependency tree for the specified parent (this is probably an internal error)`
    );
  }

  return packageInformation;
}

/**
 * Implements the node resolution for folder access and extension selection
 */

function applyNodeExtensionResolution(unqualifiedPath, {extensions}) {
  // We use this "infinite while" so that we can restart the process as long as we hit package folders
  while (true) {
    let stat;

    try {
      stat = statSync(unqualifiedPath);
    } catch (error) {}

    // If the file exists and is a file, we can stop right there

    if (stat && !stat.isDirectory()) {
      // If the very last component of the resolved path is a symlink to a file, we then resolve it to a file. We only
      // do this first the last component, and not the rest of the path! This allows us to support the case of bin
      // symlinks, where a symlink in "/xyz/pkg-name/.bin/bin-name" will point somewhere else (like "/xyz/pkg-name/index.js").
      // In such a case, we want relative requires to be resolved relative to "/xyz/pkg-name/" rather than "/xyz/pkg-name/.bin/".
      //
      // Also note that the reason we must use readlink on the last component (instead of realpath on the whole path)
      // is that we must preserve the other symlinks, in particular those used by pnp to deambiguate packages using
      // peer dependencies. For example, "/xyz/.pnp/local/pnp-01234569/.bin/bin-name" should see its relative requires
      // be resolved relative to "/xyz/.pnp/local/pnp-0123456789/" rather than "/xyz/pkg-with-peers/", because otherwise
      // we would lose the information that would tell us what are the dependencies of pkg-with-peers relative to its
      // ancestors.

      if (lstatSync(unqualifiedPath).isSymbolicLink()) {
        unqualifiedPath = path.normalize(path.resolve(path.dirname(unqualifiedPath), readlinkSync(unqualifiedPath)));
      }

      return unqualifiedPath;
    }

    // If the file is a directory, we must check if it contains a package.json with a "main" entry

    if (stat && stat.isDirectory()) {
      let pkgJson;

      try {
        pkgJson = JSON.parse(readFileSync(`${unqualifiedPath}/package.json`, 'utf-8'));
      } catch (error) {}

      let nextUnqualifiedPath;

      if (pkgJson && pkgJson.main) {
        nextUnqualifiedPath = path.resolve(unqualifiedPath, pkgJson.main);
      }

      // If the "main" field changed the path, we start again from this new location

      if (nextUnqualifiedPath && nextUnqualifiedPath !== unqualifiedPath) {
        const resolution = applyNodeExtensionResolution(nextUnqualifiedPath, {extensions});

        if (resolution !== null) {
          return resolution;
        }
      }
    }

    // Otherwise we check if we find a file that match one of the supported extensions

    const qualifiedPath = extensions
      .map(extension => {
        return `${unqualifiedPath}${extension}`;
      })
      .find(candidateFile => {
        return existsSync(candidateFile);
      });

    if (qualifiedPath) {
      return qualifiedPath;
    }

    // Otherwise, we check if the path is a folder - in such a case, we try to use its index

    if (stat && stat.isDirectory()) {
      const indexPath = extensions
        .map(extension => {
          return `${unqualifiedPath}/index${extension}`;
        })
        .find(candidateFile => {
          return existsSync(candidateFile);
        });

      if (indexPath) {
        return indexPath;
      }
    }

    // Otherwise there's nothing else we can do :(

    return null;
  }
}

/**
 * This function creates fake modules that can be used with the _resolveFilename function.
 * Ideally it would be nice to be able to avoid this, since it causes useless allocations
 * and cannot be cached efficiently (we recompute the nodeModulePaths every time).
 *
 * Fortunately, this should only affect the fallback, and there hopefully shouldn't be a
 * lot of them.
 */

function makeFakeModule(path) {
  const fakeModule = new Module(path, false);
  fakeModule.filename = path;
  fakeModule.paths = Module._nodeModulePaths(path);
  return fakeModule;
}

/**
 * Normalize path to posix format.
 */

function normalizePath(fsPath) {
  fsPath = path.normalize(fsPath);

  if (process.platform === 'win32') {
    fsPath = fsPath.replace(backwardSlashRegExp, '/');
  }

  return fsPath;
}

/**
 * Forward the resolution to the next resolver (usually the native one)
 */

function callNativeResolution(request, issuer) {
  if (issuer.endsWith('/')) {
    issuer += 'internal.js';
  }

  try {
    enableNativeHooks = false;

    // Since we would need to create a fake module anyway (to call _resolveLookupPath that
    // would give us the paths to give to _resolveFilename), we can as well not use
    // the {paths} option at all, since it internally makes _resolveFilename create another
    // fake module anyway.
    return Module._resolveFilename(request, makeFakeModule(issuer), false);
  } finally {
    enableNativeHooks = true;
  }
}

/**
 * This key indicates which version of the standard is implemented by this resolver. The `std` key is the
 * Plug'n'Play standard, and any other key are third-party extensions. Third-party extensions are not allowed
 * to override the standard, and can only offer new methods.
 *
 * If an new version of the Plug'n'Play standard is released and some extensions conflict with newly added
 * functions, they'll just have to fix the conflicts and bump their own version number.
 */

exports.VERSIONS = {std: 1};

/**
 * Useful when used together with getPackageInformation to fetch information about the top-level package.
 */

exports.topLevel = {name: null, reference: null};

/**
 * Gets the package information for a given locator. Returns null if they cannot be retrieved.
 */

exports.getPackageInformation = function getPackageInformation({name, reference}) {
  const packageInformationStore = packageInformationStores.get(name);

  if (!packageInformationStore) {
    return null;
  }

  const packageInformation = packageInformationStore.get(reference);

  if (!packageInformation) {
    return null;
  }

  return packageInformation;
};

/**
 * Transforms a request (what's typically passed as argument to the require function) into an unqualified path.
 * This path is called "unqualified" because it only changes the package name to the package location on the disk,
 * which means that the end result still cannot be directly accessed (for example, it doesn't try to resolve the
 * file extension, or to resolve directories to their "index.js" content). Use the "resolveUnqualified" function
 * to convert them to fully-qualified paths, or just use "resolveRequest" that do both operations in one go.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveToUnqualified = function resolveToUnqualified(request, issuer, {considerBuiltins = true} = {}) {
  // The 'pnpapi' request is reserved and will always return the path to the PnP file, from everywhere

  if (request === `pnpapi`) {
    return pnpFile;
  }

  // Bailout if the request is a native module

  if (considerBuiltins && builtinModules.has(request)) {
    return null;
  }

  // We allow disabling the pnp resolution for some subpaths. This is because some projects, often legacy,
  // contain multiple levels of dependencies (ie. a yarn.lock inside a subfolder of a yarn.lock). This is
  // typically solved using workspaces, but not all of them have been converted already.

  if (ignorePattern && ignorePattern.test(normalizePath(issuer))) {
    const result = callNativeResolution(request, issuer);

    if (result === false) {
      throw makeError(
        `BUILTIN_NODE_RESOLUTION_FAIL`,
        `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer was explicitely ignored by the regexp "null")`,
        {
          request,
          issuer,
        }
      );
    }

    return result;
  }

  let unqualifiedPath;

  // If the request is a relative or absolute path, we just return it normalized

  const dependencyNameMatch = request.match(pathRegExp);

  if (!dependencyNameMatch) {
    if (path.isAbsolute(request)) {
      unqualifiedPath = path.normalize(request);
    } else if (issuer.match(isDirRegExp)) {
      unqualifiedPath = path.normalize(path.resolve(issuer, request));
    } else {
      unqualifiedPath = path.normalize(path.resolve(path.dirname(issuer), request));
    }
  }

  // Things are more hairy if it's a package require - we then need to figure out which package is needed, and in
  // particular the exact version for the given location on the dependency tree

  if (dependencyNameMatch) {
    const [, dependencyName, subPath] = dependencyNameMatch;

    const issuerLocator = exports.findPackageLocator(issuer);

    // If the issuer file doesn't seem to be owned by a package managed through pnp, then we resort to using the next
    // resolution algorithm in the chain, usually the native Node resolution one

    if (!issuerLocator) {
      const result = callNativeResolution(request, issuer);

      if (result === false) {
        throw makeError(
          `BUILTIN_NODE_RESOLUTION_FAIL`,
          `The builtin node resolution algorithm was unable to resolve the module referenced by "${request}" and requested from "${issuer}" (it didn't go through the pnp resolver because the issuer doesn't seem to be part of the Yarn-managed dependency tree)`,
          {
            request,
            issuer,
          }
        );
      }

      return result;
    }

    const issuerInformation = getPackageInformationSafe(issuerLocator);

    // We obtain the dependency reference in regard to the package that request it

    let dependencyReference = issuerInformation.packageDependencies.get(dependencyName);

    // If we can't find it, we check if we can potentially load it from the packages that have been defined as potential fallbacks.
    // It's a bit of a hack, but it improves compatibility with the existing Node ecosystem. Hopefully we should eventually be able
    // to kill this logic and become stricter once pnp gets enough traction and the affected packages fix themselves.

    if (issuerLocator !== topLevelLocator) {
      for (let t = 0, T = fallbackLocators.length; dependencyReference === undefined && t < T; ++t) {
        const fallbackInformation = getPackageInformationSafe(fallbackLocators[t]);
        dependencyReference = fallbackInformation.packageDependencies.get(dependencyName);
      }
    }

    // If we can't find the path, and if the package making the request is the top-level, we can offer nicer error messages

    if (!dependencyReference) {
      if (dependencyReference === null) {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `You seem to be requiring a peer dependency ("${dependencyName}"), but it is not installed (which might be because you're the top-level package)`,
            {request, issuer, dependencyName}
          );
        } else {
          throw makeError(
            `MISSING_PEER_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" is trying to access a peer dependency ("${dependencyName}") that should be provided by its direct ancestor but isn't`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName}
          );
        }
      } else {
        if (issuerLocator === topLevelLocator) {
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `You cannot require a package ("${dependencyName}") that is not declared in your dependencies (via "${issuer}")`,
            {request, issuer, dependencyName}
          );
        } else {
          const candidates = Array.from(issuerInformation.packageDependencies.keys());
          throw makeError(
            `UNDECLARED_DEPENDENCY`,
            `Package "${issuerLocator.name}@${issuerLocator.reference}" (via "${issuer}") is trying to require the package "${dependencyName}" (via "${request}") without it being listed in its dependencies (${candidates.join(
              `, `
            )})`,
            {request, issuer, issuerLocator: Object.assign({}, issuerLocator), dependencyName, candidates}
          );
        }
      }
    }

    // We need to check that the package exists on the filesystem, because it might not have been installed

    const dependencyLocator = {name: dependencyName, reference: dependencyReference};
    const dependencyInformation = exports.getPackageInformation(dependencyLocator);
    const dependencyLocation = path.resolve(__dirname, dependencyInformation.packageLocation);

    if (!dependencyLocation) {
      throw makeError(
        `MISSING_DEPENDENCY`,
        `Package "${dependencyLocator.name}@${dependencyLocator.reference}" is a valid dependency, but hasn't been installed and thus cannot be required (it might be caused if you install a partial tree, such as on production environments)`,
        {request, issuer, dependencyLocator: Object.assign({}, dependencyLocator)}
      );
    }

    // Now that we know which package we should resolve to, we only have to find out the file location

    if (subPath) {
      unqualifiedPath = path.resolve(dependencyLocation, subPath);
    } else {
      unqualifiedPath = dependencyLocation;
    }
  }

  return path.normalize(unqualifiedPath);
};

/**
 * Transforms an unqualified path into a qualified path by using the Node resolution algorithm (which automatically
 * appends ".js" / ".json", and transforms directory accesses into "index.js").
 */

exports.resolveUnqualified = function resolveUnqualified(
  unqualifiedPath,
  {extensions = Object.keys(Module._extensions)} = {}
) {
  const qualifiedPath = applyNodeExtensionResolution(unqualifiedPath, {extensions});

  if (qualifiedPath) {
    return path.normalize(qualifiedPath);
  } else {
    throw makeError(
      `QUALIFIED_PATH_RESOLUTION_FAILED`,
      `Couldn't find a suitable Node resolution for unqualified path "${unqualifiedPath}"`,
      {unqualifiedPath}
    );
  }
};

/**
 * Transforms a request into a fully qualified path.
 *
 * Note that it is extremely important that the `issuer` path ends with a forward slash if the issuer is to be
 * treated as a folder (ie. "/tmp/foo/" rather than "/tmp/foo" if "foo" is a directory). Otherwise relative
 * imports won't be computed correctly (they'll get resolved relative to "/tmp/" instead of "/tmp/foo/").
 */

exports.resolveRequest = function resolveRequest(request, issuer, {considerBuiltins, extensions} = {}) {
  let unqualifiedPath;

  try {
    unqualifiedPath = exports.resolveToUnqualified(request, issuer, {considerBuiltins});
  } catch (originalError) {
    // If we get a BUILTIN_NODE_RESOLUTION_FAIL error there, it means that we've had to use the builtin node
    // resolution, which usually shouldn't happen. It might be because the user is trying to require something
    // from a path loaded through a symlink (which is not possible, because we need something normalized to
    // figure out which package is making the require call), so we try to make the same request using a fully
    // resolved issuer and throws a better and more actionable error if it works.
    if (originalError.code === `BUILTIN_NODE_RESOLUTION_FAIL`) {
      let realIssuer;

      try {
        realIssuer = realpathSync(issuer);
      } catch (error) {}

      if (realIssuer) {
        if (issuer.endsWith(`/`)) {
          realIssuer = realIssuer.replace(/\/?$/, `/`);
        }

        try {
          exports.resolveToUnqualified(request, realIssuer, {considerBuiltins});
        } catch (error) {
          // If an error was thrown, the problem doesn't seem to come from a path not being normalized, so we
          // can just throw the original error which was legit.
          throw originalError;
        }

        // If we reach this stage, it means that resolveToUnqualified didn't fail when using the fully resolved
        // file path, which is very likely caused by a module being invoked through Node with a path not being
        // correctly normalized (ie you should use "node $(realpath script.js)" instead of "node script.js").
        throw makeError(
          `SYMLINKED_PATH_DETECTED`,
          `A pnp module ("${request}") has been required from what seems to be a symlinked path ("${issuer}"). This is not possible, you must ensure that your modules are invoked through their fully resolved path on the filesystem (in this case "${realIssuer}").`,
          {
            request,
            issuer,
            realIssuer,
          }
        );
      }
    }
    throw originalError;
  }

  if (unqualifiedPath === null) {
    return null;
  }

  try {
    return exports.resolveUnqualified(unqualifiedPath, {extensions});
  } catch (resolutionError) {
    if (resolutionError.code === 'QUALIFIED_PATH_RESOLUTION_FAILED') {
      Object.assign(resolutionError.data, {request, issuer});
    }
    throw resolutionError;
  }
};

/**
 * Setups the hook into the Node environment.
 *
 * From this point on, any call to `require()` will go through the "resolveRequest" function, and the result will
 * be used as path of the file to load.
 */

exports.setup = function setup() {
  // A small note: we don't replace the cache here (and instead use the native one). This is an effort to not
  // break code similar to "delete require.cache[require.resolve(FOO)]", where FOO is a package located outside
  // of the Yarn dependency tree. In this case, we defer the load to the native loader. If we were to replace the
  // cache by our own, the native loader would populate its own cache, which wouldn't be exposed anymore, so the
  // delete call would be broken.

  const originalModuleLoad = Module._load;

  Module._load = function(request, parent, isMain) {
    if (!enableNativeHooks) {
      return originalModuleLoad.call(Module, request, parent, isMain);
    }

    // Builtins are managed by the regular Node loader

    if (builtinModules.has(request)) {
      try {
        enableNativeHooks = false;
        return originalModuleLoad.call(Module, request, parent, isMain);
      } finally {
        enableNativeHooks = true;
      }
    }

    // The 'pnpapi' name is reserved to return the PnP api currently in use by the program

    if (request === `pnpapi`) {
      return pnpModule.exports;
    }

    // Request `Module._resolveFilename` (ie. `resolveRequest`) to tell us which file we should load

    const modulePath = Module._resolveFilename(request, parent, isMain);

    // Check if the module has already been created for the given file

    const cacheEntry = Module._cache[modulePath];

    if (cacheEntry) {
      return cacheEntry.exports;
    }

    // Create a new module and store it into the cache

    const module = new Module(modulePath, parent);
    Module._cache[modulePath] = module;

    // The main module is exposed as global variable

    if (isMain) {
      process.mainModule = module;
      module.id = '.';
    }

    // Try to load the module, and remove it from the cache if it fails

    let hasThrown = true;

    try {
      module.load(modulePath);
      hasThrown = false;
    } finally {
      if (hasThrown) {
        delete Module._cache[modulePath];
      }
    }

    // Some modules might have to be patched for compatibility purposes

    for (const [filter, patchFn] of patchedModules) {
      if (filter.test(request)) {
        module.exports = patchFn(exports.findPackageLocator(parent.filename), module.exports);
      }
    }

    return module.exports;
  };

  const originalModuleResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function(request, parent, isMain, options) {
    if (!enableNativeHooks) {
      return originalModuleResolveFilename.call(Module, request, parent, isMain, options);
    }

    let issuers;

    if (options) {
      const optionNames = new Set(Object.keys(options));
      optionNames.delete('paths');

      if (optionNames.size > 0) {
        throw makeError(
          `UNSUPPORTED`,
          `Some options passed to require() aren't supported by PnP yet (${Array.from(optionNames).join(', ')})`
        );
      }

      if (options.paths) {
        issuers = options.paths.map(entry => `${path.normalize(entry)}/`);
      }
    }

    if (!issuers) {
      const issuerModule = getIssuerModule(parent);
      const issuer = issuerModule ? issuerModule.filename : `${process.cwd()}/`;

      issuers = [issuer];
    }

    let firstError;

    for (const issuer of issuers) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, issuer);
      } catch (error) {
        firstError = firstError || error;
        continue;
      }

      return resolution !== null ? resolution : request;
    }

    throw firstError;
  };

  const originalFindPath = Module._findPath;

  Module._findPath = function(request, paths, isMain) {
    if (!enableNativeHooks) {
      return originalFindPath.call(Module, request, paths, isMain);
    }

    for (const path of paths) {
      let resolution;

      try {
        resolution = exports.resolveRequest(request, path);
      } catch (error) {
        continue;
      }

      if (resolution) {
        return resolution;
      }
    }

    return false;
  };

  process.versions.pnp = String(exports.VERSIONS.std);
};

exports.setupCompatibilityLayer = () => {
  // ESLint currently doesn't have any portable way for shared configs to specify their own
  // plugins that should be used (https://github.com/eslint/eslint/issues/10125). This will
  // likely get fixed at some point, but it'll take time and in the meantime we'll just add
  // additional fallback entries for common shared configs.

  for (const name of [`react-scripts`]) {
    const packageInformationStore = packageInformationStores.get(name);
    if (packageInformationStore) {
      for (const reference of packageInformationStore.keys()) {
        fallbackLocators.push({name, reference});
      }
    }
  }

  // Modern versions of `resolve` support a specific entry point that custom resolvers can use
  // to inject a specific resolution logic without having to patch the whole package.
  //
  // Cf: https://github.com/browserify/resolve/pull/174

  patchedModules.push([
    /^\.\/normalize-options\.js$/,
    (issuer, normalizeOptions) => {
      if (!issuer || issuer.name !== 'resolve') {
        return normalizeOptions;
      }

      return (request, opts) => {
        opts = opts || {};

        if (opts.forceNodeResolution) {
          return opts;
        }

        opts.preserveSymlinks = true;
        opts.paths = function(request, basedir, getNodeModulesDir, opts) {
          // Extract the name of the package being requested (1=full name, 2=scope name, 3=local name)
          const parts = request.match(/^((?:(@[^\/]+)\/)?([^\/]+))/);

          // make sure that basedir ends with a slash
          if (basedir.charAt(basedir.length - 1) !== '/') {
            basedir = path.join(basedir, '/');
          }
          // This is guaranteed to return the path to the "package.json" file from the given package
          const manifestPath = exports.resolveToUnqualified(`${parts[1]}/package.json`, basedir);

          // The first dirname strips the package.json, the second strips the local named folder
          let nodeModules = path.dirname(path.dirname(manifestPath));

          // Strips the scope named folder if needed
          if (parts[2]) {
            nodeModules = path.dirname(nodeModules);
          }

          return [nodeModules];
        };

        return opts;
      };
    },
  ]);
};

if (module.parent && module.parent.id === 'internal/preload') {
  exports.setupCompatibilityLayer();

  exports.setup();
}

if (process.mainModule === module) {
  exports.setupCompatibilityLayer();

  const reportError = (code, message, data) => {
    process.stdout.write(`${JSON.stringify([{code, message, data}, null])}\n`);
  };

  const reportSuccess = resolution => {
    process.stdout.write(`${JSON.stringify([null, resolution])}\n`);
  };

  const processResolution = (request, issuer) => {
    try {
      reportSuccess(exports.resolveRequest(request, issuer));
    } catch (error) {
      reportError(error.code, error.message, error.data);
    }
  };

  const processRequest = data => {
    try {
      const [request, issuer] = JSON.parse(data);
      processResolution(request, issuer);
    } catch (error) {
      reportError(`INVALID_JSON`, error.message, error.data);
    }
  };

  if (process.argv.length > 2) {
    if (process.argv.length !== 4) {
      process.stderr.write(`Usage: ${process.argv[0]} ${process.argv[1]} <request> <issuer>\n`);
      process.exitCode = 64; /* EX_USAGE */
    } else {
      processResolution(process.argv[2], process.argv[3]);
    }
  } else {
    let buffer = '';
    const decoder = new StringDecoder.StringDecoder();

    process.stdin.on('data', chunk => {
      buffer += decoder.write(chunk);

      do {
        const index = buffer.indexOf('\n');
        if (index === -1) {
          break;
        }

        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);

        processRequest(line);
      } while (true);
    });
  }
}
