import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpires: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpires: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    paystackCustomerCode: { type: String, default: "" },
    paystackAuthorization: { type: Object, default: {}},
    paid: { type: Boolean, default: false },
    subscriptionId: String
},
{timestamps: true});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
