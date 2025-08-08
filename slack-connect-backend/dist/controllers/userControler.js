import User from '../models/userModel.js';
export const getUsers = async (_req, res) => {
    try {
        const user = await User.findById(_req.params.id);
        if (!user)
            return res.status(404).json({ user: null });
        res.status(200).json({ userEmail: user.email, userId: user._id });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
//# sourceMappingURL=userControler.js.map