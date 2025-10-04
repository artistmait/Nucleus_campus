import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const authUser = async  (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({ message: "User is not authenticated. Try Again" });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    req.user = token_decode.user
  } catch (err) {
    return res.json({ message: "Token is invalid. Try Again" });
  }
};

// const verifyUser = async (req,res,next)=>{
// try{

// }catch(err){
//   console.log(err)
//   return res.json({success : false , message : err.message})
// }
// }

export default {authUser};
