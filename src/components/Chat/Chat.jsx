// Chat.jsx

import "./Chat.css";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import InfoIcon from "@mui/icons-material/Info";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import MicIcon from "@mui/icons-material/Mic";
import AttachmentIcon from "@mui/icons-material/Attachment";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;

    const chatDocRef = doc(db, "chats", chatId);
    const unSub = onSnapshot(chatDocRef, (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleEmojiClick = (e) => {
    setMessage((prev) => prev + e.emoji);
    setOpen((prev) => !prev);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (message === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text: message,
          createdAt: new Date(),
          senderId: currentUser.id,
          ...(imgUrl && { image: imgUrl }),
        }),
      });

      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (userId) => {
        const userChatRef = doc(db, "userchats", userId);
        const userChatSnapShot = await getDoc(userChatRef);

        if (userChatSnapShot.exists()) {
          const userChatData = userChatSnapShot.data();
          const chatIndex = userChatData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );

          userChatData.chats[chatIndex].updatedAt = new Date();
          userChatData.chats[chatIndex].isSeen = userId === currentUser.id;
          userChatData.chats[chatIndex].lastMessage = message;

          await updateDoc(userChatRef, {
            chats: userChatData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    setMessage(""); // Clear message input after sending
    setImg({ file: null, url: "" });
  };

  return (
    <div className="Chat">
      <div className="top">
        <div className="user">
          <img
            src={user?.avatar || "src/assets/avatar.png"}
            alt=""
            height="50px"
            width="50px"
            style={{ objectFit: "cover" }}
          />
          <div className="text">
            <span>{user?.username}</span>
          </div>
        </div>
        <div className="icons">
          <CallIcon />
          <VideocamIcon />
          <InfoIcon />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={`message ${
              message.senderId === currentUser.id ? "own" : ""
            }`}
            key={index}
          >
            {message.image && (
              <img src={message.image} alt="" className="messageImage" />
            )}
            <div className="text">
              <p>{message.text}</p>
              <span>
                {new Date(
                  message.createdAt.seconds * 1000
                ).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own unsent">
            <div className="text">
              <img src={img.url} alt="" className="messageImage" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div
          className={`icons ${
            isCurrentUserBlocked || isReceiverBlocked ? "disabled" : ""
          }`}
        >
          <SentimentSatisfiedAltIcon onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmojiClick} className="emoji" />
            </div>
          )}
          <label
            htmlFor="img"
            className={`icons ${
              isCurrentUserBlocked || isReceiverBlocked ? "disabled" : ""
            }`}
          >
            <AttachmentIcon />
          </label>
          <input
            type="file"
            id="img"
            style={{ display: "none" }}
            onChange={handleImg}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't send a message"
              : img.url
              ? "Write a Caption"
              : "Type a message..."
          }
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className={
            isCurrentUserBlocked || isReceiverBlocked ? "disabled" : ""
          }
        />
        <div
          className={`send ${
            isCurrentUserBlocked || isReceiverBlocked ? "disabled" : ""
          }`}
          onClick={handleSend}
          aria-disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          {message || img.url ? <SendIcon /> : <MicIcon />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
