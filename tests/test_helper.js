const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'Dummy',
    author: 'RL Stine',
    url: 'http://example.com',
    likes: 10
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, blogsInDb }