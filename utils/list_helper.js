const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.map(b => b.likes).reduce((prev, tot) => prev+tot, 0)
}

const favoriteBlog = (blogs) => {
  const mostLikes = Math.max(...blogs.map(b => b.likes))
  const foundBlog = blogs.find(b => b.likes === mostLikes)
  return (foundBlog) ? {title: foundBlog.title, author: foundBlog.author, likes: foundBlog.likes} : null
}

const mostBlogs = (blogs) => {
  const authorToNrBlogs = Object
    .entries(lodash.countBy(blogs.map(b => b.author)))
    .map(ent => { return {author: ent[0], blogs: ent[1]}})
  if (authorToNrBlogs.length > 0) {
    return authorToNrBlogs.reduce((prev, cur) => (prev.blogs > cur.blogs) ? prev : cur)
  } else {
    return null
  }
}

const mostLikes = (blogs) => {
  const authorToLikes = lodash.map(lodash.groupBy(blogs, b => b.author), (authorBlogs, author) => {
    return {
      author: author, likes: lodash.sum(authorBlogs.map(b => b.likes))
    }
  })
  if (authorToLikes.length > 0) {
    return authorToLikes.reduce((prev, cur) => (prev.likes > cur.likes) ? prev : cur)
  } else {
    return null
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}