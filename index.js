"use strict";
var fs = require('fs');
var Q = require('q');
var parse = require('csv-parse');
var request = require('request-promise');
var csv = require('fast-csv');

var Bing = require('node-bing-api')({
    accKey: "w+HJt+PgH3SR67++AW3Ex5Hu/dFwjfPAPcFWmu5YWeI",
    reqTimeout: 20000
});


//Main Exec

getParsePromise().then(function(output){

    var promises = [];

    output.forEach(function(row, index){
        promises.push(search(row[0], row[1], row[2], index));
    });

    return Q.allSettled(promises).then(function(urls){
         urls.forEach(function(url, index){
             if(url.state === "fulfilled") {
                 output[index].push(url.value);
             }else{
                 output[index].push("Search Error");
             }
         });
         return output;
    });

}).then(function(output){
        var outputFile = fs.createWriteStream("output.csv");
        csv.write(output, {}).pipe(outputFile);

}).catch(function(err){
    console.log(err);
}).done();


//Make Parser Promise

function getParsePromise(readStream){
    var parseDefer = Q.defer();
    var output = [];
    var parser = parse({delimiter: ','})
    parser.on('readable', function(){
        var record;
        while(record = parser.read()){
            output.push(record);
        }
    });

    parser.on('finish', function(){
        parseDefer.resolve(output);
    })
    var input = fs.createReadStream('./contacts.csv');
    input.pipe(parser);

    return parseDefer.promise;
}




//Bing Scraping Algorithm

function search(first, last, company, index) {
    var promise = Q.defer();

    if(company) {
        company = company.split(':')[0];
    }

    setTimeout(function() {
        console.log("Loading " + index);
        Bing.web(first + " " + last + " " + company + " site:LinkedIn.com", function (error, res, body) {
                if (error) {
                    console.log(error);
                    promise.reject(new Error(error));
                } else {
                    if(body.d.results[0]){
                        console.log(body.d.results[0].Url);
                        promise.resolve(body.d.results[0].Url);
                    }else{
                        console.log("NOT FOUND");
                        promise.reject(new Error("NOT FOUND"));
                    }

                }
            },
            {
                top: 1,
                options: ['DisableLocationDetection']
            });
    }, index * 250);

    return promise.promise;

}
