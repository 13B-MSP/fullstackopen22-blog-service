const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const username = 'testuser'

beforeEach(async () => {
  await User.deleteMany({})
  const user = { username, name: 'Test', password: 'dummy' }
  const userObject = new User(user)
  await userObject.save()
})

describe('creating users', () => {
  test('creating a user with existing username fails', async () => {
    const newUser = { username, name: 'whatever', password: 'whatever' }
    const response = await api.post('/api/users').send(newUser).expect(409)
    expect(response.body.error).toEqual('username must be unique')
  })
  test('creating a user with invalid username fails', async () => {
    const newUser = { username: 'iv', name: 'whatever', password: 'whatever' }
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.body.error).toEqual('incorrect username or password')
  })
  test('creating a user without username fails', async () => {
    const newUser = { name: 'whatever', password: 'whatever' }
    const response = await api.post('/api/users').send(newUser).expect(400)
    expect(response.body.error).toEqual('username or password missing')
  })
})