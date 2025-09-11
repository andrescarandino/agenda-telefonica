const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI
//console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB', error.message);
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const regex = /^\d{2,3}-\d+$/
                if (!regex.test(v)) {
                    return false
                }
                return v.length >= 8
            },
            message: props => `${props.value} is not a valid number and min length 8 characters. for example XX-XXXXXXX o XXX-XXXXXXXX`
        }
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)

