const axios = require('axios');

const signup = async () => {
  const data = {
    username: 'exampleUser',
    email: 'example@example.com',
    password: 'securePassword123'
  };

  try {
    const response = await axios.post('http://localhost:8080/auth/signup', data);
    console.log('User created successfully:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

signup();