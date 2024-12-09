'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {

  // POST: Create an issue
app.post('/api/issues/:project', async (req, res) => {
  const { project } = req.params;
  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }

  try {
    const newIssue = new Issue({
      project,
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
    });
    const savedIssue = await newIssue.save();
    res.json(savedIssue);
  } catch (err) {
    res.json({ error: 'could not create issue' });
  }
});

// GET: View issues with filtering
app.get('/api/issues/:project', async (req, res) => {
  const { project } = req.params;
  const filters = { project, ...req.query }; // Merge project with query filters
  
  // Convert query parameters to appropriate types
  if (filters.open) {
    filters.open = filters.open === 'true'; // Convert 'true'/'false' to boolean
  }
  
  try {
    const issues = await Issue.find(filters); // Fetch filtered issues from database
    res.json(issues); // Send the results
  } catch (err) {
    res.status(500).json({ error: 'could not fetch issues' });
  }
});

// PUT: Update an issue
app.put('/api/issues/:project', async (req, res) => {
  const { _id, ...updates } = req.body;

  if (!_id) return res.json({ error: 'missing _id' });
  if (Object.keys(updates).length === 0) return res.json({ error: 'no update field(s) sent', _id });

  try {
    const updatedIssue = await Issue.findByIdAndUpdate(_id, { ...updates, updated_on: new Date() }, { new: true });
    if (!updatedIssue) return res.json({ error: 'could not update', _id });
    res.json({ result: 'successfully updated', _id });
  } catch {
    res.json({ error: 'could not update', _id });
  }
});

// DELETE: Delete an issue
app.delete('/api/issues/:project', async (req, res) => {
  const { _id } = req.body;

  if (!_id) return res.json({ error: 'missing _id' });

  try {
    const deletedIssue = await Issue.findByIdAndDelete(_id);
    if (!deletedIssue) return res.json({ error: 'could not delete', _id });
    res.json({ result: 'successfully deleted', _id });
  } catch {
    res.json({ error: 'could not delete', _id });
  }
});
    
};
