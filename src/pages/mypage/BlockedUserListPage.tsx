import { useState } from "react";
import Header from "@/components/Header";
import BlockedUserCard from "./components/BlockedUserCard";
import { showToast } from "@/pages/course/components/ShowToast";

// 목데이터
const INITIAL_BLOCKED_USERS = [
  {
    id: 1,
    name: "해원이",
    imageUrl:
      "https://i.pinimg.com/1200x/65/26/b6/6526b628edd770de7e6b71e9f9d7ed85.jpg",
    isBlocked: true,
  },
  {
    id: 2,
    name: "은진이",
    imageUrl:
      "https://i.pinimg.com/1200x/ca/c5/6f/cac56f3092c909833654d89f10c742ab.jpg",
    isBlocked: true,
  },
];

export default function BlockedUserListPage() {
  const [users, setUsers] = useState(INITIAL_BLOCKED_USERS);

  const handleBlock = (targetId: number) => {
    const target = users.find((user) => user.id === targetId);
    if (!target) return;

    const nextIsBlocked = !target.isBlocked;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === targetId ? { ...user, isBlocked: nextIsBlocked } : user,
      ),
    );

    showToast({
      message: nextIsBlocked
        ? `${target.name} 님을 차단했어요.`
        : `${target.name} 님이 차단해제 되었어요.`,
      position: "bottom-center",
    });
  };

  return (
    <main className="flex flex-col h-dvh  bg-gray-10 pt-[calc(var(--safe-top)+12px)] pb-[var(--bottom-nav-offset)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2.5">
      <Header showBack title="차단한 사용자" />

      <div className="flex flex-col items-center gap-2.5">
        {users.map((user) => (
          <BlockedUserCard
            key={user.id}
            name={user.name}
            imageUrl={user.imageUrl}
            isBlocked={user.isBlocked}
            onToggle={() => handleBlock(user.id)}
          />
        ))}
      </div>
    </main>
  );
}
