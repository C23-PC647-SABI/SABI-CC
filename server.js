const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const Multer = require('multer')
const imgUpload = require('./imgUpload')

const multer = Multer({
  storage: Multer.MemoryStorage,
  fileSize: 5 * 1024 * 1024
})

const connection = mysql.createConnection({
   host:        '34.101.227.12',
   user:        'umy',
   password:    'sabi123',
   database:    'sabi-database'
 })

connection.connect(function(error){
   if(!!error){
     console.log(error);
   }else{
     console.log('Koneksi Berhasil!');
   }
 })


 router.get('/',(req, res) => {
    const query = "SELECT * FROM dictionary"
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})


router.get("/getWord", (req, res) => {
  const word = req.query.word
  const query = "SELECT * FROM dictionary WHERE word = ?"
  connection.query(query,[word], (err, rows, field) => {
      if(err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.json(rows)
      }
  })
})

router.get("/getDescription", (req, res) => {
    const description = req.query.description
    const query = "SELECT * FROM dictionary WHERE description = ?"
    connection.query(query, [description], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
  })

router.get("/searchWord", (req, res) => {
  const word = req.query.word
  const description = req.query.description

  const query = "SELECT * FROM dictionary WHERE word = ? OR description = ?"
  connection.query(query,[word , description], (err, rows, field) => {
      if(err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.json(rows)
      }
  })
})

router.post('/insertWord',(req, res) => {
    const word = req.query.word
    const description = req.query.description

    const query = "INSERT INTO dictionary (word, description) values(?, ?)"
    connection.query(query, [word,description], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Insert Successful"})
        }
    })
})

router.post("/insertWithImage", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
  const word = req.body.word
  const description = req.body.description
  var imageUrl = ''

  if (req.file && req.file.cloudStoragePublicUrl) {
      imageUrl = req.file.cloudStoragePublicUrl
  }

  const query = "INSERT INTO dictionary (word, description, attachment) values (?, ?, ?)"

  connection.query(query, [word, description, imageUrl], (err, rows, fields) => {
      if (err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.send({message: "Insert Successful"})
      }
  })
})


router.put('/updateWord',(req, res) => {
    const word= req.body.word

    const query = "UPDATE dictionary SET word= ? WHERE word= ?"
    connection.query(query,[word], (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.send({message: "Update successful"})
        }
    })
})

router.delete("/deleteWord", (req, res) => {
  const word = req.query.word

  const query = "DELETE FROM dictionary WHERE word = ?"
  connection.query(query,[word], (err, rows, fields) => {
      if (err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.send({message: "Delete successful"})
      }
  })
})

router.post("/uploadImage", multer.single('image'), imgUpload.uploadToGcs, (req, res, next) => {
  const data = req.body
  if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl
  }

  res.send(data)
})

module.exports = router;
