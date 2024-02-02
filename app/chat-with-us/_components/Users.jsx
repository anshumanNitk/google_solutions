"use client"
import React, { useState, useEffect, } from 'react';
import UserCard from './UserCard';
import { firestore,app } from '@/lib/firebase';
import { collection,onSnapshot,query,addDoc,serverTimestamp,where,getDocs, doc, QuerySnapshot } from 'firebase/firestore';
import { getAuth,signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { BookOpen, List, MenuIcon, MessageSquareText, Users2, X } from 'lucide-react';
const Users = ({ userData,setSelectedChatRoom}) => {
  const [activeTab, setActiveTab] = useState('users');
const [loading,setLoading] = useState(false)
const[users,setUsers] = useState([])
const router = useRouter()
const[userChatRooms,setUserChatRooms] = useState([])
const auth = getAuth(app)
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  //get all users
  useEffect(()=>{
setLoading(true);
const tastQuery =query(collection(firestore,'users'))
const unsubscribe = onSnapshot(tastQuery,(QuerySnapshot)=>{
  const users = QuerySnapshot.docs.map((doc)=>({
    id: doc.id,
    ...doc.data()
  }))
  setUsers(users)
  setLoading(false)
})
return unsubscribe
  },[])

console.log(users);
const handleLogOut = ()=>{
signOut(auth).then(()=>{
  toast.success('Logged successfully')
router.push('/')
})
}

//get users chatRooms

useEffect(()=>{
setLoading(true)
if(!userData?.id){
  return
}
const chatroomsQuery = query(collection(firestore,'chatrooms'),where('users','array-contains',userData?.id))
const unsubscribeChatrooms = onSnapshot(chatroomsQuery,(QuerySnapshot)=>{
  const chatrooms = QuerySnapshot.docs.map((doc)=>({
    id: doc.id,
    ...doc.data()
  }))
  setUserChatRooms(chatrooms)
  setLoading(false)
})
return unsubscribeChatrooms
},[userData])


//create chat

const createChat = async(user)=>{
//chatroom already exists
const existingChatroom = query(collection(firestore,'chatrooms'),where('users','==',[user.id,userData.id]))
try {
const existingChatroomSnapShots = await getDocs(existingChatroom)
if(existingChatroomSnapShots.docs.length>0){
  toast.error('Chatroom already exists')
  return
}
//chatRoom doest exist we create one

const usersData = {
  [userData.id]:userData,
  [user.id]:user
}

const chatRoomData = {
  users: [user.id,userData.id],
  usersData,
  timestamp: serverTimestamp(),
  lastMessage: null
}
const chatRoomRef = await addDoc(collection(firestore,'chatrooms'),chatRoomData)
console.log("chatRoom has been created with id", chatRoomRef.id);
setActiveTab('Chatrooms')

} catch (error) {
toast.error(error.message)
toast.error("failed")
}
}

//open chatroom

const openChat = async (chatroom)=>{
const data = {
  id: chatroom.id,
  myData:userData,
  otherData: chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)]
}
toast.success("chat room selected")
setSelectedChatRoom(data);
}

const [isSidebarOpen, setSidebarOpen] = useState(false);

const toggleSidebar = () => {
  setSidebarOpen(!isSidebarOpen);
};
const handleUserClick = () => {
  handleTabClick("users");
};

const handleChatRoomClick = () => {
  handleTabClick("Chatrooms");
};



  return (
    <>
      {/* Menu button for small screens */}
   <button
        onClick={toggleSidebar}
        className="sm:hidden fixed  z-50 p-2  rounded-md"
      >
        {!isSidebarOpen ? <MenuIcon/>: <X/>}
      </button>

      {/* Sidebar */}
      <aside id="logo-sidebar"  className={`fixed top-10 left-0 z-40 h-[60vh] w-64 pt-20 transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }  bg-dark-pinkHard  border-r border-gray-200 sm:translate-x-0  `} aria-label="Sidebar">
<div className="h-full px-3 pb-4 overflow-y-auto bg-opacity-80 bg-dark-pinkLight ">
<ul className="space-x-4 mt-8 font-medium flex">
  <li className=''>
  <button
          onClick={handleUserClick}
          className={`btn btn-outline rounded-full   ${activeTab === 'users' ? 'bg-dark-spansoft text-white transition-all duration-300' : ''}`}
        >
         <Users2 />
        </button>
        {activeTab==="users" &&<List className='mt-4 ml-3' onClick={()=>document.getElementById('my_modal_1').showModal()}>open modal</List>}
  </li>
  <li className=''>
  <button
          onClick={handleChatRoomClick}
          className={`btn   btn-outline rounded-full   ${activeTab === 'Chatrooms' ? 'bg-dark-spansoft text-white transition-all duration-300' : ''}`}
        >
          <MessageSquareText />
        </button>
       {activeTab==="Chatrooms" &&<List className='mt-4 ml-3' onClick={()=>document.getElementById('my_modal_2').showModal()}>open modal</List>}

  </li>
  <li className=''> <button
          onClick={handleLogOut}
          className={`btn   btn-outline rounded-full bg-red-400 hover:bg-red-200 hover:text-red-600  `}
        >
          Log out
        </button>
        </li>
        {/* Open the modal using document.getElementById('ID').showModal() method */}
{activeTab==="Chatrooms" && <>

<dialog id='my_modal_2' className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
      {activeTab ==='Chatrooms' && (
            <>
            <h1 className='px-4 text-base font-semibold'>Chat rooms</h1>
            {
              userChatRooms.map((chatroom)=>(
                <div key={chatroom.id} onClick={()=>{openChat(chatroom)}} >
   <UserCard
                  name={chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)].name}
                  avatarUrl={chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)].avatarUrl}
                  latestMessage={chatroom.lastMessage}
                  time="2 hour ago"
                  type={"chat"}
                />

                </div>
              ))
            }
         </>
        )}
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
</>}
{/* Open the modal using document.getElementById('ID').showModal() method */}
{activeTab==="users" && (
  <>
<dialog id='my_modal_1' className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Hello!</h3>
    <p className="py-4">Press ESC key or click the button below to close</p>
    <div className="modal-action">
      <form method="dialog">
      {activeTab ==='users' && (
            <>
            <h1 className='px-4 text-base font-semibold'>Users</h1>
            { loading ? <p>Loading...</p> : users.map((user)=>(
<div key={user.id} onClick={()=>{createChat(user)}}>
   { user.id!==userData?.id && (
      <UserCard name={user.name} avatarUrl={user.avatarUrl} time="2 hour ago" type={"user"} />

            )}
            </div>
            )

            )}
            </>

        )}
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>

  </>
)}
  </ul>
</div>
    </aside>
    </>
  );
};

export default Users;
