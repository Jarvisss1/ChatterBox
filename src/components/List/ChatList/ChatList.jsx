// ChatList.jsx

import "./ChatList.css";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useState, useEffect } from "react";
import { AddUser } from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

export const ChatList = () => {
  const [add, setAdd] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, []);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    try {
      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.user.username.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleAddUser = () => {
    setAdd(false);
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search or start new chat"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <img
          src={
            add
              ? "public/static/images/minus.png"
              : "public/static/images/plus.png"
          }
          alt=""
          className="add"
          onClick={() => setAdd((prev) => !prev)}
        />
      </div>

      <div className="items">
        {filteredChats.map((chat) => (
          <div
            className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{ backgroundColor: chat.isSeen ? "transparent" : "#5183fe" }}
          >
            <img
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? "src/assets/avatar.png"
                  : chat.user.avatar || "src/assets/avatar.png"
              }
              alt=""
              width="50px"
              height="50px"
            />
            <div className="text">
              <span>
                {chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : chat.user.username}
              </span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {add && <AddUser onAddUser={handleAddUser} />}
    </div>
  );
};
