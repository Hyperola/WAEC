const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect('mongodb+srv://sodiqolaniyisanni:Controller1@cluster0.gw4ko28.mongodb.net/waec-cbt?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB connected');
  const username = 'tempadmin';
  const password = 'tempadmin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
    role: 'admin',
    name: 'Temp Admin',
    subjects: [],
    enrolledSubjects: []
  });
  await user.save();
  console.log('Temp admin created:', username);
  mongoose.disconnect();
})
.catch(err => console.error('Error:', err));