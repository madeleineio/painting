'use strict'

var cheerio = require('cheerio')
var Promise = require('es6-promise').Promise
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var request = require('request')
var urlTemplate = _.template('http://commons.wikimedia.org/wiki/Category:<%=year%>_paintings')
var years = _.range(1300, 2015)

Promise.all(years.map(function(y){
    return new Promise(function(res){
        res({
            year: y,
            url: urlTemplate({
                year: y
            })
        })
    })
})).then(function(data){
    return Promise.all(data.map(function(d){
        return new Promise(function(res){
            request(d.url, function(error, response, body){
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(body)
                    var sources = []
                    $('.thumb img').each(function(){
                        sources.push( $(this).attr('src') )
                    })
                    d.sources = sources
                    res(d)
                }else {
                    res(d)
                }
            })
        })
    }))
}).then(function(data){
    console.log(data)
    fs.writeFile(path.resolve('url-list.json'), JSON.stringify(data), function(){
        console.log('ok')
        process.exit(0)
    })
})