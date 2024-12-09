const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
    let issueId; // Store a valid issue ID for later tests
  
  // Test: Create an issue with every field
  test('Create an issue with every field', function (done) {
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Tester',
        assigned_to: 'Dev',
        status_text: 'In Progress',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Dev');
        assert.equal(res.body.status_text, 'In Progress');
        assert.isTrue(res.body.open);
        issueId = res.body._id; // Save _id for later tests
        done();
      });
  });

  // Test: Create an issue with only required fields
  test('Create an issue with only required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Required Fields Issue',
        issue_text: 'This issue only has required fields',
        created_by: 'Tester',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        done();
      });
  });

  // Test: Create an issue with missing required fields
  test('Create an issue with missing required fields', function (done) {
    chai
      .request(server)
      .post('/api/issues/test-project')
      .send({
        created_by: 'Tester',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'required field(s) missing');
        done();
      });
  });

  // Test: View issues on a project
  test('View issues on a project', function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test: View issues on a project with one filter
  test('View issues on a project with one filter', function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project?open=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.isTrue(issue.open);
        });
        done();
      });
  });

  // Test: View issues on a project with multiple filters
  test('View issues on a project with multiple filters', function (done) {
    chai
      .request(server)
      .get('/api/issues/test-project?open=true&created_by=Tester')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach((issue) => {
          assert.isTrue(issue.open);
          assert.equal(issue.created_by, 'Tester');
        });
        done();
      });
  });

  // Test: Update one field on an issue
  test('Update one field on an issue', function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ _id: issueId, issue_title: 'Updated Title' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully updated');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  // Test: Update multiple fields on an issue
  test('Update multiple fields on an issue', function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({
        _id: issueId,
        issue_title: 'Updated Title Again',
        issue_text: 'Updated Text',
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully updated');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  // Test: Update an issue with missing _id
  test('Update an issue with missing _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ issue_title: 'Title without ID' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'missing _id');
        done();
      });
  });

  // Test: Update an issue with no fields to update
  test('Update an issue with no fields to update', function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'no update field(s) sent');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  // Test: Update an issue with an invalid _id
  test('Update an issue with an invalid _id', function (done) {
    chai
      .request(server)
      .put('/api/issues/test-project')
      .send({ _id: 'invalidid', issue_title: 'Invalid Update' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'could not update');
        assert.propertyVal(res.body, '_id', 'invalidid');
        done();
      });
  });

  // Test: Delete an issue
  test('Delete an issue', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .send({ _id: issueId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'result', 'successfully deleted');
        assert.propertyVal(res.body, '_id', issueId);
        done();
      });
  });

  // Test: Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .send({ _id: 'invalidid' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'could not delete');
        assert.propertyVal(res.body, '_id', 'invalidid');
        done();
      });
  });

  // Test: Delete an issue with missing _id
  test('Delete an issue with missing _id', function (done) {
    chai
      .request(server)
      .delete('/api/issues/test-project')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.propertyVal(res.body, 'error', 'missing _id');
        done();
      });
  });

  });
