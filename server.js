const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const shortid = require("shortid");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
app.set("views engine", "pug");
app.set("views", "./views");
const adapter = new FileSync("db.json");
const db = low(adapter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
db.defaults({ listBook: [], userList: [], transactions: [] }).write();

var list = db.get("listBook").value();
var lists = db.get("userList").value();

var connect = {lists:db.get("userList").value(),list:db.get("listBook").value()}

app.get("/", (request, response) => {
  response.render("index.pug",connect)
});
var userRoute = require('./views/user.route.js')
app.use("/users/:id", userRoute)
app.use("/users", userRoute)

app.get("/transactions", (req,res)=>{
  var id = shortid.generate();
  res.render("transactions.pug", {lists:db.get("userList").value(),list:db.get("listBook").value(),id:id})
})
app.post("/transactions/create",(req,res)=>{
  var id = shortid.generate();
  var findUserId = db.get("userList").find({user: req.body.user}).value()
  var findBookId = db.get("listBook").find({title: req.body.book}).value()
  db.get("transactions").push({userId:findUserId.id,bookId: findBookId.id,id: id}).write()
  res.redirect('/')
})

app.get("/change/:id",(req,res)=>{
  var id = req.params.id;   
  var findUser = db.get('userList')
  .find({ id: id }).value()
  res.render("changeUser.pug",{ user: findUser});
})
app.post("/update/:id",(req,res)=>{
  var id = req.params.id;
  var newUser = req.body.user;
  db.get('userList')
  .find({id: id})
  .assign({ user: newUser})
  .value()
  res.render("index.pug",connect);
})

app.get("/books/create", (request, response) => {
  response.render("create.pug");
});
app.get("/books/:id", (request, response) => {
  var id = request.params.id;
  db.get("listBook")
    .remove({ id: id })
    .write();
  response.render("index.pug",connect)
});
app.post("/books/create", (request, response) => {
  request.body.id = shortid.generate();

  db.get("listBook")
    .push(request.body)
    .write();
  response.render("index.pug",connect)
  response.redirect('/')
});
app.get("/books", (request, response) => {
  var q = request.query.q;
  if (q) {
    var itemFilter = list.filter(function(item) {
      if (item.text.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
        return item;
      }
    });
  } else {
    itemFilter = list;
  }
  response.render("index.pug", { list: itemFilter, q: q });
});

// listen for requests :)
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});
