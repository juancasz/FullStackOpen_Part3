const dotenv = require("dotenv");
dotenv.config();

const express = require('express')
const { response } = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))

const morganFunction =  (tokens, req, res) => {
    let format =  [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ]

    if(req.method === 'POST'){
        format = format.concat(JSON.stringify(req.body))
    }

    return format.join(" ")
}

app.use(morgan(morganFunction))

app.get('/api/persons', (req, res,next) => {
    Person.find({}).then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`Phonebook has info for ${persons.length} people <br><br> ${date}`)
})

app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id).then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.post('/api/persons',(req,res, next)=>{
    const body = req.body

    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }
    /*
    const filterName = persons.filter(person => person.name === body.name)

    if(filterName.length > 0){
        return response.status(409).json({ 
            error: 'name must be unique'
        })
    }
    */
    const person =new Person({
        name : body.name,
        number : body.number,
        //id : Math.round(Math.random()*10000)
    })

    person.save().then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(req,res, next)=>{
  const body = req.body

  const person ={
      name : body.name,
      number : body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === "ObjectId") {
    return response.status(400).json({ error: 'malformatted id' })
  } 

  if (error.name === 'ValidationError') {
    return response.status(400).json({ errorMessage: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})