const express = require('express');

var app = express();
var hostList = [];
var clindList = [];
const PORT = process.env.PORT || 5000;

app.use(express.static("public"));
app.use(express.json());

app.get('/hosts', (req, res)=>{
    let hostnames = hostList.map((value, index)=>{
        return {id:index, name:value.name};
    })
    res.send(hostnames);
});
app.post('/hosts', (req, res)=>{
    let clind_id = clindList.push({clind:""})-1;
    let len = hostList.push({...req.body, clind_id})-1;
    res.json({id:len, clind_id});
});

app.post('/hosts/:id', (req, res)=>{
    clindList[req.body.id].clind = req.body.sdp;
    res.json(true);
});

app.get('/hosts/:id', (req, res)=>{
    let host = hostList.splice(req.params.id, 1)[0];
    res.json(host);
});

app.get('/clinds/:id', (req, res)=>{
    let host = clindList[req.params.id];
    if(host.clind != "")
        clindList.splice(req.params.id, 1);
    res.json(host);
});

app.listen(PORT, ()=>{
    console.log("server Listen on "+PORT);
});