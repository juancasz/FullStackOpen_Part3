const express = require('express')
const { response } = require('express')
const app = express()
const morgan = require('morgan')

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

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    const date = new Date()
    res.send(`Phonebook has info for ${persons.length} people <br><br> ${date}`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {    
        response.json(person)  
    } else {
        response.status(404).end()  
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

app.post('/api/persons',(req,res)=>{
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

    const filterName = persons.filter(person => person.name === body.name)

    if(filterName.length > 0){
        return response.status(409).json({ 
            error: 'name must be unique'
        })
    }

    const person ={
        name : body.name,
        number : body.number,
        id : Math.round(Math.random()*10000)
       //id: persons.length+1
    }

    persons = persons.concat(person)

    res.json(persons)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})