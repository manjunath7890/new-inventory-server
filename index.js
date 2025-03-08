const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());


mongoose.connect("mongodb+srv://flyingfortress289:flyingfortress289@cluster0.zlhd1zd.mongodb.net/?retryWrites=true&w=majority")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  emailId: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.index({ name: 1, emailId: 1 }, { unique: true });
const User = mongoose.model("InventoryUser", userSchema);

const BomSchema = new mongoose.Schema({
  partId: String,
  partName: String,
  specification: String,
  catagory: String,
  quantity: Number,
  supplier: String,
  price: String

});
const Bom = mongoose.model("InventoryBom", BomSchema);

const DevSchema = new mongoose.Schema({
  partId: String,
  partName: String,
  specification: String,
  catagory: String,
  quantity: Number,
  supplier: String,
  price: String

});
const Dev = mongoose.model("InventoryDev", DevSchema);

const ConSchema = new mongoose.Schema({
  partId: String,
  partName: String,
  specification: String,
  catagory: String,
  quantity: Number,
  supplier: String,
  price: String

});
const Con = mongoose.model("InventoryCon", ConSchema);

const PartsSchema = new mongoose.Schema({
  partId: String,
  partName: String,
  specification: String,
  catagory: String,
  date:Date,
  quantity: Number,
  supplier: String,
  price: String,
  location: String
});
const Parts = mongoose.model("InventoryParts", PartsSchema);

const PartsIOSchema = new mongoose.Schema({
  partId: String,
  invoice: String,
  partName: String,
  specification: String,
  catagory: String,
  date: String,
  quantity: Number,
  supplier: String,
  batchNo: String,
  IO: String,
  unitPrice: Number,
  price: Number,
  purchasedBy: String,
  location: String
});
const PartsIO = mongoose.model("InventoryPartsIO", PartsIOSchema);

const MsgSchema = new mongoose.Schema({
  from: String,
  to: String,
  subject: String,
  date: Date,
  description: String,
});

const Msg = mongoose.model("InventoryMsg", MsgSchema);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ emailId: email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email ID" });
    }

    // Directly compare passwords (not recommended for production)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Send a success response
    return res
      .status(200)
      .json({ message: user.name, role: user.role, _id: user._id, adminId: user.adminId,  });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { adminId } = req.query;
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/users", async (req, res) => {
  const { name, adminId, role, emailId, password } = req.body;
  // console.log(req.body)

  try {
    const newEmail = await User.findOne({ emailId });

    if (newEmail) {
      return res.status(401).send({ message: "user already exist" });
    }

    const user = new User({ name, adminId, role, emailId, password });
    await user.save();
    return res.status(200).send({ message: "user registered successfully!" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read BOM List
app.get("/bom", async (req, res) => {
  try {
    const { catagory } = req.query;
    const parts = await Bom.find({ catagory });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new BOM
app.post("/bom", async (req, res) => {
  try {

    const newParts = new Bom(req.body);
    await newParts.save();
    res.status(201).json(newParts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a BOM
app.put("/bom/:id", async (req, res) => {
  try {

    const updatedVehicle = await Bom.findByIdAndUpdate(
      req.params.id,
       req.body ,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "parts not found" });
    }

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a BOM
app.delete("/bom", async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({ message: "part ID is required" });
  }

  try {
    const result = await Bom.findOneAndDelete({ _id });
    if (result) {
      res.json({ message: "part deleted" });
    } else {
      res.status(404).json({ message: "part not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Read dev List
app.get("/dev", async (req, res) => {
  try {
    const { catagory } = req.query;
    const parts = await Dev.find({ catagory });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new dev
app.post("/dev", async (req, res) => {
  try {

    const newParts = new Dev(req.body);
    await newParts.save();
    res.status(201).json(newParts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a dev
app.put("/dev/:id", async (req, res) => {
  try {

    const updatedVehicle = await Dev.findByIdAndUpdate(
      req.params.id,
       req.body ,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "parts not found" });
    }

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a dev
app.delete("/dev", async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({ message: "part ID is required" });
  }

  try {
    const result = await Dev.findOneAndDelete({ _id });
    if (result) {
      res.json({ message: "part deleted" });
    } else {
      res.status(404).json({ message: "part not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



// Read con List
app.get("/con", async (req, res) => {
  try {
    const { catagory } = req.query;
    const parts = await Con.find({ catagory });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new con
app.post("/con", async (req, res) => {
  try {

    const newParts = new Con(req.body);
    await newParts.save();
    res.status(201).json(newParts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a con
app.put("/con/:id", async (req, res) => {
  try {

    const updatedVehicle = await Con.findByIdAndUpdate(
      req.params.id,
       req.body ,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "parts not found" });
    }

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a con
app.delete("/con", async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({ message: "part ID is required" });
  }

  try {
    const result = await Con.findOneAndDelete({ _id });
    if (result) {
      res.json({ message: "part deleted" });
    } else {
      res.status(404).json({ message: "part not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.get("/getparts", async (req, res) => {
  try {
    const { catagory } = req.query;
    const parts = await Parts.find({ catagory });
    // console.log(catagory)
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getpartsby-part-id", async (req, res) => {
  try {
    
    const { partId } = req.query;
    const parts = await Parts.findOne({ partId });
    res.json(parts);
    // console.log(parts)
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new part
app.post("/parts", async (req, res) => {
  try {

    const newParts = new Parts(req.body);
    await newParts.save();
    res.status(201).json(newParts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a parts
app.put("/parts/:partId", async (req, res) => {
  try {
    const updatedVehicle = await Parts.findOneAndUpdate(
      { partId: req.params.partId }, 
      req.body,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Parts not found" });
    }

    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Delete a part
app.delete("/deleteparts", async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({ message: "part ID is required" });
  }

  try {
    const result = await Parts.findOneAndDelete({ _id });
    if (result) {
      res.json({ message: "part deleted" });
    } else {
      res.status(404).json({ message: "part not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



app.get("/getpartsIO", async (req, res) => {
  try {
    const parts = await PartsIO.find();
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/partsIO", async (req, res) => {
  try {

    const newParts = new PartsIO(req.body);
    await newParts.save();
    res.status(201).json(newParts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/partsIO/:id", async (req, res) => {

  try {
    const updatedPartIO = await PartsIO.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPartIO) {
      return res.status(404).json({ message: "PartsIO record not found" });
    }

    res.json({ updatedPartIO });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Delete a IOpart
app.delete("/deletepartsIO", async (req, res) => {
  const { _id } = req.query;
  if (!_id) {
    return res.status(400).json({ message: "part ID is required" });
  }

  try {
    const result = await PartsIO.findOneAndDelete({ _id });
    if (result) {
      res.json({ message: "part deleted" });
    } else {
      res.status(404).json({ message: "part not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Read msg/notification List
app.get("/notifications", async (req, res) => {
  try {
    const { dept } = req.query;
    if(dept === "Admin") {
      const messages = await Msg.find();
      res.json(messages);
    } else {
      const messages = await Msg.find({ to : dept });
      res.json(messages);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new msg/notification
app.post("/notifications", async (req, res) => {
  try {

    const newMessages = new Msg(req.body);
    await newMessages.save();
    res.status(201).json(newMessages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
