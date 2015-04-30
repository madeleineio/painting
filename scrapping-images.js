'use strict'

var Promise = require('es6-promise').Promise
var fs = require('fs')
var path = require('path')
var request = require('request')
var _ = require('lodash')

var data = JSON.parse(fs.readFileSync(path.resolve('data/url-list.json')))
var regName = /(.+)\/(.+)$/


Promise.all(data.map(function(d){

    return new Promise(function(resolveYear){
        var dirname = 'data/images/' + d.year
        d.dir = dirname
        try {
            fs.mkdirSync(dirname)
        }catch(e) {
            if ( e.code != 'EEXIST' ) throw e;
            resolveYear(d)
        }

        resolveYear(d)
    })

})).then(function(data){

    return Promise.all(data.filter())


}).then(function(datas){
    console.log(datas.filter(function(data){
        return data.urls && data.urls.length > 0
    }))



    // each data in datas
    return Promise.all(datas.filter(function(data){
        return data.urls.length > 0
    }).map(function(data){
        console.log(data)
        return Promise.all(data.urls.map(function(u){
            return new Promise(function(resolvePic){
                var filename = '/' + u.match(regName)[2]
                var picStream = fs.createWriteStream(data.dir + filename)
                picStream
                    .on('close', function(){
                        console.log('sucess for ' + filename)
                        resolvePic()
                    })
                    .on('error', function(){
                        console.log('error for ' + filename)
                        resolvePic()
                    })
                request('http:' + u).pipe(picStream)
            })
        }))
    }))



}).then(function(){
    console.log('ok')
    process.exit(0)
})