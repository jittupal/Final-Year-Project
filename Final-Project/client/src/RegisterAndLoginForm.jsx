import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext.jsx";
import backimg from "./assets/images/back.png";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-8 relative overflow-hidden" style={{ backgroundImage: `url(${backimg})` }}>
      <div className="relative bg-white bg-opacity-30 backdrop-blur-lg shadow-2xl rounded-3xl p-12 w-[500px] border border-white border-opacity-40 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 drop-shadow-lg text-center">
          {isLoginOrRegister === "register" ? "Create an Account" : "Welcome Back"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8 w-full">
          <input
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            type="text"
            placeholder="Email"
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
