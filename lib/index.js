var $ = require('./core');
$.ext(require('./collection'));
$.ext(require('./array'));
$.ext(require('./object'));
$.ext(require('./func'));
$.ext(require('./string'));
$.ext(require('./misc'));
$.ext(require('./async'));
module.exports = $;