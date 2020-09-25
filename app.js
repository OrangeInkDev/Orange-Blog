var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var User = require("./models/user");
var middleware = require("./middleware")
var Blog = require("./models/blog");

mongoose.connect("mongodb://localhost:27017/orange_blog", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(require("express-session")({
    secret:"test string for hash",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/home", function(req, res){
    res.render("home");
});

//REGISTER ROUTES
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/home");
        });    
    });
});

//LOGIN ROUTES
app.get("/login", function(req,res){
    res.render("login"); 
 });
 
 app.post("/login", passport.authenticate("local", {
     successRedirect: "/home",
     failureRedirect: "/register"
     }), function(req, res){
 });

 //LOGOUT ROUTE
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/home");
 });

//BLOG ROUTES

//LIST ROUTE
app.get("/blog", function(req, res){
    Blog.find(function(err, allBlogs) {
        if(err){
            console.log("Some problem occured");
        } else {
            res.render("list", {blogs: allBlogs});
        }
    });
});

//NEW
app.get("/blog/new", middleware.isLoggedIn, function(req, res){
    res.render("new");
 });

//CREATE
app.post("/blog",middleware.isLoggedIn, function(req, res){
    var title = req.body.title
    var content = req.body.content
    var image = req.body.image
    var author = {
        id: req.user_id,
        username: req.user.username
    }
    var newBlog = {title: title, content: content, image: image, author: author}
    Blog.create(newBlog, function(err, blog){
        if(err){
            console.log("ERROR")
        }
        else {
            console.log("Added blog")
            res.redirect("/home")
        }
    })
})

//SHOW ROUTE
app.get("/blog/:id", function(req, res) {
    Blog.findById(req.params.id).exec(function(err, foundBlog){
       if(err){
           console.log("Some Problem Occured");
       } else {
           res.render("show", {blog: foundBlog});
       }
    });
 });

 //EDIT ROUTE
 app.get("/blog/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           console.log("Some Problem Occured");
       } else {
           res.render("edit", {blogs: foundBlog});
       }
    });
 });

 //UPDATE ROUTE
app.put("/blog/:id", middleware.isLoggedIn, function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err)
            res.redirect("/blog");
        else{
            res.redirect("/blog/" + req.params.id);
        }
    });
});

//DESTROY ROUTE
app.delete("/blog/:id",middleware.isLoggedIn, function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blog");
        } else {
            res.redirect("/blog");
        }
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("The Server Has Started!");
});