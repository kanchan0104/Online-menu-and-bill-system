require('dotenv').config();
// const config = require('config');
const express=require("express");
const path = require('path')
const stripe=require('stripe')('sk_test_51LEbn0SEIVS8XCgMBlhMYeqdSnlI1F6B6UHpZW52NpmVX6xmB2Bvw1mZONLthqY4fMQL7spiWJOMYdv17WyEFUnx00iTyZ7E52');
const bodyParser=require("body-parser");
const exphbs = require('express-handlebars');
var nodemailer = require('nodemailer');
let cookieParser = require('cookie-parser');
const app=express();
const QRCode = require('qrcode');
app.set('view engine', 'ejs'); 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
var mysql = require('mysql');
const { query } = require("express");
const jwt=require("jsonwebtoken");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kanchan@1234",
  database: "onlinemenu"
});

con.connect(function(err) {
    if (err) throw err;
    else console.log("Connected!");
  });
let name;
var gemail;
var gpass;
var otp=0;
app.post("/customer-signup",(req,res)=>{
    const fname = req.body.fname;
    var email = req.body.email;
    var check = "SELECT id FROM customer WHERE email ='"+email+"'";
    name=req.body.fname;;
    
    
    con.query(check,function(err,result){
        if(err) throw err;
        
        if(result.length===0){
            
            gemail=email;
            
            
            
            function mailSend(email)
	        {
                //nodemailer
                console.log(email);
                //randomvariable
                otp=Math.random();
                otp=otp*10000;
                otp=Math.floor(otp+1);
                var str="Your One Time Password is ";
                str+=otp;
                console.log(str);

                var transporter = nodemailer.createTransport({
                // service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'dineazy01@gmail.com',
                    pass: 'afqdfztnragqqmub'
                    
                }
                });

                var mailOptions = {
                from: 'dineazy01@gmail.com',
                to: email,
                subject: 'Email Verification',
                text: str
                };

                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    
                    console.log('Email sent: ' + info.response);
                }
                });
            }

            var password = req.body.pass;
            gpass=password;
            console.log(name);
            mailSend(gemail);
            return res.redirect('verification');

            // insertindb(fname,email,password);
        //     var sql = "INSERT INTO customer(name,email,password) VALUES ('"+fname+"', '"+email+"', '"+password+"')";
        //     con.query(sql, function(err,re){
        //         if(err) throw err;
        //         else console.log("1 record inserted");
        //     })
        //     res.send("Successfully signed up!!")
        }
        else{
            res.redirect("/signup?exists=true");
        }
    });


})


app.post("/verification",function(req,res){
	var otpKey = req.body.otp;
	// var password =req.body.password;

	password=gpass;
	var otpVal = JSON.parse(otp);
	console.log(typeof(otpVal.toString()),typeof(otpKey));
	console.log(otpVal.toString(),otpKey);
	if(otpVal.toString()===otpKey)
	{
		console.log("in db");
		insertindb(name,gemail,gpass);
        function insertindb(fname,email,password){
            var sql = "INSERT INTO customer(name,email,password) VALUES ('"+fname+"', '"+email+"', '"+password+"')";
                    con.query(sql, function(err,re){
                        if(err) throw err;
                        else console.log("1 record inserted");
                    })
                    res.send("Successfully signed up!!")
                
                
        }
	}
	else {console.log("OTP not matched"); res.send("signin failure");}
})

app.get("/login",(req,res)=>{
    res.sendFile(__dirname+"/login.html");
})

app.get("/verification",(req,res)=>{
    res.sendFile(__dirname+"/verification.html");
})

app.post("/auth",(request,response)=>{
    let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email && password) {
        var r="SELECT * FROM customer WHERE email = '"+email+"' and password = '"+password+"'";
		// Execute SQL query that'll select the account from the database based on the specified email and password
		con.query(r, function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				// request.session.loggedin = true;
				// request.session.email = email;
				// Redirect to home page
				response.send("Successfully signed in!");
			} else {
				response.redirect("/login?exists=true");
			}			
			response.end();
		});
	} else {
		response.redirect('Please enter Username and Password!');
		response.end();
	}
})

