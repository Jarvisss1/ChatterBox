import { ChatList } from "./ChatList/ChatList";
import "./List.css"
import { UserInfo } from "./UserInfo/UserInfo";

const List = () => {
  return (
    <div className='List'>
      <UserInfo />
      <ChatList />
    </div>
  )
}

export default List;
