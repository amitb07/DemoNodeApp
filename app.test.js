const queries = require('./queries_asg');
const expect = require('chai').expect;
const sinon = require('sinon');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password',
  port: 5432,
})

function stubRequest()  {
    const req = {};
    req.headers = {};
    req.header = (headerKey) => {return req.headers[headerKey]};
    req.body = {};
    req.query = {};
    req.get = (headerKey) => {return req.headers[headerKey]};
    
    return req;
  }

  function stubResponse() {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.type = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    res.end = sinon.stub().returns(res);
    res.render = sinon.stub().returns(res);
    res.cookie = sinon.stub().returns(res);
    res.statusCode = sinon.stub().returns(res);
    res.send = sinon.stub().returns(res);
    res.writeHead = sinon.stub().returns(res);
    res.write = sinon.stub().returns(res);
    res.setHeader = sinon.stub().returns(res);
    res.set = sinon.stub().returns(res);
  
    return res;
  }
  

describe('Testing the inboundSMS API', function() {
    it('1. Negative Test: to parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "from": "64946161316",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('2. Negative Test: from parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('3. Negative Test: auth_id parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "from": "64946161316",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('4. Negative Test: username parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "auth_id": "20S0KPNOIM",
            "from": "64946161316",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('5. Negative Test: from parameter with invalid length in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "to": "4924195509198", 
            "from": "641316",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });
    
    it('6. Negative Test: to parameter with invalid length in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "to": "4198", 
            "from": "64131686464646",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });
});

describe('Testing the outboundSMS API', function() {
    it('1. Negative Test: to parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "from": "64946161316",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('2. Negative Test: from parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('3. Negative Test: auth_id parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "from": "64946161316",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('4. Negative Test: username parameter missing in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "auth_id": "20S0KPNOIM",
            "from": "64946161316",
            "to": "4924195509198", 
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });

    it('5. Negative Test: from parameter with invalid length in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "to": "4924195509198", 
            "from": "641316",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });
    
    it('6. Negative Test: to parameter with invalid length in request body', function(done) {
        const req = stubRequest();
        const res = stubResponse();
        req.body = {
            "username": "azr1", 
            "auth_id": "20S0KPNOIM", 
            "to": "4198", 
            "from": "64131686464646",
            "msg": "Hello world"
        }
        queries.inboundSMS(req, res);
        expect(res.status.firstCall.args[0]).to.equal(400);
        expect(res.status.callCount).to.equal(1);
        done();
    });
});