var rphoneno;
app.post("/resto_membership",(req,res)=>{
    const name = req.body.name;
    const phone_no = req.body.phone_no;
    rphoneno=req.body.phone_no;
    var id = "SELECT id FROM restaurant WHERE phoneno ='"+phone_no+"'";
    
    
    con.query(id,function(err,result){
        if(err) throw err;
        console.log(result);
        if(result.length===0){
            const address = req.body.address;
            var sql = "INSERT INTO restaurant (name,addr,phoneno) VALUES ('"+name+"', '"+address+"', '"+phone_no+"')";
            con.query(sql, function(err,re){
                if(err) throw err;
                else console.log("1 record inserted");
                console.log(re);
            })
            res.redirect("/paym");
        }
        else{
            res.send("membership not created");
        }
    });

})

//payment
app.post('/resto_owner', (req, res) => {
    const name = req.body.name;
    var email = req.body.email;
    var checkid = "SELECT resto_id FROM staff WHERE email ='"+email+"'";
    
    
    con.query(checkid,function(err,result){
        if(err) throw err;
        
        if(result.length===0){
            var phone_no = req.body.phone_no;
            var address = req.body.address;
            var password = req.body.password;
            var position ="Owner"

            var rid = "SELECT * FROM restaurant WHERE phoneno ='"+rphoneno+"'";
            con.query(rid,function(err,result){
                if(err) throw err;
                console.log(typeof(result));
                console.log(result[0].id);
                var sql = "INSERT INTO staff(resto_id,name,addr,phoneno,password,position,email) VALUES ('"+result[0].id+"','"+name+"','"+address+"', '"+phone_no+"','"+password+"','"+position+"','"+email+"')";
                con.query(sql, function(err,re){
                    if(err) throw err;
                    else console.log("1 record inserted");
                    res.sendFile(__dirname+"/dashboard.html");
                    console.log("created");
                })
                var q="select * from staff where email='"+email+"'";
                con.query(q,(err,resu)=>{
                  if(err) throw err;
                  console.log(phone_no,result[0].id,resu[0].id);
                  const user={phone_no:phone_no, rid:result[0].id, sid:resu[0].id};
                  const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30d'});
                  res.cookie("user",accessToken,{expire:2592000000+Date.now()});
                })
                
            });
        }
        else{
            res.send("membership already exists");
        }
    });
    
});

//take membership

  app.use(express.json());

const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 2500*100;
  };

app.get("/paym",(req,res)=>{
res.sendFile(__dirname+"/checkout.html");
})

app.get("/payrenew",(req,res)=>{
  res.sendFile(__dirname+"/renew.html");
  })

app.post("/bill",async (req, res) => {
  const order=JSON.parse(req.cookies.order);
  var sum=0;
  console.log(order[0][1]);
  for (let i = 0; i < Object.keys(order).length; i++) {
    sum+=order[i][1]*order[i][2];
  }
  console.log(sum);
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
      amount: sum*100,
      currency: "inr",
      automatic_payment_methods: {
      enabled: true,
      },
  });
  
  res.send({
      clientSecret: paymentIntent.client_secret,
  });
  

})
app.post("/create-payment-intent", async (req, res) => {
const { items } = req.body;

// Create a PaymentIntent with the order amount and currency
const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "inr",
    automatic_payment_methods: {
    enabled: true,
    },
});

res.send({
    clientSecret: paymentIntent.client_secret,
});
});

//login using jwt
app.get("/delete",authenticateToken,(req, res) => {

  // Delete a record

  // User the connection
  const q='DELETE FROM restaurant WHERE id = '+ req.user.rid;
  con.query(q, (err, rows) => {

    if(!err) {
      res.redirect('/logout');
    } 
    else throw err;
    
  
});
});
app.post("/rate",checkLocation,(req,res)=>{
  const i=req.query.i;
  console.log(i+"s");
  const q="select * from orders where transaction_id='"+req.cookies.transaction_id+"'";
  const q1="update orders set rating = "+req.body.rate+" where transaction_id='"+req.cookies.transaction_id+"' and name='"+req.body.item_name+"'";
  const q2="update items set rating = (select avg(rating) from orders where name='"+req.body.item_name+"' and rid="+req.location.rest_id+") where name='"+req.body.item_name+"' and rid="+req.location.rest_id;
  con.query(q1,(err,re)=>{
    if(err) throw err;
  })
  con.query(q2,(err,re)=>{
    if(err) throw err;
  })
  con.query(q,(err,re)=>{
    if(err) throw err;
    if(re.length<i){
      res.send("thanks for the feedback");
    }
    else res.redirect("/rating?id="+i);
  })
})

