import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const registerUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        const token = jwt.sign({ email: email, userId: newUser._id }, "private_key");
        res.status(201).json({ message: "User registered successfully", jwt: token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ email: email, userId: user._id }, "private_key");
        res.status(200).json({ message: "Login successful", jwt: token });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: err });
    }
};
//# sourceMappingURL=authController.js.map