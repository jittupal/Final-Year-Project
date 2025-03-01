import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import backimg from "./assets/images/back.png";
import { toast } from 'react-toastify';

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
  
    const identifier = isLoginOrRegister === "register" ? email : (email || username); 
  
    const payload = isLoginOrRegister === "register"
      ? { username, email, password }
      : { identifier, password }; // Allow login via email or username
  
    try {
      const { data } = await axios.post(url, payload);
      setLoggedInUsername(data.username); // Set username from response
      setId(data.id);
      toast.success(`Successfully ${isLoginOrRegister}ed!`);
    } catch (error) {
      console.error("Login/Register Error:", error);
      toast.error(error.response?.data?.error || "Something went wrong");
    }
  }
  

  async function handleForgotPassword(ev) {
    ev.preventDefault();
    const newPassword = prompt("Enter your new password:");
    if (!newPassword) return;
    
    try {
      const response = await axios.post("reset-password", { email, newPassword });
      toast.success(response.data.message);
      setShowForgotPassword(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-8 relative overflow-hidden" style={{ backgroundImage: `url(${backimg})` }}>
      <div className="relative bg-white bg-opacity-30 backdrop-blur-lg shadow-2xl rounded-3xl p-12 w-[500px] border border-white border-opacity-40 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 drop-shadow-lg text-center">
          {isLoginOrRegister === "register" ? "Create an Account" : "Welcome Back"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          {isLoginOrRegister === "register" && (
            <input
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              type="text"
              placeholder="Username"
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white bg-opacity-80 placeholder-gray-600 text-gray-900 shadow-lg"
            />
          )}
          <input
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            type={isLoginOrRegister === "register" ? "email" : "text"} // Enforce email during registration, allow both for login
            placeholder={isLoginOrRegister === "register" ? "Email" : "Email or Username"}
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white bg-opacity-80 placeholder-gray-600 text-gray-900 shadow-lg"
          />
          <input
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white bg-opacity-80 placeholder-gray-600 text-gray-900 shadow-lg"
          />
          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:scale-105 transition duration-300 text-white font-bold py-4 rounded-xl shadow-xl">
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
        </form>
        
        {isLoginOrRegister === "login" && (
          <button
            onClick={() => setShowForgotPassword(!showForgotPassword)}
            className="mt-3 text-sm text-gray-700 hover:underline w-full text-center"
          >
            Forgot Password?
          </button>
        )}

        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="mt-3 bg-gray-100 p-4 rounded-md shadow w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or username"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <button type="submit" className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
              Reset Password
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-gray-900 text-opacity-80">
          {isLoginOrRegister === "register" ? (
            <p>
              Already have an account?
              <button
                className="text-indigo-600 hover:text-indigo-800 underline ml-1"
                onClick={() => setIsLoginOrRegister("login")}
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?
              <button
                className="text-indigo-600 hover:text-indigo-800 underline ml-1"
                onClick={() => setIsLoginOrRegister("register")}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