app.get("/rating",(req,res)=>{
  // var i=[req.params.id];
  var i=req.query.id;
  const q="select * from orders where transaction_id='"+req.cookies.transaction_id+"'";
  con.query(q,(err,result)=>{
    if(err) throw err;  
    // const name = result[i-1].name;
    res.render("rating.ejs",{name:result[Number(i)-1].name});
  })
  
})
app.get("/review",(req,res)=>{
  var sear=req.query.search;
  var s="select i.name, i.rating, i.price, restaurant.name as rname from items as i join restaurant on i.rid=restaurant.id where i.name like '%"+sear+"%'";
  con.query(s,(err,re)=>{
    if(err) throw err;
      console.log(re);
      res.render('review.ejs',{data1:re});
    })

})
app.get("/logout",(req,res)=>{
    res.clearCookie('user');
    res.clearCookie('position');
    res.redirect('/stafflogin');
})

function checkLocation(req,res,next){
  const token = req.cookies.location;
    if (token == undefined) return;
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, location) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.location = location;
      next();
    })
  
}

function authenticateToken(req, res, next) {
    if(req.cookies.user==null){
        res.redirect("/login");
    }
    const token = req.cookies.user;
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    })
}

app.get("/generateqr",(req,res)=>{
  res.sendFile(__dirname+"/generateqr.html");
})
app.get("/qrcode",authenticateToken,(req,res)=>{
  var rid=req.user.rid;
  var sql="SELECT * FROM tblno where rest_id="+rid;
  con.query(sql,function(err,result){
      if(err) throw err;
      res.render("qrcode.ejs",{data:result});
  })
})

app.post("/ans",authenticateToken, (req,res)=>{
    
  // generateQR(url);
  var rid = req.user.rid;
  var tno = req.body.tno;
  var url="localhost:3000/menu?rid="+rid+"&tno="+tno;
  var sql="SELECT * FROM tblno WHERE tno="+tno+" and rest_id="+rid;
  con.query(sql,function(err,result){
      if(err) throw err;
      
      if(result.length===0){
          // var password = req.body.pass;
          var sql1 = "INSERT INTO tblno(tno,rest_id,url) VALUES ('"+tno+"', '"+rid+"', '"+url+"')";
          con.query(sql1, function(err,re){
              if(err) throw err;
              else console.log("1 record inserted");
          })
          res.redirect("/generateqr?check=true");
      }
      else{
          res.redirect("/generateqr?check=false");
      }
  });
  // var str="your name is "+rid+" and your email is "+tno;
  // res.sendFile(__dirname+"/qrcode.html");
})

app.get("/resto_membership",(req,res)=>{
    res.render("restomembership.ejs");
})

