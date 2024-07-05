import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

// Initializing the app
const app = express();
const port = 3000;
const saltRounds = 10;

// Initializing the database
const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "Practice",
  password : "Maddy",
  port : 5432
});

// Connecting to the databse
db.connect();

// Using Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ------------Authentication-------------------

// Current User
let curr_user_id = 4;

// Home Page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Register Page
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// POST Request on Registration
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1", 
    [email]
  );

  // Checking if user alreadu exists
  if (result.rows.length>0){
    res.render(
      "register.ejs", 
      {error : "User already exists. Try logging in"});
  }

  else{
    
    // Hashing the password before storing in the database
    const hashed_password = await bcrypt.hash(password, saltRounds);
    // Inserting a new User

    const user_result = await db.query(
      "INSERT INTO users(email, password) VALUES ($1, $2) RETURNING *", 
      [email, hashed_password]
    );

    // /Setting the current user
    curr_user_id = user_result.rows[0].id;

    // Inserting a new Member on registration of a user
    const member_result = await db.query
    ("INSERT INTO members(name, color, user_id) VALUES ($1, $2, $3) RETURNING *", 
      ["Me", "yellow", curr_user_id]
    );

    // Setting the current member 
    current_member_id = member_result.rows[0].id;

    // Rendering the Main Page
    await render_function(req, res);
  }

});

// POST Request on Login
app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  const result = await db.query(
    "SELECT * FROM users WHERE email = $1", 
    [email]
  );

  const currUSer = result.rows[0];

  // Checking is user exists
  if (result.rows.length===1){
    const curr_password = currUSer.password;

    // Comparing with the hashed password
    const match = await bcrypt.compare(password, curr_password);

    if (match){

      // Setting the current user
      curr_user_id = currUSer.id;
      
      // Setting the current member
      const member_record = await db.query(
        "SELECT * FROM members WHERE user_id = $1",
        [curr_user_id]
      );
      current_member_id = member_record.rows[0].id;

      // Rendering the Main Page
      await render_function(req, res);
    }

    // Wrong Password
    else{
      res.render("login.ejs", {error : "Incorrect password"});
    }
  }
  
  else{
    res.render("login.ejs", {error : "User does not exists"});
  }
});

// -------------------------------



// All the members
let members = [{id : 1, name : "Me", color : "yellow", user_id : 1}];

// Current member
let current_member_id;

// Setting the current member id
async function setCurrentMember(){
  const result = await db.query(
    "SELECT * FROM members WHERE user_id = $1", 
    [curr_user_id]
  );
  // console.log(curr_user_id);
  current_member_id = result.rows[0].id;
}
setCurrentMember();

// Function to get visited states
async function getStates(req, res){
  const result = await db.query(
    "SELECT state_code FROM visited_states JOIN members ON members.id = member_id JOIN users ON users.id=visited_states.user_id WHERE member_id = $1 AND visited_states.user_id = $2", 
    [current_member_id, curr_user_id]
  );

  let states = [];
  result.rows.forEach(state=>{
    states.push(state.state_code);
  });
  return states;
}


// Function to get Current member
async function getCurrentmember(){
  const result = await db.query(
    "SELECT * FROM members WHERE user_id = $1", 
    [curr_user_id]
  );
  members = result.rows;
  // console.log(members);
  // console.log(current_member_id);
  return members.find(member=> member.id == current_member_id);
}

// Render Funciton
async function render_function(req, res, err){
  const states = await getStates();
  const curr_member = await getCurrentmember();
  // console.log(curr_member);
  res.render("index.ejs", {
    states : states,
    total : states.length, 
    members : members, 
    color : curr_member.color,
    error : err
  });
}

