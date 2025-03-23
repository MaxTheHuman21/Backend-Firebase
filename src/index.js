const app = require('./app')

require('./firebase')

PORT = app.listen(4000)
console.log('Server is running on port 4000')
