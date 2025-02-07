import mongoose from "mongoose";

const authorizationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    signature: { type: String, required: true},
    code: { type: String, default: "" },
    bin: { type: String, default: "" },
    last4: { type: String, default: '' },
    expMonth: { type: String, default: "" },
    expYear: { type: String, default: "" },
    cardType: { type: String, default: "" },
    bank: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    brand: { type: String, default: ""},
    accountName: { type: String, default: "" },
},
{timestamps: true});

const authorizationModel = mongoose.models.authorization || mongoose.model("authorization", authorizationSchema);

export default authorizationModel;
