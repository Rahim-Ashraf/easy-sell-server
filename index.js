const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
    res.send("Easy Sell is Running")
})

app.listen(PORT, () => {
    console.log(`server is Running at http://localhost:${PORT}`)
})