const express = require('express');
const passport = require('passport'); // using this module for authentication.
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express(); 
const connectToMongo = require('./connectToMongo'); 
const role = require('./roles'); 
const userSchema = require('./userSchema');
const carSchema = require('./carSchema'); 
const verifyLogin = require('./loginVerification');
const mongoURI = 'mongodb+srv://bhupinderjit007:VERl0zmhp9rCkcDr@cluster0.owvvbi4.mongodb.net/';
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const sessionSecret = 'your_secret_key_here';

app.use(cookieParser(sessionSecret)); 

app.use(
  session({
    secret: sessionSecret,
    resave: true, 
    saveUninitialized: true, 
    cookie: { secure: true }, 
  })
);
const checkUserRole = (req, res, next) => {
  if (!req.user) { 
    return res.status(401).send('Unauthorized');
  }

  const allowedRoles = {
    '/addCar': [roles.Admin, roles.Salesperson],
    '/updateCar/:id': [roles.Admin, roles.Salesperson],
    '/deleteCar/:id': [roles.Admin],
    '/Home': [roles.Admin, roles.Salesperson, roles.User], 
  };

  const currentRoute = req.path;

  if (!allowedRoles[currentRoute] || !allowedRoles[currentRoute].includes(req.user.role)) {
    return res.status(403).send('Forbidden: Access denied');
  }

  next();
};

app.use(checkUserRole);
app.use('/updateCar/:id', checkUserRole);
app.use('/deleteCar/:id', checkUserRole);
app.use(passport.initialize());
app.use(passport.session());

connectToMongo(mongoURI);

const User = mongoose.model('User', userSchema);
const Car = mongoose.model('Car', carSchema);


const getNextUserId = async () => {
    const lastUser = await User.findOne().sort({ userID: -1 }).limit(1);
    return lastUser ? lastUser.userID + 1 : 1000;
  };

  const getNextCarId = async () => {
    const lastCar = await Car.findOne().sort({ carID: -1 }).limit(1);
    return lastCar ? lastCar.carID + 2 : 1000;
  };





  

app.get('/', (req, res) => {
    res.render('Home'); 
  });

  app.get('/LoginPage', (req, res) => {
    res.render('login'); 
  });
  

  
  // Registration route
  app.post('/register', async (req, res) => {
    const { name, email, password, contact_number, role } = req.body;
  
      const errors = []; 

    if (!name || name.trim() === '') {
      errors.push('Name is required');
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) { 
      errors.push('Please enter a valid email address');
    }

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) { 
      errors.push('Password must include a small letter, a capital letter, and a number');
    }

    if (!contact_number || contact_number.trim() === '') {
      errors.push('Contact number is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Registration failed', errors });
    }
  
    try {
    
      const userID = await getNextUserId();
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
     
      const newUser = new User({
        userID,
        name,
        email,
        password: hashedPassword,
        contact_number,
        role
      });
  
      await newUser.save();
  
      console.log('User registered successfully!');
      res.send({ message: 'Registration successful' }); 


    } catch (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error during registration' }); 
    }
  });
  

// Login route

// TODO: right now login is not using passport module. 

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password)) || email !== user.email) {
    return res.status(401).send('Invalid username, password, or email');
  }

  res.send(`Welcome ${email}`);
  
});
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find user by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Validate password using your verifyLogin function
//     const isLoggedIn = verifyLogin(passport)(user, password); // Pass passport and arguments

//     if (!isLoggedIn) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     // Login successful (replace with session management or JWT)
//     req.logIn(user, (err) => {
//       if (err) {
//         return err;
//       }
//       res.send({ message: 'Login successful' }); // Or redirect to dashboard
//     });
//   } catch (err) {
//     console.error('Error logging in user:', err);
//     res.status(500).json({ message: 'Error during login' });
//   }
// });


// Routes
app.get('/addCar', (req, res) => {
  res.render('addCar'); // Render addCar.ejs page
});

app.post('/addCar', upload.single('image'), async (req, res) => {
  const { model, make, year, color, price, mileage, fuel_efficiency, type, status, description } = req.body;

  // Check if image was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'Please select an image' });
  }

  const carID = await getNextCarId();
  console.log(carID);
  const newCar = new Car({
    carID,
    model,
    make,
    year,
    color,
    price,
    mileage,
    fuel_efficiency,
    type,
    status,
    description,
    image: `/uploads/${req.file.filename}`, // Store image path relative to uploads
  });

  try {
    await newCar.save();
    res.send({ message: 'Car added successfully!' });
  } catch (err) {
    console.error('Error saving car:', err);
    res.status(500).json({ message: 'Error adding car' });
  }
});

app.get('/Home', async (req, res) => {
  try {
    const cars = await Car.find(); 
    res.render('home', { cars }); 
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).send('Error retrieving car data');
  }
});

const updateCar = async (req, res) => {
  try {
    const { carId, make, model, year, ...otherFields } = req.body;

    // Find the car by ID
    const car = await User.findByIdAndUpdate(carId, {
      make,
      model,
      year,
      color,
      price,
      mileage,
      fuel_efficiency,
      type,
      status,
      description,
      image
    }, { new: true }); 

    if (!car) {
      return res.status(404).send("Car not found");
    }

    res.send(car); // Send the updated car data back to the client
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating car");
  }
};

app.get('/updateCar/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send('Car not found');
    }
    res.render('updateCar', { car }); 
  } catch (err) {
    console.error('Error fetching car for update:', err);
    res.status(500).send('Error retrieving car');
  }
});

app.delete('/deleteCar/:id', async (req, res) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(req.params.id);
    if (!deletedCar) {
      return res.status(404).send('Car not found');
    }
    res.send('Car deleted successfully'); 
  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).send('Error deleting car');
  }
});








app.listen(8080, ()=>{
    console.log('running on 8080');
});