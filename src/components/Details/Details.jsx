import "./Details.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import defaultAvatar from "../../assets/avatar.png";
import bgImage from "../../assets/bg.jpg";

const Details = () => {
  const { currentUser } = useUserStore();
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();

  const handleBlock = async () => {
    if (!user) {
      console.log("User not found");
      return;
    }

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="Details">
      <div className="user">
        <img src={user?.avatar || defaultAvatar} alt="Avatar" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum, dolor sit amet consectetur</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">Chat Settings</div>
          <KeyboardArrowDownIcon />
        </div>
        <div className="option">
          <div className="title">Privacy</div>
          <KeyboardArrowUpIcon />
        </div>
        <div className="option">
          <div className="title">Shared Photos</div>
          <KeyboardArrowDownIcon />
        </div>
        <div className="photos">
          <div className="photoItem">
            <div className="photoDetail">
              <img src={bgImage} alt="Photo" width="50px" height="50px" />
              <span>image_29843.png</span>
            </div>
            <GetAppRoundedIcon />
          </div>
          <div className="photoItem">
            <div className="photoDetail">
              <img src={bgImage} alt="Photo" width="50px" height="50px" />
              <span>image_29843.png</span>
            </div>
            <GetAppRoundedIcon />
          </div>
        </div>
        <div className="option">
          <div className="title">Shared Files</div>
          <KeyboardArrowDownIcon />
        </div>
      </div>
      <button onClick={handleBlock}>
        {isCurrentUserBlocked
          ? "You are Blocked"
          : isReceiverBlocked
          ? "User Blocked"
          : "Block User"}
      </button>
      <button className="logout" onClick={() => auth.signOut()}>
        Logout
      </button>
    </div>
  );
};

export default Details;
