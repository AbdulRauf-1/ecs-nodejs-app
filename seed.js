// seed.js

const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

// Configure AWS SDK client
const client = new DynamoDBClient({
  region: 'us-east-1', // Replace with your DynamoDB region if different
});

// Define DynamoDB Table Name
const TABLE_NAME = 'Users';

// Sample Data to Seed
const users = [
  {
    UserID: '1',
    Name: 'Alice Johnson',
    Email: 'alice.johnson@example.com',
  },
  {
    UserID: '2',
    Name: 'Bob Smith',
    Email: 'bob.smith@example.com',
  },
  {
    UserID: '3',
    Name: 'Charlie Brown',
    Email: 'charlie.brown@example.com',
  },
  {
    UserID: '4',
    Name: 'Diana Prince',
    Email: 'diana.prince@example.com',
  },
  {
    UserID: '5',
    Name: 'Ethan Hunt',
    Email: 'ethan.hunt@example.com',
  },
];

// Function to seed data
const seedData = async () => {
  try {
    for (const user of users) {
      const params = {
        TableName: TABLE_NAME,
        Item: {
          UserID: { S: user.UserID },
          Name: { S: user.Name },
          Email: { S: user.Email },
        },
      };

      const command = new PutItemCommand(params);
      await client.send(command);
      console.log(`Inserted UserID: ${user.UserID}`);
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Execute the seeding function
seedData();
