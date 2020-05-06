import xml2js from 'xml2js';

export class XmlUtil {

    static parseXML(data, property: string) {
        return new Promise(resolve => {
            let parser = new xml2js.Parser(
                {
                    trim: true,
                    explicitArray: true
                });
            parser.parseString(data, function (err, resultParse) {
                var result = resultParse[property];
                resolve(result);
            });
        });
    }
}