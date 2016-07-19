/// <reference path="typings/tsd.d.ts" />
"use strict";
var fs = require('fs');
var Q = require('q');
var parse = require('csv-parse');
var scraper = require('google-search-scraper');
var csv = require('fast-csv');

//Main Exec

getParsePromise().then(function(output){

    var promises = [];

    output.forEach(function(row, index){
        setTimeout(function(){
            promises.push(search(row[0], row[1], row[2]));
            console.log("Loading " + index);
        }, Math.random() * 2000 * index);
       
    });

    return Q.allSettled(promises).then(function(urls){
         urls.forEach(function(url, index){
             if(url.state === "fulfilled") {
                 output[index].push(url.value);
             }else{
                 output[index].push("GError");
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




//Google Scraping Algorithm

function search(first, last, company) {
    var promise = Q.defer();
    scraper.search(makeSearchOptions(first, last, company), function (err, url) {
        if (err) {
            console.log(err);
            promise.reject(new Error(err));
        }
        else{
            console.log(url);
            promise.resolve(url);
        }
    });
    return promise.promise;
}


function makeSearchOptions(first, last, company) {
    first = first.replace(' ', "+");
    last = last.replace(' ', "+");
    company = company.replace(' ', "+").split(':')[0];
    return {
        query: 'linkedin',
        host: 'www.google.com.sg',
        lang: 'en',
        limit: 1
    };
}
