'use strict';
const mongoose = require("mongoose");
const threadSchema = require('../model.js').threadSchema;
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app) {
  
   // database connection
  mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    }, function(error){
    if (error) {
      console.log(error);
    } else {
      console.log("connection successful");
    }
  });
  
  // route /api/threads/:board
  const postThread = require("../model.js").postThread;
  const getThreads = require("../model.js").getThreads;
  const deleteThread = require("../model.js").deleteThread;
  const reportThread = require("../model.js").reportThread;
  app.route('/api/threads/:board')
    .post(function(req, res) {
      let board = req.params.board;
      let text = req.body.text;
      let password = req.body.delete_password;
      let thread = {
        text: text,
        delete_password: password
      }
      postThread(board, thread, (err, newthread)=>{
        if(err) {
          console.log(err)
        } else {
          getThreads(board, (err, data)=> {
            if (err) {
              console.log(err)
            }
            else {
              res.json(data)
            }
          })
        }
      });
    })
    
    .get(function(req, res) {
      let board = req.params.board
      getThreads(board, (err, data) => {
        if (err) {
          console.log(err)
        }
        else {
          res.json(data)
        }
      });
    })
    
    .delete(function(req, res) {
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let password = req.body.delete_password;
      deleteThread(board, thread_id, password, (err, data)=> {
        if (err) {
          let message = "incorrect password"
          res.json(message)
        } else {
          res.json(data)
        }
      });
    })
    
    .put(function(req, res){
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      reportThread(board, thread_id, (err, data)=> {
        if (err) {
          let message = "Error. Please try again"
          res.json(message)
        } else {
          res.json(data)
        }
      });
    });

  // route /api/replies/:board
  const postReply = require("../model.js").postReply;
  const getReplies = require("../model.js").getReplies;
  const deleteReply = require("../model.js").deleteReply;
  const reportReply = require("../model.js").reportReply;
  app.route('/api/replies/:board')
    .post(function(req, res) {
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let text = req.body.text;
      let password = req.body.delete_password;
      let reply = {
        text: text,
        delete_password: password
      }
      postReply(board, thread_id, reply, (err, data)=>{
        if (err) {
          console.log(err)
        } else {
          getReplies(board, thread_id, (err, data)=> {
            if (err) {
              console.log(err)
            }
            else {
              res.json(data)
            }
          })
        }
      })
    })
    
    .get(function(req, res) {
      let board = req.params.board;
      let thread_id = req.query.thread_id;
      getReplies(board, thread_id, (err, data)=> {
        if (err) {
          console.log(err)

        }
        else {
          res.json(data)
        }
      })
    })
    
    .delete(function(req, res) {
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      let password = req.body.delete_password;
      deleteReply(board, thread_id, reply_id, password, (err, data)=> {
        if (err) {
          res.json("incorrect password")
        } else {
          res.json(data)
        }
      })
    })
    
    .put(function(req, res) {
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let reply_id = req.body.reply_id;
      reportReply(board, thread_id, reply_id, (err, data)=> {
        if (err) {
          res.json("Error. Please try again")
        } else {
          res.json(data)
        }
      })
    });

};
