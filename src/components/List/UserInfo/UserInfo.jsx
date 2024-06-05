import "./UserInfo.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VideocamIcon from "@mui/icons-material/Videocam";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { useUserStore } from "../../../lib/userStore";

export const UserInfo = () => {

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  return (
    <div className="userInfo">
      <div className="userInfo__profile">
        <img src={currentUser.avatar || "src/assets/avatar.png"} alt="" />
        <div className="userInfo__profileText">
          <h4>{currentUser.username}</h4>
          <p>Active now</p>
        </div>
      </div>
      <div className="userInfo__icons">
        <VideocamIcon className="icons"/>
        <MoreHorizIcon className="icons"/>
        <EditNoteIcon  className="icons"/>
      </div>
    </div>
  );
}
