const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(express.json())

const users = []

function checkExistsUserAccount(request, response, next) {
    const { username } = request.headers

    const userAlreadyExists = users.find((user)=> user.username === username)

    if (userAlreadyExists) {
        request.user = userAlreadyExists

        return next()
        
    } else {
        return response.json({error: "User not found"})
    } 
}


app.post('/users', (request, response) => {
    const { name, username } = request.body

    const userAlrredyExists = users.some(user=> user.username === username)
    
    if(!userAlrredyExists) {
        if((name && username)) {
            const user = {
                id: uuidv4(),
                name: name,
                username: username,
                todos: []
            }
        
            users.push(user)
        
            return response.status(201).send(user)
        } else {
            return response.status(400).send()
        }
    } else {
        return response.status(400).json({ error: 'Usuário já registrado' })
    }
    
})

app.get('/todos', checkExistsUserAccount, (request, response) => {
    const { user } = request

    return response.json(user.todos)
})

app.post('/todos', checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body
    const user = request.user

    if(title && deadline) {
        const todo = {
            id: uuidv4(),
            title: title,
            done: false,
            deadline: new Date(deadline),
            created_at: new Date()
        }

        user.todos.push(todo)
        
        return response.status(201).json(todo).send()
    } else {
        return response.status(400).send( {error: 'Invalid Datas'})
    }
})

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body
    const { id } =  request.params
    const user = request.user

    const todoForUpdate = user.todos.find(todo => todo.id === id)
    
    if(todoForUpdate) {
        todoForUpdate.title = title
        todoForUpdate.deadline = deadline

        return response.status(200).send(todoForUpdate)
    } else {
        return response.status(404).send({error: "Todo not found"})
    }
})

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
    const { id } = request.params
    const { user } = request

    const todoForDone = user.todos.find(todo => todo.id === id)
    
    if(todoForDone) {
        try {
            todoForDone.done = true
            return response.status(200).send(todoForDone)
        } catch (e) {
            return response.status(400).send(e.message)
        }
    } else {
        return response.status(404).send( {error: 'Todo not found'} )
    }
}) 

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
    const { id } = request.params
    const { user } = request

    const todoForDeleted = user.todos.find(todo => todo.id === id)

    if(todoForDeleted) {
        try{
            user.todos.splice(todoForDeleted.id, 1)
            return response.status(200).send()
        } catch (e) {
            return response.status(400).send(e.message)
        }
    } else {
        return response.status(404).send( {error: 'Todo not found'} )
    }
})

app.listen(3333)