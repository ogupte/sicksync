#! /usr/bin/env node

/**
 *  Sick Sync
 *
 *  Entry point for the syncin' script. This will run
 *  EVERYTIME a sync is kicked off.
 */
var fs = require('fs-extra'),
    program = require('commander'),
    Spinner = require('clui').Spinner,
    util = require('./lib/util'),
    package = require('./package.json'),
    bigSync = require('./lib/rsync'),
    configPath = util.getConfigPath(),
    hasSetup = fs.existsSync(configPath),
    config = null;

require('colors');

program
    .version(package.version)
    .option('-s, --setup', 'Runs the sicksync setup wizard (happens automatically the first time)')
    .option('-d, --debug <boolean>', 'Turns on debug messages during sicksyncs', util.toBoolean)
    .option('-e, --encrypt <boolean>', 'Turns on encryption for sicksync messages', util.toBoolean)
    .option('-C, --configure', 'Opens the config file in your chosen editor')
    .option('-c, --copy', 'Runs a one-time sync')
    .parse(process.argv);

if (program.setup || !hasSetup) {
    return require('./lib/setup/index');
}

if (hasSetup) {
    config = require(configPath);

    if (typeof program.encrypt !== 'undefined') {
        config.prefersEncrypted = program.encrypt;
        return util.writeConfig(config);
    }

    if (typeof program.debug !== 'undefined') {
        config.debug = program.debug;
        return util.writeConfig(config);
    }

    if (program.configure) {
        return util.open(configPath);
    }

    if (program.copy) {
        var countdown = new Spinner('Syncing...');
        countdown.start();
        return bigSync(function() {
            countdown.stop();
            console.log('Finished!'.green);
        });
    }

    return require('./bin/local.js');
}