const express=require("express");
const connectDB=require('./config/db');

const app=express();

//connect database
connectDB();

//body parsing and init middleware
app.use(express.json({extended:false})); //inside use is the middleware


// defining routes
app.get('/',(req,res)=>res.send("homepage !!"));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/post'));
app.use('/api/users',require('./routes/api/users'));

const PORT=process.env.PORT||5000;

app.listen(PORT,()=>console.log(`Server started on ${PORT}`));