app.get("/resto_owner",(req,res)=>{
    res.sendFile(__dirname+"/resto_owner.html");
    console.log(req.query.payment_intent)
  var sql = "UPDATE restaurant set transaction_id='"+req.query.payment_intent+"',expiration_date= date_add(curdate(),interval 1 year) where phoneno='"+rphoneno+"'";
  con.query(sql, function(err,re){
      if(err) throw err;
  })
  });
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/landing.html");
})
app.get("/signup",(req,res)=>{
    res.sendFile(__dirname+"/signup.html");
})
app.post("/json",(req,res)=>{
  res.render("bill.ejs",{data: req.cookies.order});
})
app.get("/success",checkLocation,(req,res)=>{
  const order=JSON.parse(req.cookies.order);
  const trans_id=req.query.payment_intent;
  res.cookie("transaction_id",trans_id);
    var sum=0;
    const rid=req.location.rest_id;
    const tno=req.location.tno;
    for (let i = 0; i < Object.keys(order).length; i++) {
      sum+=order[i][1]*order[i][2];
    }
    
    const q1="insert into bill(transaction_id,total_price,date,table_no,rid,status) values('"+req.query.payment_intent+"',"+sum+",current_timestamp(),"+tno+","+rid+",'processing')";
    
    con.query(q1,(err,result)=>{
      if(err) throw err;
  })
  for (let i = 0; i < Object.keys(order).length; i++) {
    const q2="insert into orders(name,transaction_id,quantity,price,rid) values('"+order[i][0]+"','"+req.query.payment_intent+"',"+order[i][2]+","+order[i][1]*order[i][2]+","+rid+")";
      con.query(q2,(err,result)=>{
        if(err) throw err;
    })
  }
  res.render("success.ejs",{data: req.cookies.order});
})
app.get("/menu",(req,res)=>{
  const received=req.query.received;
  if(received==="true"){
    
  
  }
  const rest_id=req.query.rid;
  var tno=req.query.tno;
  if(tno==undefined) tno=1;
  const location={rest_id:rest_id, tno:tno};
  const accessToken=jwt.sign(location,process.env.ACCESS_TOKEN_SECRET);
  res.cookie("location",accessToken);
  var sql="SELECT*FROM cat where rid="+rest_id;
  var sql1="SELECT*FROM items where rid="+rest_id;
  var sql2="select name from restaurant where id="+req.query.rid;
  con.query(sql,function(err,result){
    if(err)throw err;
    con.query(sql1,function(err,result1){
      if(err)throw err;
      con.query(sql2,function(err,result2){
        if(err)throw err;
        console.log(result2);
      res.render("menu.ejs",{data1:result,data2:result1,data3:result2});
    })
  })
})});

app.get("/menu1",checkLocation,(req,res)=>{
  const received=req.query.received;
  if(received==="true"){
    const order=JSON.parse(req.cookies.order);
    var sum=0;
    const rid=req.location.rest_id;
    const tno=req.location.tno;
    for (let i = 0; i < Object.keys(order).length; i++) {
      sum+=order[i][1]*order[i][2];
    }
    
    const q1="insert into bill(transaction_id,total_price,date,table_no,rid,status) values('"+req.query.payment_intent+"',"+sum+",current_timestamp(),"+tno+","+rid+",'processing')";
    
    con.query(q1,(err,result)=>{
      if(err) throw err;
  })
  for (let i = 0; i < Object.keys(order).length; i++) {
    const q2="insert into orders(name,transaction_id,quantity,price,rid) values('"+order[i][0]+"','"+req.query.payment_intent+"',"+order[i][2]+","+order[i][1]*order[i][2]+","+rid+")";
      con.query(q2,(err,result)=>{
        if(err) throw err;
    })
  }
  
  }
  const rest_id=req.query.rid;
  var tno=req.query.tid;
  if(tno==undefined) tno=1;
  const location={rest_id:rest_id, tno:tno};
  const accessToken=jwt.sign(location,process.env.ACCESS_TOKEN_SECRET);
  res.cookie("location",accessToken);
  var sql="SELECT*FROM cat where rid="+rest_id;
  var sql1="SELECT*FROM items where rid="+rest_id;
  con.query(sql,function(err,result){
    if(err)throw err;
    con.query(sql1,function(err,result1){
      if(err)throw err;
    res.render("menu.ejs",{data1:result,data2:result1});
  })
})
})

app.get("/stafflogin",(req,res)=>{
  res.sendFile(__dirname+"/stafflogin.html");
})


app.post("/staffauth",(request,response)=>{
  let email = request.body.email;
let password = request.body.password;
// Ensure the input fields exists and are not empty
if (email && password) {
  console.log(email,password);
      var r="SELECT * FROM staff WHERE email = '"+email+"' and password = '"+password+"'";
  // Execute SQL query that'll select the account from the database based on the specified email and password
  con.query(r, function(error, results, fields) {
    // If there is an issue with the query, output the error
    if (error) throw error;
    // If the account exists
    if (results.length > 0) {
      const user={phone_no:results[0].phoneno, rid:results[0].resto_id, sid:results[0].id};
      const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30d'});
      response.cookie("user",accessToken,{expire:2592000000+Date.now()});
      // Authenticate the user
      // request.session.loggedin = true;
      // request.session.email = email;
      // Redirect to home page
      
        console.log(results[0].position);
        response.cookie("position",results[0].position);
        response.cookie("position",results[0].position);
        response.redirect("/dashboard");
    } else {  
      response.redirect("/stafflogin?exists=true");
    }			
    response.end();
  });
} else {
  response.redirect('Please enter Username and Password!');
  response.end();
}
});
app.get("/sales",authenticateToken,(req,res)=>{

  var sql="select * from bill where rid="+req.user.rid;
  var sql1="SELECT distinct(customer_id) FROM bill where rid="+req.user.rid;
  con.query(sql,function(err,result){
    if(err)throw err;
    con.query(sql1,function(err,result1){
      if(err)throw err;
  
    res.render("sales.ejs",{price_data:result,data2:result1});
  })
  })

});

