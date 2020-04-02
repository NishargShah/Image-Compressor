const path = require('path');

exports.rootPath = path.dirname(require.main.filename || process.mainModule.filename);

exports.baseURL = req => `${req.protocol}://${req.get('host')}`;
