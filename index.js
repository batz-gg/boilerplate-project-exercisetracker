const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));

let users = [];
let exercises = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const user = { username, _id: users.length };
  users.push(user);
  res.json(user);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = parseInt(req.params._id);
  const user = users.find((user) => user._id === userId);

  if (!user) {
    res.status(404).send('Not found');
    return;
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = { description, duration, date };
  exercises.push({ userId, exercise });

  res.json({
    _id: user._id,
    username: user.username,
    date: date.toDateString(),
           duration,
           description,
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = parseInt(req.params._id);
  const user = users.find((user) => user._id === userId);

  if (!user) {
    res.status(404).send('Not found');
    return;
  }

  let userExercises = exercises.filter((item) => item.userId === userId).map((item) => item.exercise);

  if (req.query.from || req.query.to) {
    let fromDate = new Date(0);
    let toDate = new Date();

    if (req.query.from) {
      fromDate = new Date(req.query.from);
    }

    if (req.query.to) {
      toDate = new Date(req.query.to);
    }

    userExercises = userExercises.filter((exercise) => exercise.date >= fromDate && exercise.date <= toDate);
  }

  if (req.query.limit) {
    userExercises = userExercises.slice(0, req.query.limit);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
