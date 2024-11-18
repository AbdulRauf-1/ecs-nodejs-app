// app.js

const express = require('express');
const { DynamoDBClient, PutItemCommand, ScanCommand, GetItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Configure AWS SDK client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1', // Default region
  // Credentials are automatically picked up from the ECS task role
});

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'Users';

// Routes

// Welcome Route
app.get('/', (req, res) => {
  res.send('Welcome to the ECS Node.js DynamoDB API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Healthy' });
});

// Create a New User
app.post('/users', async (req, res) => {
  const { UserID, Name, Email } = req.body;

  if (!UserID || !Name || !Email) {
    return res.status(400).json({ error: 'Please provide UserID, Name, and Email' });
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      UserID: { S: UserID },
      Name: { S: Name },
      Email: { S: Email },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await client.send(command);
    res.status(201).json({ message: 'User created successfully', user: params.Item });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Could not create user', details: error.message });
  }
});

// Get All Users
app.get('/users', async (req, res) => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const command = new ScanCommand(params);
    const data = await client.send(command);
    res.status(200).json({ users: data.Items });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Could not fetch users', details: error.message });
  }
});

// Get a Single User by UserID
app.get('/users/:id', async (req, res) => {
  const UserID = req.params.id;

  const params = {
    TableName: TABLE_NAME,
    Key: {
      UserID: { S: UserID },
    },
  };

  try {
    const command = new GetItemCommand(params);
    const data = await client.send(command);
    if (!data.Item) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user: data.Item });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Could not fetch user', details: error.message });
  }
});

// Update a User by UserID
app.put('/users/:id', async (req, res) => {
  const UserID = req.params.id;
  const { Name, Email } = req.body;

  if (!Name && !Email) {
    return res.status(400).json({ error: 'Please provide Name or Email to update' });
  }

  // Construct the UpdateExpression dynamically
  let UpdateExpression = 'SET';
  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};

  if (Name) {
    UpdateExpression += ' #name = :name,';
    ExpressionAttributeValues[':name'] = { S: Name };
    ExpressionAttributeNames['#name'] = 'Name';
  }

  if (Email) {
    UpdateExpression += ' #email = :email,';
    ExpressionAttributeValues[':email'] = { S: Email };
    ExpressionAttributeNames['#email'] = 'Email';
  }

  // Remove trailing comma
  UpdateExpression = UpdateExpression.slice(0, -1);

  const params = {
    TableName: TABLE_NAME,
    Key: {
      UserID: { S: UserID },
    },
    UpdateExpression,
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    ReturnValues: 'ALL_NEW',
  };

  try {
    const command = new UpdateItemCommand(params);
    const data = await client.send(command);
    res.status(200).json({ message: 'User updated successfully', user: data.Attributes });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Could not update user', details: error.message });
  }
});

// Delete a User by UserID
app.delete('/users/:id', async (req, res) => {
  const UserID = req.params.id;

  const params = {
    TableName: TABLE_NAME,
    Key: {
      UserID: { S: UserID },
    },
  };

  try {
    const command = new DeleteItemCommand(params);
    await client.send(command);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Could not delete user', details: error.message });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
