require('dotenv').config()
const express = require('express');
const Person = require('./models/person.js');

const app = express();
const cors = require('cors');
const morgan = require('morgan');
const person = require('./models/person.js');

app.use(express.static('dist'));
app.use(cors());
app.use((request, response, next) => {
  request.requestTime = new Date();
  next();
})
morgan.token('post-data', function (req, resp) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  }
  return '';
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'));
app.use(express.json());

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons/', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person){
      response.json(person)
    }else{
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(entriesCount => {
    const requestTime = request.requestTime;
    response.send(`
    <p>Phonebook has info for ${entriesCount} people</p>
    <p>${requestTime}</p>
  `);
  })

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body;

    const person = new Person ({
    name: body.name.trim(),
    number: body.number
  })

  person.save().then(savedPerson => {response.json(savedPerson)})
    .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})


const errorHandle = (error, request, response, next) => {
  console.log(error.message);
  if(error.name === 'CastError'){
    return response.status(400).send({error: 'malformatted id'})
  }else if(error.name === 'ValidationError'){
    return response.status(400).send({error: error.message})
  }

  next(error)
}

app.use(errorHandle);
const generateId = () => {
  const min = 1000000;  // 1 millón
  const max = 9999999999;  // 10 mil millones
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



const PORT = 3001
app.listen(PORT)
console.log(`server running on port ${PORT}`);