app.get("/createmenu",authenticateToken,(req,res)=>{
  var sql="SELECT*FROM cat where rid=" +req.user.rid;                              //rid glt h
  console.log(req.user.rid);
  con.query(sql,function(err,result){
    if(err)throw err;
    res.render("home2.ejs",{data:result});
  })
  
});

app.get("/items",authenticateToken,(req,res)=>{
  var cat1=req.param('category') ;
  console.log(req.user.rid);
  var sql="SELECT*FROM items where category='"+cat1+"' and rid = " +req.user.rid ;               //rid
  con.query(sql,function(err,result){
    if(err)throw err;
    res.render("home3.ejs",{item_data:result,data1:cat1});
    console.log(req.param('category'));

  })
  
});
// app.get("/menu",(req,res)=>{

//   var sql="SELECT*FROM cat ";
//   var sql1="SELECT*FROM items";
//   con.query(sql,function(err,result){
//     if(err)throw err;
//     con.query(sql1,function(err,result1){
//       if(err)throw err;
  
    
//     res.render("menu.ejs",{data1:result,data2:result1});
//   })
//   })
 
  
// });

app.get("/dish",(req,res)=>{
  res.sendFile(__dirname+"/About.html");
  cat3=req.query.category ;
  console.log(cat3);
 
});
// app.get('/chinmay', function(req, res) {

//   var name = req.param('category');

//   res.render(__dirname + "/home3.ejs", {name:name});

// });
app.post("/json",(req,res)=>{
  res.send(req.cookies.order);
})

app.get("/addcategory",(req,res)=>{
  res.sendFile(__dirname+"/profile.html");
})

app.post("/c",authenticateToken,(req,res)=>{

  const firstName=req.body.name1;
  const lastName=req.body.name2;
  const email=req.body.name3;
  const rid=req.user.rid;
  var sql = "INSERT INTO items (name, price, details,category,rid) VALUES ('"+firstName+"', '"+lastName+"', '"+email+"','"+cat3+"',"+rid+")";
  con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
  });
  res.redirect("/createmenu");
});
app.post("/",authenticateToken,(req,res)=>{
    const catName=req.body.catname;
   var temp=req.user.rid;
    var sql = "INSERT INTO cat (category,rid) VALUES ('"+catName+"','"+temp+"')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

    var sql1="SELECT*FROM cat where rid="+temp+"" ;
    con.query(sql1,function(err,result){
      if(err)throw err;
      res.render("home2.ejs",{data:result});
    })

   
});

app.get("/prepared",(req,res)=>{
  const q="update bill set status='completed' where transaction_id='"+req.query.trans_id+"'";
  con.query(q,(err)=>{
    if(err) throw err;
  })
  res.redirect("/dashboard");
})

const handlebars = exphbs.create({ extname: '.hbs',helpers: {
  compareStrings: function (p, q, options) {return (p == q) ? options.fn(this) : options.inverse(this);}
}});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

app.get('/view',authenticateToken, (req, res) => {
    // User the connection
    const restid=req.user.rid;
    const qu='SELECT * FROM staff WHERE resto_id ='+restid;
    con.query(qu, (err, rows) => {
      // When done with the connection, release it
      if (!err) {
        let removedUser = req.query.removed;
        res.render('home.hbs', { rows, removedUser });
      } else {
        console.log(err);
      }
      // console.log('The data from user table: \n', rows);
    });
});

