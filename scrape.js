"use strict";

var fs = require("fs");
var Q = require('q');
var csv = require('fast-csv');
var scraper = require('./libs/linkedin-scraper2/index.js');
const DELAY = 500;
var invalidUrlCounter = 0;


//*********************************
//Parses the Input
//*********************************

//get the parsed data
getParsePromise()
    
    //search all of the requested urls
    .then(function(clients){
        return searchAll(clients);
    })
    
    //write the data to new csv file
    .then(function(output){
        var outputFile = fs.createWriteStream("positions.csv");
        outputFile.on("open", function() {
            csv.write(output, {}).pipe(outputFile);
        });

        outputFile.on("finish", function(){
            console.log("DONE!");
        });

    })
    
    //show error if error
    .catch(function(err){
        console.log(err);
    })
    .done();



//*********************************
//Parses the Input
//*********************************


//Make Parser Promise
function getParsePromise(){
    var parseDefer = Q.defer();
    var output = [];

    var parser = csv()
        .on("data", function(data){
            output.push(data);
        }).on("end", function(){
            parseDefer.resolve(output);
        })

    var input = fs.createReadStream('./urls.csv');
    input.pipe(parser);

    return parseDefer.promise;
}

//*********************************
//Search Functions
//*********************************


//searches for all of the clients
function searchAll(clients){
    var promises = [];
    var len = clients.length;
    var counter = 1;
    
    //create a promise for each client
    clients.forEach(function(client, index){
        promises.push(
            getCurrentPostionPromise(client[3], index, 2).then(function(obj){console.log(counter + "/" + len); counter++; return obj;})
        );
    });
    
    //load all of the clients into output when searches are completed
    return Q.allSettled(promises)
        .then(function(positionsArr){
            positionsArr.forEach(function(positions,index){
                if(positions.state === "fulfilled") {
                    positions.value.forEach(function (position) {
                        clients[index].push(position);
                    })
                }else{
                    clients[index].push("ERR!");
                }
            });
            return clients;
        });
}




//search LinkedIn pages for current positions
function getCurrentPostionPromise(url, index, depth){
    var positions = [];
    var defer = Q.defer();

    //only search if the url is valid
    if(validUrl(url)){
        setTimeout(function() {

            //go ahead an scrape
            scraper(url, index).then(function (prof) {

                //load positions, break at first non-current
                prof.positions.every(function (pos) {
                    if (pos.dates.current) {
                        positions.push(pos.title);
                        positions.push(pos.companyName);
                        positions.push(pos.locality);
                        return true;
                    } else {
                        return false;
                    }
                });


                //indicate no positions on page
                if(positions.length === 0){

                    //revalidates that person actually has no positions
                    if(depth != 0){
                        getCurrentPostionPromise(url, 0, depth-1)
                            .then(function(res){
                                defer.resolve(res);
                            })
                    //after [depth] revalidations, indicate that they truly have no value positions
                    }else{
                        positions.push("No valid positions found!");
                        defer.resolve(positions);
                    }
                }else{
                    defer.resolve(positions);
                }
            }).catch(function (error) {
                console.log(error);
                defer.reject(error);
            });

        //offset the delay
        }, (index - invalidUrlCounter) * DELAY);
        
        
    //indicate that the url is invalid
    }else{
        invalidUrlCounter++;
        positions.push("Not a valid URL");
        defer.resolve(positions);
    }

    return defer.promise;
}

//checks to see if the url is a valid LinkedIn person page
function validUrl (url){
    var subdomain = /[A-Z]*\.linkedin.com/ig;
    var domain = /linkedin.com/ig;
    var dir = /\/dir\//ig;
    var person = /\/in\//ig;
    var pub = /\/pub\//ig;
    var personUpdates = /\/in\/updates/ig


    if(domain.test(url) || subdomain.test(url)){
        if(person.test(url) && !personUpdates.test(url)){
            return true;
        }else if (pub.test(url) && !dir.test(url)){
            return true
        }else{
            return false;
        }
    }else{
        return false;
    }
}
