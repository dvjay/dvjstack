var jsf = require('json-schema-faker');
var faker = require('faker');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var jsonDir = ".tools/mock/json/";
var schemaDir = "./tools/mock/schema/";
var schemaDirRel = "./schema/";

jsf.format('pastDate', () => moment(faker.date.past()).format('YYYY-MM-DD'));

var jsonDirPath = path.resolve(jsonDir);
if(!fs.existsSync(jsonDirPath)) {
    fs.mkdirSync(jsonDirPath);
}

fs.readdirSync(schemaDir).forEach(fileName => {
    if(path.parse(fileName).ext == ".js") {
        var jsObj = require(schemaDirRel + fileName);
        var jsonData = JSON.stringify(jsf.generate(jsObj));
        fs.writeFile(jsonDir + path.parse(fileName).name + ".json", jsonData, { flag: 'w' }, function(err) {
            if(err) {
                return console.log(err);
            } else {
                console.log(fileName + " - Mock data generated.");
            }
        });
    }
})