app.get("/dashboard",authenticateToken,(req,res)=>{
  const restid=req.user.rid;
  const qu='SELECT * FROM bill WHERE rid ='+restid;
  con.query(qu, (err, rows) => {
    if (!err) {
      
      res.render('orders.hbs',{layout:'orderlayout.hbs',rows});
    } else {
      console.log(err);
    }
  });
})

app.get("/dashboard_staff",authenticateToken,(req,res)=>{
  const restid=req.user.rid;
  const qu='SELECT * FROM bill WHERE rid ='+restid;
  con.query(qu, (err, rows) => {
    if (!err) {
      
      res.render('orders.hbs',{layout:'orderlayout.hbs',rows});
    } else {
      console.log(err);
    }
  });
})

app.get("/orderdetails",(req,res)=>{
  const q="select * from orders where transaction_id='"+req.query.id+"'";
  const qr="select * from bill where transaction_id='"+req.query.id+"'";
  con.query(q,(err,rows)=>{
    if(err) throw err;
    con.query(qr,(err1,ro)=>{
      if(err1) throw err1;
      res.render("orderdetails.hbs",{rows,ro});
    })
  });
});


app.get("/staffprofile",authenticateToken,(req,res)=>{
  const q="select * from staff where resto_id='"+req.user.rid+"' and id="+req.user.sid;
  const qr="select * from restaurant where id='"+req.user.rid+"'";
  con.query(q,(err,rows)=>{
    if(err) throw err;
    con.query(qr,(err1,ro)=>{
      if(err1) throw err1;
      res.render("staffprofile.hbs",{rows,ro});
    })
  });
});

app.post('/view', (req, res) => {
    let searchTerm = req.body.search;
    // User the connection
    con.query('SELECT * FROM staff WHERE name LIKE ?', ['%' + searchTerm + '%'], (err, rows) => {
      if (!err) {
        res.render('home.hbs', { rows });
      } else {
        console.log(err);
      }
    });
});  

app.get('/adduser', (req, res) => {
    res.render('add-user.hbs');
});

app.post('/adduser', authenticateToken, (req, res) => {
    const {fname, addr, phone, password,position,email  } = req.body;
    const resto_id=req.user.rid;
    let n=req.body.name;
    let searchTerm = req.body.search;
    console.log(n);
    // User the connection
    con.query('INSERT INTO staff SET resto_id=?, name = ?, addr = ?, phoneno = ?, password = ?, position = ?, email = ? ' , [resto_id,fname, addr,  phone, password, position,email], (err, rows) => {
      if (!err) {
        res.render('add-user.hbs', { alert: 'User added successfully.' });
      } else {
        console.log(err);
      }
      console.log('The data from staff table: \n', rows);
    });
});

app.get('/edituser', authenticateToken, (req, res) => {
    // User the connection 
    const restid=req.user.rid;
    con.query('SELECT * FROM staff WHERE resto_id = ? and id = ?', [restid,req.query.id], (err, rows) => {
      if (!err) {
        res.render('edit-user.hbs', { rows });
      } else {
        console.log(err);
      }
      console.log('The data from staff table: \n', rows);
    });
});

app.post('/edituser',(req, res) => {
    const {resto_id, fname, addr,  phone, password, position,email} = req.body;
    // User the connection

    con.query('UPDATE staff SET  name = ?, addr = ?, phoneno = ?, password = ?, position = ?, email = ? where id = ? and resto_id = ?', [fname, addr,  phone, password, position,email, req.params.id,resto_id], (err, rows) => {
      
      if (!err) {
        // User the connection
        con.query('SELECT * FROM staff WHERE id = ?', [req.query.id], (err, rows) => {
          // When done with the connection, release it
          
          if (!err) {
            res.render('edit-user.hbs', { rows, alert: `${fname} has been updated.` });
          } else {
            console.log(err);
          }
          console.log('The data from staff table: \n', rows);
        });
      } else {
        console.log(err);
      }
      console.log('The data from staff table: \n', rows);
    });
});

app.get('/:id',(req, res) => {

    // Delete a record
  
    // User the connection
    con.query('DELETE FROM staff WHERE id = ?', [req.params.id], (err, rows) => {
  
      if(!err) {
        res.redirect('/view');
      } 
  
});
});

app.listen(3000,function(){
    console.log("Server started");
});