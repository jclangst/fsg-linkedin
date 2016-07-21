"use strict";

var fs = require("fs");
var Q = require('q');
var request = require('request-promise');
var csv = require('fast-csv');
var scraper = require('linkedin-scraper2');
var validUrl = require('valid-url');


getParsePromise()
    .then(function(clients){
        var promises = [];
        clients.every(function(client, index){
                promises.push(
                    getCurrentPostionPromise(client[3])
                );
            return true;
        });

        return Q.allSettled(promises)
            .then(function(positionsArr){
                positionsArr.every(function(positions,index){
                    if(positions.state === "fulfilled") {
                        positions.value.forEach(function(position){
                            clients[index].push(position);
                        });
                    }else{
                        clients[index].push("ERR!");
                    }
                    return true;
                });
                return clients;
            });
    })
    .then(function(output){
        var outputFile = fs.createWriteStream("positions.csv");
        csv.write(output, {}).pipe(outputFile);
    })
    .catch(function(err){
        console.log(err);
    })
    .done();



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


//make request and return current positions
function getCurrentPostionPromise(url, index){
    var positions = [];
    var defer = Q.defer();

    setTimeout(function() {
        if(validUrl.isUri(url)){
            scraper(url).then(function (prof) {
                prof.positions.every(function (pos, index) {
                    if (pos.dates.current) {
                        positions.push(pos.title);
                        positions.push(pos.companyName);
                        return true;
                    } else {
                        return false;
                    }
                });

                defer.resolve(positions);
            }).catch(function (error) {
                defer.reject(error);
            });
        }else{
            defer.reject(new Error("Not a valid url!"));
        }
    }, index * 1000);

    return defer.promise;

}