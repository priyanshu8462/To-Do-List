//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connect databse
mongoose.connect('mongodb+srv://admin-priyanshu:test123@cluster0.7upp7.mongodb.net/todolistDB',{useNewUrlParser:true,useUnifiedTopology:true});
//create database schema 
const itemsSchema = new mongoose.Schema({
  task:String
})

const Item = mongoose.model('Item',itemsSchema); 

const item1 = new Item({
  task : "Buy Food"
});
const item2 = new Item({
  task : "cook Food"
});
const item3 = new Item({
  task : "Eat Food"
});

const defaultArray = [item1,item2,item3];


const workItems = [];

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
})

const List = mongoose.model('list',listSchema);
const day = date.getDate();

app.get("/", function(req, res) {
  Item.find({},(err,foundItems)=>{
    if(foundItems.length===0){
      Item.insertMany(defaultArray,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("Added default items successfully");
      }
      res.redirect('/');
  });
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.post("/", function(req, res){
  console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    task : itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName}, (err,foundList) => {
      if(!err){
        console.log(foundList);
        foundList.items.push(item);
        foundList.save();
        console.log(foundList)
        res.redirect('/'+listName);
      }
    })
  }
});


app.post('/delete', (req,res) => {
  const checkedItemId = req.body.deleteItemId;
  const listName = req.body.listName;
  console.log(req.body);
  
  if(listName ===day ){
    Item.deleteOne({_id:req.body.deleteItemId}, (err) => {
      if(err){
        console.log(err);
      }
      else{
        res.redirect('/');
      }
  })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items : {_id:checkedItemId}}}, (err)=>{
      if(err){
        console.log(err);
      } else {
        res.redirect('/' + listName);
      }
    })
  }
})





app.get('/:customListName',(req,res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName}, (err,foundList) => {
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultArray
        })
        list.save();
        res.redirect('/'+customListName);
      }
      else{ 
        res.render('list',{listTitle : customListName, newListItems : foundList.items}) 
      }
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});






// username : admin-priyanshu
// pwd : test123