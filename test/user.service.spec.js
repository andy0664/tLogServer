'use strict';

// import the `mongoose` helper utilities
let utils = require('./utils');
import chai from 'chai';
let should = chai.should();
import chaiHttp from 'chai-http';
import {port} from '../server.conf';
import {createTestUser, login, standardUser} from './helpers';
import fs from "fs";

import User from '../app/models/user.model';

chai.use(chaiHttp);

let serverPort = port;

let serverInfo = {
  address: () => {
    return {address: '127.0.0.1', port: serverPort}
  }
};


describe('User API', ()=> {


  it("should support adding images to User", done => {
    let userToAddImage = null;
    let owner = null;
    createTestUser(standardUser)
      .then(user=> {owner = user; userToAddImage = user; return login(serverInfo,standardUser.username,standardUser.password)})
      .then(res => chai.request(serverInfo)
        .post(`/api/user/${userToAddImage._id}/image`)
        .set('authorization', `Bearer ${res.body.token}`)
        .field("description","A Test Image")
        .attach('file',fs.createReadStream('test/images/test.png'))
      )
      .then(res => {
          res.should.have.status(200);
          const imgData = res.body;
          imgData.filename.should.be.equal('test.png');
          imgData.contentType.should.be.equal('image/png');
          imgData.metadata.user.should.be.equal(userToAddImage._id.toString());
        }
      )
      .then(() => User.load(userToAddImage._id))
      .then(user => {
        user.images.should.be.an('array');
        user.images.should.have.lengthOf(1);
        const testImage = user.images[0];
        testImage.description.should.be.equal("A Test Image");
        done();
      })
      .catch(done)
  });



});

