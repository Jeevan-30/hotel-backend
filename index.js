const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require('path');
const Admin = require("./models/Admin")
const Hotel = require("./models/Hotel")
const Room = require("./models/Room")
const Booking = require("./models/Booking")
const User = require("./models/User")
const Rating = require("./models/Rating")
const port = process.env.PORT || 4000;
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PuZIVKLgDvYSZsi4iV7ptdLAyutOzgwSsKgOcavqR5dcC8vXoS2XQXdk6tVNrFxdgUn72ikzhAFbEkSi4K7AtDd00xZMSjuYR');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

mongoose.connect('mongodb+srv://jselvaraj010:admin@hoteldb.5vqbk.mongodb.net/?retryWrites=true&w=majority&appName=hoteldb',)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.post('/create-payment-intent', async (req, res) => {
    const { totalprice } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalprice * 100, 
            currency: 'usd', 
            payment_method_types: ['card'],
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});


//admin_signup
app.post('/addadmin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const newAdmin = new Admin({ username, password});
        await newAdmin.save();

        res.status(201).json({ message: 'Admin added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//admin_login
app.post('/validateadmin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (password !== admin.password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({
            message: 'admin login successful',
            admindata: {
                username: admin.username,
                _id: admin._id
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//addhotel
app.post('/addhotel', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'room_image1', maxCount: 1 },
    { name: 'room_image2', maxCount: 1 },
    { name: 'room_image3', maxCount: 1 }
]), async (req, res) => {
    try {
        const { admin, hotelname, city, address, rating, price, review, rooms } = req.body;

        if (!req.files || !req.files.image || !req.files.room_image1 || !req.files.room_image2 || !req.files.room_image3) {
            return res.status(400).json({ error: 'All images are required' });
        }

        const image = req.files['image'][0].path;
        const room_image1 = req.files['room_image1'][0].path;
        const room_image2 = req.files['room_image2'][0].path;
        const room_image3 = req.files['room_image3'][0].path;

        const newHotel = new Hotel({
            admin,
            hotelname,
            city,
            address,
            rating: rating ? JSON.parse(rating) : [],
            price,
            image,
            review: review ? JSON.parse(review) : [],
            rooms,
            room_image1,
            room_image2,
            room_image3,
        });

        await newHotel.save();

        res.status(201).json({ message: 'Hotel added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//fetchHotels
app.get('/hotels/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const hotels = await Hotel.find({ admin: id });
        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//fetchHotel to view
app.get('/gethoteldata/:hid', async (req, res) => {
    const { hid } = req.params;

    try {
        const hotels = await Hotel.findOne({ _id: hid });
        res.status(200).json(hotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//fetchrooms
app.get('/getrooms/:hid', async (req, res) => {
    const { hid } = req.params;
    try {
        const rooms = await Room.find({ hotel: hid });
        if (rooms.length > 0) {
            res.json({ message: "Rooms found", rooms: rooms });
        }
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//putroom
app.post('/putroom', async (req, res) => {
    try {
        const { hotel, roomNo, status } = req.body;

        if (!hotel || !roomNo || !status) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newRoom = new Room({ hotel: hotel, roomNo: roomNo, status: status });

        await newRoom.save();

        res.status(201).json({ message: 'Room added successfully' });
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//user_signup
app.post('/putuser', async (req, res) => {
    try {
        const { username, phno, password } = req.body;
        const existingAdmin = await User.findOne({ username });

        if (existingAdmin) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newAdmin = new User({ username, phno, password});
        await newAdmin.save();

        res.status(201).json({ message: 'User added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//admin_login
app.post('/validateuser', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }


        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({
            message: 'User login successful',
            userdata: {
                username: user.username,
                _id: user._id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//getuser hotels
app.get('/userhotels/:location', async (req, res) => {
    try {
        const location = req.params.location;
        if (!location || typeof location !== 'string') {
            return res.status(400).json({ message: 'Invalid location parameter' });
        }

        const hotels = await Hotel.find({ city: location });

        if (hotels.length === 0) {
            return res.status(404).json({ message: `No hotels found in ${location}` });
        }

        res.status(200).json(hotels);
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//gethotel details
app.get(`/hoteldet/:hid`, async (req, res) => {
    try {
        const { hid } = req.params;
        const hotel = await Hotel.findById(hid);
        if (!hotel) {
            return res.status(404).json({ message: `Hotel with id ${hid} not found` });
        }
        res.status(200).json(hotel);
    } catch (error) {
        console.error('Error fetching hotel details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get room details
app.get(`/roomdet/:hid`, async (req, res) => {
    try {
        const { hid } = req.params;
        const count = await Room.countDocuments({ hotel: hid, status: 'available' });
        const rooms = await Room.find({ hotel: hid, status: 'available' });

        res.status(200).json({ count, rooms });
    } catch (error) {
        console.error('Error fetching room details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//putbooking
app.post('/putbooking', async (req, res) => {
    const { formData } = req.body;

    if (!formData.checkInDate || !formData.checkOutDate || !formData.totalprice) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const newBooking = new Booking({
            admin: formData.admin,
            hotel: formData.hotel,
            room: formData.room,
            customer: formData.customer,
            custNo: formData.custNo,
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            totalprice: formData.totalprice,
        });

        await newBooking.save();
        res.status(201).json({ message: 'Booking confirmed' });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//updateRoom

app.get('/updateroom/:rid', async (req, res) => {
    const { rid } = req.params;

    try {
        const room = await Room.findOne({ _id: rid });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.status = 'unavailable';
        await room.save();

        res.json(room);
    } catch (error) {
        console.error('Error updating room status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//fetchbookings
app.get('/fetchbookings/:hid', async (req, res) => {
    const { hid } = req.params;

    try {
        const bookings = await Booking.find({ hotel: hid });

        if (bookings.length === 0) {
            return res.json({ message: 'No bookings found for this hotel' });
        }

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//putrating
app.post('/putrating', async (req, res) => {
    const { rating, hotel } = req.body;
    try {
        if (typeof rating !== 'number' || rating < 1 || rating > 6) {
            return res.status(400).json({ message: 'Invalid rating value. Rating should be between 1 and 5.' });
        }

        const newRating = new Rating({ hotel, rating });
        await newRating.save();
        res.json(newRating);
    } catch (err) {
        console.error('Error putting rating:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//avgrating
app.get('/avgrating/:hid', async (req, res) => {
    const { hid } = req.params;

    try {

        const result = await Rating.find({ hotel: hid });

        if (result.length === 0) {
            return res.status(404).json({ message: 'No ratings found for this hotel' });
        }

        const sum = result.reduce((acc, item) => acc + item.rating, 0);
        const average = sum / result.length;

        const roundedAverage = parseFloat(average.toFixed(1));
        res.json({ averageRating: roundedAverage });

    } catch (err) {
        console.error('Error calculating average rating:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//changeroom
app.get('/changeroom/:rid', async (req, res) => {
    const { rid } = req.params
    try {
        const room = await Room.findOne({ _id: rid });
        room.status = 'available'
        await room.save()
    }
    catch (err) {
        console.error('Error updating room:', err)
        res.status(500).json({ message: 'Internal server error' })
    }
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
