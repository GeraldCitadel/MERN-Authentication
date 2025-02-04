import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    const { userId } = req.body

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, userData: {
            name: user.name,
            isAccountVerified: user.isAccountVerified
        }})
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}