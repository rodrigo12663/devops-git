import express from "express"

const app = express()


app.get("/",(req,res)=>{
  res.send("Server running version 1.0.1")
})

app.listen(3000, () => {
  console.log("Server running")
})