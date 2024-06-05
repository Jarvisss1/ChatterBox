// AddUser.jsx

import React, { useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  collectionGroup,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";

export const AddUser = ({ onAddUser }) => {
  const [searchedUser, setSearchedUser] = useState(null);
  const { currentUser } = useUserStore();

  const handlesearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    const userRef = collection(db, "users");

    // Create a query against the collection.
    const q = query(userRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setSearchedUser(querySnapshot.docs[0].data());
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // console.log(newChatRef.id);
      await updateDoc(doc(userChatRef, searchedUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: searchedUser.id,
          updatedAt: Date.now(),
        }),
      });

      onAddUser(); // Hide the AddUser component after adding a user
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handlesearch}>
        <input type="text" placeholder="Enter username" name="username" />
        <button type="submit">Search</button>
      </form>
      {searchedUser && (
        <div className="user">
          <div className="detail">
            <img
              src={searchedUser.avatar || "src/assets/avatar.png"}
              alt="user"
              width={"40px"}
              height={"40px"}
            />
            <span>{searchedUser.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};
