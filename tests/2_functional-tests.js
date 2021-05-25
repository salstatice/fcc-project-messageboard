const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  suite('Route /api/threads/{board}', function() {
    let new_thread = {
      text: 'Im a new functional test thread',
      delete_password: 'aaa'
    };
    let thread_id;

    test('POST Creating a new thread', function(done) {
      chai
        .request(server)
        .post('/api/threads/fun-test')
        .send(new_thread)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body);
          assert.equal(res.body[0].text, 'Im a new functional test thread')
          thread_id = res.body[0]._id
          done();
        })
    });
    
    test('GET Viewing the 10 most recent threads with 3 replies each', function(done) {
      chai
        .request(server)
        .get('/api/threads/fun-test')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.isArray(res.body);
          done();
        })
    });

    test('PUT Reporting a thread', function(done) {
      chai
        .request(server)
        .put('/api/threads/fun-test')
        .send({ thread_id: thread_id })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body, "reported");
          done();
        })
    });

    test('DELETE Deleting a thread with the incorrect password', function(done) {
      chai
        .request(server)
        .delete('/api/threads/fun-test')
        .send({ thread_id: thread_id, delete_password: 'bbb' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          console.log(res.body)
          assert.equal(res.body, "incorrect password");
          done();
        })
    });

    test('DELETE Deleting a thread with the correct password', function(done) {
      chai
        .request(server)
        .delete('/api/threads/fun-test')
        .send({ thread_id: thread_id, delete_password: 'aaa' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          console.log(res.body)
          assert.equal(res.body, "success");
          done();
        })
    });
    
  });
  
  suite('Route /api/replies/{board}', function() {
    let thread_id = '608c3993a144210ce2604ab0';
    let reply_id;
    let new_reply = {
      thread_id: thread_id,
      text: 'Im just a reply',
      delete_password: 'aaa'
    }
    
    test('POST Creating a new replies', function(done) {
      chai
        .request(server)
        .post('/api/replies/fun-test')
        .send(new_reply)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.text, 'This is a thread with 4 replies')
          assert.isArray(res.body.replies)
          assert.equal(res.body.replies[res.body.replies.length -1].text, "Im just a reply")
          reply_id = res.body.replies[res.body.replies.length -1]._id
          done();
        })
    });
    
    test('GET Viewing a single thread with all replies', function(done) {
      chai
        .request(server)
        .get('/api/replies/fun-test')
        .query({ thread_id: thread_id })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body.text, 'This is a thread with 4 replies')
          assert.isArray(res.body.replies)
          done();
        })
    });

    

    test('DELETE Deleting a reply with the incorrect password', function(done) {
      chai
        .request(server)
        .delete('/api/replies/fun-test')
        .send({ thread_id: thread_id, reply_id: reply_id, delete_password: 'bbb' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          console.log(res.body)
          assert.equal(res.body, "incorrect password");
          done();
        })
    });

    test('DELETE Deleting a thread with the correct password', function(done) {
      chai
        .request(server)
        .delete('/api/replies/fun-test')
        .send({ thread_id: thread_id, reply_id: reply_id, delete_password: 'aaa' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          console.log(res.body)
          assert.equal(res.body, "success");
          done();
        })
    });

    test('PUT Reporting a thread', function(done) {
      chai
        .request(server)
        .put('/api/replies/fun-test')
        .send({ thread_id: thread_id , reply_id})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, "application/json");
          assert.equal(res.body, "reported");
          done();
        })
    });
  });
});
