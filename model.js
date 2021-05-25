const mongoose = require("mongoose");
const {Schema} = mongoose;


// Reply Schema
const replySchema = new Schema({
  text: {type: String, default: ''},
  created_on: {type: Date, immutable: true, default: () => { return new Date() }},
  delete_password: {type: String, default: '', get: hideIt},
  reported: {type: Boolean, default: false, get: hideIt},
}, { toJSON: { getters: true } })

// Thread Schema
const threadSchema = new Schema({
  text: {type: String, default: ''},
  created_on: {type: Date, immutable: true, default: () => { return new Date() }},
  bumped_on: {type: Date, default: () => { return new Date() }},
  reported: {type: Boolean, default: false, select: false},
  delete_password: {type: String, default: '', select: false },
  replies: [replySchema],
},{ toJSON: { getters:true } })

// hide sensitive information in Schema
function hideIt(password) {
  return ''
}
replySchema.set('toObject', { getters: true });
threadSchema.set('toObject', { getters: true});


// helper functions for threads
const postThread = (board, thread, done) => {
  let Board = mongoose.model(board, threadSchema);
  let newThread = new Board(thread)
  newThread.save((err, data)=>{
    if(err) done(err)
    else {
      done(null, 'Posted')
    }
  })
}
const getThreads = (board, done) => {
  let Board = mongoose.model(board, threadSchema);
  Board.find().sort({bumped_on: -1}).limit(10).slice('replies', -3).exec((err, data)=> {
    if (err) done(err)
    else {
      done(null, data)
    }
  })
}

const deleteThread = (board, thread_id, password, done) => {
  let Board = mongoose.model(board, threadSchema);
  Board.findOneAndRemove({_id: thread_id, delete_password: password}).exec((err, data)=> {
    if ((err) || (data == null)) done("Error")
    else done(null, "success")
  })
}

const reportThread = (board, thread_id, done) => {
  let Board = mongoose.model(board, threadSchema);
  Board.findByIdAndUpdate(thread_id, { $set: { reported: true }}).exec((err, data) => {
    if ((err) || (data == null)) done("Error")
    else done(null, "reported")
  })
}

// helper function for replies
const postReply = (board, thread_id, reply, done) => {
  let Board = mongoose.model(board, threadSchema);
  let update_time = new Date();
  Board.findByIdAndUpdate(
    thread_id,
    { $set: { bumped_on: update_time }, $push: {replies: reply} }, 
    { runValidators: true, upsert: true, setDefaultsOnInsert: true })
    .exec((err, data) => {
      if ((err) || (data == null)) done("Error")
      else done(null, "posted")
  })
}

const getReplies = (board, thread_id, done) => {
  let Board = mongoose.model(board, threadSchema);
  Board.findById(thread_id).exec((err, data)=>{
    if ((err) || (data == null)) done("Thread not found")
    else {

      done(null, data)
    }
  })
}

// Thanks codeofnode! https://stackoverflow.com/a/21522473/14915561
// and Frank Rose! https://www.javaer101.com/en/article/26910356.html
const deleteReply = (board, thread_id, reply_id, password, done) => {
  let Board = mongoose.model(board, threadSchema);
  console.log(reply_id)
  Board.findOneAndUpdate(
    { _id: thread_id, "replies._id": reply_id, "replies.delete_password": password },
    { $set: { "replies.$[el].text": "[deleted]" } },
    { arrayFilters: [{ "el._id": reply_id }], new: true, runValidators: true})
    .exec((err, data)=> {
      if ((err) || (data == null)){
        done("Error")
      } else {
        done(null, 'success')
      }
    })
}

const reportReply = (board, thread_id, reply_id, done) => {
  let Board = mongoose.model(board, threadSchema);
  Board.findOneAndUpdate(
    { _id: thread_id, "replies._id": reply_id },
    { $set: { "replies.$.reported": true } },
    { arrayFilters: [{ "el._id": reply_id }], new: true, runValidators: true})
    .exec((err, data)=> {
      if ((err) || (data == null)){
        done("Error")
      } else {
        done(null, 'reported')
      }
    })
}


exports.postThread = postThread;
exports.getThreads = getThreads;
exports.deleteThread = deleteThread;
exports.reportThread = reportThread;
exports.postReply = postReply;
exports.getReplies = getReplies;
exports.deleteReply = deleteReply;
exports.reportReply = reportReply;