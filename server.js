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
    const query = `SELECT * FROM word`;
    connection.query(query, (err, rows, field) => {
        if(err) {
            res.status(500).send({message: err.sqlMessage})
        } else {
            res.json(rows)
        }
    })
})


router.get("/getword/:id", (req, res) => {
  const id = req.params.id

  const query = "SELECT * FROM word WHERE word_id = ?"
  connection.query(query, [id], (err, rows, field) => {
      if(err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.json(rows)
      }
  })
})

router.get("/searchword", (req, res) => {
  const s = req.query.s;

  console.log(s)
  const query = "SELECT * FROM word WHERE name LIKE '%" + s + "%' or notes LIKE '%" + s + "%'"
  connection.query(query, (err, rows, field) => {
      if(err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.json(rows)
      }
  })
})

router.post("/insertword", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
  const word = req.body.word
  const description = req.body.amount
  var imageUrl = ''

  if (req.file && req.file.cloudStoragePublicUrl) {
      imageUrl = req.file.cloudStoragePublicUrl
  }

  const query = "INSERT INTO word (word, desription) values (?, ?)"

  connection.query(query, [word, description, imageUrl], (err, rows, fields) => {
      if (err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.send({message: "Insert Successful"})
      }
  })
})
router.put("/editword/:id", multer.single('attachment'), imgUpload.uploadToGcs, (req, res) => {
  const word = req.body.word
  const description = req.body.amount
  var imageUrl = ''

  if (req.file && req.file.cloudStoragePublicUrl) {
      imageUrl = req.file.cloudStoragePublicUrl
  }

  const query = "UPDATE word SET word = ?, description = ?"
  
  connection.query(query, [word, description, imageUrl, id], (err, rows, fields) => {
      if (err) {
          res.status(500).send({message: err.sqlMessage})
      } else {
          res.send({message: "Update Successful"})
      }
  })
})

router.delete("/deleteword/:id", (req, res) => {
  const id = req.params.id
  
  const query = "DELETE FROM word WHERE id = ?"
  connection.query(query, [id], (err, rows, fields) => {
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
