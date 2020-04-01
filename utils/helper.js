const path = require('path');

exports.rootPath = path.dirname(require.main.filename || process.mainModule.filename);

exports.baseURL = req => `${req.protocol}://${req.get('host')}`;

exports.filterBody = (body, addField = null, deleteField = null, fields = true) => {
    let fieldObj;
    if (Array.isArray(fields)) {
        fieldObj = fields;
    } else {
        const allowedFields = ['username', 'email', 'enrollment', 'password', 'semester', 'fullName'];
        fieldObj = addField !== null ? [...allowedFields, ...addField] : allowedFields;
        fieldObj = deleteField !== null ? fieldObj.filter(cur => !deleteField.includes(cur)) : fieldObj;
    }

    const newBody = {};
    Object.keys(body).forEach(cur => {
        if (fieldObj.includes(cur)) newBody[cur] = body[cur];
    });
    return newBody;
};
