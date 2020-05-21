var express = require('express')
var router = express.Router()
module.exports = router
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const shortid = require("shortid");
const adapter = new FileSync("db.json");
const db = low(adapter);
var connect = {lists:db.get("userList").value(),list:db.get("listBook").value()}
var lists = db.get("userList").value();

router.get("/:id", (request, response) => {
  var id = request.params.id;
  db.get("userList")
    .remove({ id: id })
    .write();
    response.render("index.pug",connect)
  });  
router.post("/", (req, res) =>{
  req.body.id = shortid.generate();
  db.get("userList").push(req.body).write()
  res.render("index.pug", connect);
})


