const express = require('express')
const fetch = require("node-fetch");
const redis = require('redis')
 
// create express application instance
const app = express()
 
// create and connect redis client to local instance.
const client = redis.createClient(6379);
const port = process.env.PORT || 3000;
 
// echo redis errors to the console
client.on('error', (err) => {
    console.log("Error " + err)
});
 
// get photos list
app.get('/fakeJson', (req, res) => {
 
    // key to store results in Redis store
    const photosRedisKey = 'psots:1';
 
    // Try fetching the result from Redis first in case we have it cached
    return client.get(photosRedisKey, (err, photos) => {
 
        // If that key exists in Redis store
        if (photos) {
 
            return res.json({ source: 'cache', data: JSON.parse(photos) })
 
        } else { // Key does not exist in Redis store
 
            // Fetch directly from remote api
            fetch('http://my-json-server.typicode.com/Himadri001/fakeJson/posts/1')
                .then(response => response.json())
                .then(json => {
 
                    // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
                    client.setex(photosRedisKey, 3600, {"hello":"This is a hello text", "From": "himadri"})
 
                    // Send JSON response to client
                    return res.json({ source: 'api', data: json })
 
                })
                .catch(error => {
                    // log error message
                    console.log(error)
                    // send error to the client 
                    return res.json(error.toString())
                })
        }
    });
});
//post data in local redis
app.post('/fakeJson_post', (req,res)=>{
const postdatakey ="name";
var data = "REDIS POST DATA from himadri";
 client.set(postdatakey,data, (err, response)=>{
     if(err){
        return res.json(err.toString());
     }
     else{
         return res.json({respose: JSON.stringify(response)});
     }
 }) ; 
})
app.get('/fackeJson_getPost', (req,res)=>{
    const getdatakey = "name";
    client.get(getdatakey, (err, data)=>{
        if(err){
            return res.json(err.toString());
        }
        else{
            return res.json({source: "redis", data: JSON.stringify(data)});
        }
    });
})



app.get('/fakeJson_comment', (req, res) => {
 
    // key to store results in Redis store
    const commentRedisKey = 'comments:2';
 
    // Try fetching the result from Redis first in case we have it cached
    return client.get(commentRedisKey, (err, comments) => {
 
        // If that key exists in Redis store
        if (comments) {
 
            return res.json({ source: 'cache', data: JSON.parse(comments) })
 
        } else { // Key does not exist in Redis store
 
            // Fetch directly from remote api
            fetch('http://my-json-server.typicode.com/Himadri001/fakeJson/comments/1')
                .then(response => response.json())
                .then(json => {
                    var responses={
                        "comment": "The comment is from  redis cache server"
                    }
                    // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
                    client.setex(commentRedisKey, 2, JSON.stringify(responses));
 
                    // Send JSON response to client
                    return res.json({ source: 'api', data: json })
 
                })
                .catch(error => {
                    // log error message
                    console.log(error)
                    // send error to the client 
                    return res.json(error.toString())
                })
        }
    });
});
 
// start express server at 3000 port
app.listen(port, () => {
    console.log('Server listening on port: '+ port)
});