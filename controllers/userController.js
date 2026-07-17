const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const exists = await User.findOne({ email });

        if (exists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hash
        });

        res.status(201).json(user);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};