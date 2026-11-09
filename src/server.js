require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5051;

app.listen(PORT, () => {
    console.log(`User & Request Service running on port ${PORT}`);
});