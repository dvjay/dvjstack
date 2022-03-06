const path = require('path');
const fs = require('fs');

const jsonDirectory = path.resolve(__dirname, '../json');

module.exports = function() {
    const files = fs.readdirSync(jsonDirectory);
    let data = {};

    files.forEach((file) => {
        if(file.indexOf('.json') > -1) {
            Object.assign(data, require(jsonDirectory + "/" + file));
        }
    });
    return data;
}