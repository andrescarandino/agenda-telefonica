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

app.get('/api/persons/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(note => {
    response.json(note)
  })
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

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id)

  response.status(204).end();
})

app.post('/api/persons/', (request, response) => {
  const body = request.body;
/*   const isExistName = persons.some(p => p.name.toLocaleLowerCase() === body.name.toLocaleLowerCase().trim());
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  } else if (isExistName) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  } */
  if(!body.name){
    return response.status(400).json({
      error : 'name missing'
    })}
    if (!body.number){
      return response.status(400).json({
      error : 'number missing'
    })
  }
  
    const person = new Person ({
    name: body.name.trim(),
    number: body.number
  })

  person.save().then(savedPerson => {response.json(savedPerson)})
})

const generateId = () => {
  const min = 1000000;  // 1 millón
  const max = 9999999999;  // 10 mil millones
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



const PORT = 3001
app.listen(PORT)
console.log(`server running on port ${PORT}`);