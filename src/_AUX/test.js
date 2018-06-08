const package = require('./Package');

(async () => {
    console.log(await package.search('driver', 'Driver Default', '1.0.0'));
})();
