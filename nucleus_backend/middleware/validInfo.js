// Validation middleware for signup and login
 const validateSignup = (req, res, next) => {
  const { moodle_id,username, user_email, password, role_id, department_id } = req.body;

  // Check if required fields are empty
  if (!moodle_id || !password || !role_id || !department_id || !username || !user_email) {
    return res.status(401).json({ success: false, message: "Invalid credentials. All fields are required." });
  }

  // Moodle ID must be only numbers
  const moodleRegex = /^[0-9]+$/;
  if (!moodleRegex.test(moodle_id)) {
    return res.status(400).json({ success: false, message: "Moodle ID must contain only numbers." });
  }

  // Password strength check: min 8 chars, at least 1 uppercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(401).json({
      success: false,
      message:
        "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.",
    });
  }

  //email validation
  let Emailregex = new RegExp('[a-z0-9]+@apsit.edu.in');
  //let testEmails = ["notanemail.com", "workingexample@stackabuse.com", "not_working@apsit.edu.in"];
 if(!Emailregex.test(user_email)){
  return res.status(401).json({
    success: false,
    message:"Only college email ID is permissible"
  });
 }


  next();
};

const validateLogin = (req, res, next) => {
  const { user_email, password } = req.body;

  // Check if fields are empty
  if (!user_email || !password) {
    return res.status(401).json({ success: false, message: "Invalid credentials. Fields cannot be empty." });
  }

  next();
};

export {validateLogin, validateSignup};