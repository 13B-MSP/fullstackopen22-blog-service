const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const helper = require('./test_helper')
const lodash = require('lodash')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('getting blogs', () => {
  test('all blogs returned', async () => {
    const result = await api.get('/api/blogs').expect('Content-Type', /application\/json/)
    expect(result.body).toHaveLength(helper.initialBlogs.length)
  })
  test('blogs contains id and ids are unique', async () => {
    const result = await api.get('/api/blogs')
    result.body.forEach(b => {
      expect(b.id).toBeDefined()
    })
    const blogIds = result.body.map(b => b.id)
    const unqiueBlogIds = lodash.uniq(blogIds)
    expect(unqiueBlogIds).toHaveLength(unqiueBlogIds.length)
  })
})
describe('creating blogs', () => {
  test('creating a blog results in new blog', async () => {
    const newBlog = {
      author: 'New Man', title: 'My first blog', url: 'http://blogs.com', likes: 1337
    }
    await api.post('/api/blogs').send(newBlog).expect(201)
    
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    const titles = response.body.map(b => b.title)
    expect(titles).toContain(newBlog.title)
  })
  test('creating a blog without likes will have zero likes', async () => {
    const newBlog = {
      author: 'New Man', title: 'My first blog', url: 'http://blogs.com'
    }
    const result = await api.post('/api/blogs').send(newBlog).expect(201)
    expect(result.body.likes).toBe(0)
  })
  test('creating a blog without title will result in bad request', async () => {
    const newBlog = {
      author: 'New Man', url: 'http://blogs.com'
    }
    const response = await api.post('/api/blogs').send(newBlog)
    expect(response.status).toBe(400)
  })
})
describe('deleting blogs', () => {
  test('when a blog is deleted, it no longer exists', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
  test('deleting non-existing blog results in bad request', async () => {
    await api.delete('/api/blogs/nonexisting').expect(400)
  })
})
describe('updating blogs', () => {
  test('when a blogs likes are updated, the likes are changed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {...blogToUpdate, likes: 9999}
    const putResult = await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200)
    expect(putResult.body.likes).toBe(9999)
  })
  test('updating non-existing blog results in bad request', async () => {
    const updatedBlog = {...helper.initialBlogs[0], likes: 9999}
    await api.put('/api/blogs/nonexisting').send(updatedBlog).expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})