import React, { useState } from "react";
import "./login.css";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { toast } from "react-toastify";
import { collectionGroup, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword , signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import upload from "../../lib/upload";

export const Login = () => {

  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword((prev) => !prev);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword((prev) => !prev);
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);

      await signInWithEmailAndPassword(auth, email, password);



    } catch (error) {
      console.log(error);
      toast.error(error.message);
      return
    }
    finally{
      setLoading(false);
    }
    toast.success("Logged in successfully");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const {username, email, password} = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgURL = await upload(avatar.file);

      await setDoc(doc(db,"users", res.user.uid), {
        username,
        email,
        id: res.user.uid,
        avatar: imgURL,
        blocked: []
      });

      await setDoc(doc(db,"userchats", res.user.uid), {
        chats: []
      });

      toast.success("Account created successfully");
    
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <img
          src="src\assets\ChatterBox_transparent.png"
          alt=""
          width={`200px`}
          height={`200px`}
        />
        <h2>
          Welcome Back to <br />
          <h1>ChatterBox</h1>
        </h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <div className="pass">
            <input
              type={showLoginPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
            />
            {showLoginPassword ? (
              <VisibilityRoundedIcon onClick={toggleLoginPasswordVisibility} />
            ) : (
              <VisibilityOffRoundedIcon
                onClick={toggleLoginPasswordVisibility}
              />
            )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Loading" : "Log In"}
          </button>
        </form>
      </div>

      <div className="separator"></div>

      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img
              src={avatar.url || "src/assets/avatar.png"}
              alt=""
              style={{ width: "40px", height: "40px" }}
            />
            Upload Your Avatar
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="email" placeholder="Email" name="email" />
          <div className="pass">
            <input
              type={showSignupPassword ? "text" : "password"}
              placeholder="Password"
              name="password"
            />
            {showSignupPassword ? (
              <VisibilityRoundedIcon onClick={toggleSignupPasswordVisibility} />
            ) : (
              <VisibilityOffRoundedIcon
                onClick={toggleSignupPasswordVisibility}
              />
            )}
          </div>
          <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};
