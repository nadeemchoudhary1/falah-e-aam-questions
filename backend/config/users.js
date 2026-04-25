// Mock Users - Replace with database in production
const users = [
  {
    id: 1,
    email: "user1@test.com",
    password: "pass123", // In production: hash this!
    questionSet: 1,
    name: "Rahul Kumar"
  },
  {
    id: 2,
    email: "user2@test.com",
    password: "pass456",
    questionSet: 2,
    name: "Priya Singh"
  },
  {
    id: 3,
    email: "user3@test.com",
    password: "pass789",
    questionSet: 3,
    name: "Amit Patel"
  },
  {
    id: 4,
    email: "user4@test.com",
    password: "pass101",
    questionSet: 4,
    name: "Neha Verma"
  },
  {
    id: 5,
    email: "user5@test.com",
    password: "pass202",
    questionSet: 1,
    name: "Vikram Singh"
  }
];

module.exports = { users };
