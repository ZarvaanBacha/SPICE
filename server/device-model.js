import mongoose from "mongoose";

const addDevice = mongoose.Schema({
    productID: {type: Number, required: true},
    spice1: {type: Array},
    spice2: {type: Array},
    spice3: {type: Array},
    spice4: {type: Array},
    spice5: {type: Array},
    spice6: {type: Array},
    spice7: {type: Array},
    spice8: {type: Array}
    },
    {
        versionKey: false
    }
)

export default mongoose.model("devices", addDevice);