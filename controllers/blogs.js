const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json(
      { error: 'missing or invalid token' }
    )
  }

  const user = await User.findById(decodedToken.id)
  const body = {
    ...request.body,
    user: user._id
  }
  if (!body || !body.title || !body.url) {
    return response.status(400).json({
      error: 'title or url missing'
    })
  }
  const blog = new Blog(body)

  const storedBlog = await blog.save()
  user.blogs = user.blogs.concat(storedBlog._id)
  await user.save()
  response.status(201).json(storedBlog)
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json(
        { error: 'invalid token '}
      )
    }
    const user = await User.findById(decodedToken.id)
    const blogToDelete = await Blog.findById(request.params.id)
    if (user._id.toString() !== blogToDelete.user.toString()) {
      return response.status(403).json(
        { error: 'not allowed to delete someone elses blog'}
      )
    }
    await Blog.remove(blogToDelete)
    response.status(204).end()
  } catch(error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog)
  } catch(error) {
    next(error)
  }
})

module.exports = blogsRouter