// POST request to add or delete a state
app.post("/modify", async (req, res)=>{
  // console.log(req.body.state);
  const state = req.body.state.toLowerCase();
  const func = req.body.func;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;``
  const experience = req.body.experience;

  // Selecting the state code of the entered state
  const result = await db.query(
    "SELECT state_code FROM states WHERE LOWER(state_name) LIKE $1 || '%' ", 
    [state]
  );

  // If state exists
  if (result.rows.length===1){
    let data = result.rows[0];
    let state_code = data.state_code;

    try {
      // Adding a state
      if (func==="add"){
        await db.query(
          "INSERT INTO visited_states(state_code, member_id, user_id, start_date, end_date, experience) VALUES ($1, $2, $3, $4, $5, $6)", 
          [state_code, current_member_id, curr_user_id, start_date, end_date, experience]
        );
      } 

      // Deleting a state
      else{
        // console.log("delete");

        await db.query(
          "DELETE FROM visited_states WHERE state_code = $1 AND member_id = $2 AND user_id = $3", 
          [state_code, current_member_id, curr_user_id]
        );
      }
      await render_function(req, res);
    } 
    
    // If state exists but is already added
    catch(err){      
      console.log(err);
      await render_function(req, res, 
        "The given state is already added. Pls try again."
      );
    } 
  }

  // If state does not exists
  else{
    await render_function(req, res, 
      "The given state does not exist. Pls try again."
    );
  }
});


// POST request to change a member
app.post("/member", async (req, res)=>{
  const input = req.body.member;

  // Rendering the Add New Member Page
  if (input==="new"){
    res.render("new.ejs", {
      value : "What is your name ? "
    });
  }

  // Deleting an existing member
  else if (input==="del"){

    // If there is atleast 2 members
    // 1 member will always be present
    if (members.length>1){

      await db.query(
        "DELETE FROM members WHERE id = $1 AND user_id = $2 AND name != $3", 
        [current_member_id, curr_user_id, "Me"]
      );


      // After deleting a member, updating the current member
      const result = await db.query(
        "SELECT * FROM members WHERE user_id = $1", 
        [curr_user_id]
      );
      current_member_id = result.rows[0].id;

      // Rendering the Main Page
      await render_function(req, res);
    }

    else{
      await render_function(req, res, "There need to be atleast 1 member");
    }
  }

  // Setting the current member id based on the member clicked
  else{
    current_member_id = input;
    await render_function(req, res);
  }
});

// POST request to add a member
app.post("/new", async (req, res)=>{
  let name = req.body["name"];
  const type = req.body.type;

  if (type === "Back"){
    render_function(req, res);
  }

  else{
    // Name is required (cannot be blank)
    if (name.length===0){
      res.render("new.ejs", {
        value : "Name Cannot be Blank"
      });
    }

    // Name length constraint
    else if (name.length>20){
      res.render("new.ejs", {
        value : "Name Cannot be longer than 20 characters"
      });
    }

    else if (name==="Me"){
      res.render("new.ejs",{
        value : "Name cannot be Me"
      });
    }

    // Adding a new member
    else{

      // If color not provided, setting color to white
      let color = req.body["color"];
      if (!color) color = "white";

      // Inserting the new member into the database
      const result = await db.query(
        "INSERT INTO members(name, color, user_id) VALUES ($1, $2, $3) RETURNING *", 
        [name, color, curr_user_id]
      );

      // Updating the current member id to the new member
      current_member_id = result.rows[0].id;

      // Rendering the Main Page
      await render_function(req, res);
    }
  }
});

app.get("/state-details", async (req, res)=>{
  const stateCode = req.query.stateCode;
  // console.log(stateCode);
  const result = await db.query(
    "SELECT * FROM visited_states JOIN states ON states.state_code = visited_states.state_code WHERE visited_states.state_code = $1  AND user_id = $2 AND member_id = $3", 
    [stateCode, curr_user_id, current_member_id]
  );

  // console.log(result.rows[0]);
  if (result.rows.length>0){
    res.json(result.rows[0]);
  }
  else{
    res.status(404).json({error : "State details not found"});
  }
})

// LISTEN
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
