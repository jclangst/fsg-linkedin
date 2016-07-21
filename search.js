"use strict";
var fs = require('fs');
var Q = require('q');
var parse = require('csv-parse');
var csv = require('fast-csv');
var keys = getKeys();
const DELAY = 250;
var Bing = [];
keys.forEach(function(key){
    Bing.push(require('node-bing-api')({
        accKey: key,
        reqTimeout: 20000
    }))
});


//******************************
//Main Executable
//*****************************

//construct searchs after reading input
getParsePromise().then(function(output){

    var promises = [];
    var finished = 0;
    var total = output.length;

    //load search promises into promise array
    output.forEach(function(row, index){
        promises.push(search(row[0], row[1], row[2], index, 0)
            .then(function(url){
                finished++;
                console.log(finished + "/" + total);
                return url;
            }));
    });

    //once all promises are resolved, store urls
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
    
//output 
}).then(function(output){
        var outputFile = fs.createWriteStream("urls.csv");
        csv.write(output, {}).pipe(outputFile);
    
//catach errors
}).catch(function(err){
    console.log(err);
}).done();



//******************************
//Parsers
//*****************************

//Get API Keys
function getKeys(){
    try{
        return fs.readFileSync('keys.txt').toString().split("\n");
    }catch(e){
        throw new Error("You must have API kets in a 'keys.txt' file.");
    }
}

//Make Input Parser Promise
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

    try {
        var input = fs.createReadStream('./contacts.csv');
        input.pipe(parser);
    }catch(e){
        throw new Error("Please initialize file 'contacts.csv' in the project folder!")
    }

    return parseDefer.promise;
}




//******************************
//Search Algorithm
//*****************************
function search(first, last, company, index, keyIndex) {
    var promise = Q.defer();

    //get ride of the SalesForce Account colon
    if(company) {
        company = company.split(':')[0];
    }

    //run only after sequenced delay to prevent overwhelming server
    setTimeout(function() {

        //construct search
        Bing[keyIndex].web(first + " " + last + " " + company + " site:LinkedIn.com", function (error, res, body) {

                //catch errors
                if (error) {

                    //iterate through all of the possible search engines
                    if(keyIndex < keys.length - 1){
                        search(first, last, company, index, keyIndex + 1)
                            .then(function(url){
                                promise.resolve(url);
                            })
                            .catch(function(error){
                                promise.reject(error);
                            })
                    }else{
                        promise.reject(new Error(error));
                    }

                //return results
                } else {
                    if(body.d.results[0]){
                        promise.resolve(body.d.results[0].Url);
                    }else{
                        promise.resolve("Not Found");
                    }
                }
            },
            {
                top: 1,
                options: ['DisableLocationDetection']
            });
    }, index * DELAY);
    
    return promise.promise;
}
