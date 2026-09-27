import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BlockedUserCard from "./components/BlockedUserCard";
import { showToast } from "@/pages/course/components/ShowToast";
import {
  getBlockedUsers,
  postBlockedUser,
  deleteBlockedUser,
  MemberAlreadyBlockedError,
} from "@/api/block";
import BaseLoading from "@/components/BaseLoading";

interface BlockedUserItem {
  id: number;
  name: string;
  imageUrl: string | null;
  isBlocked: boolean;
}

export default function BlockedUserListPage() {
  const [users, setUsers] = useState<BlockedUserItem[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setIsUsersLoading(true);
        const data = await getBlockedUsers();
        if (ignore) return;

        // 이 목록에 있는 사용자는 전부 현재 차단 중인 상태
        setUsers(
          data.map((member) => ({
            id: member.memberId,
            name: member.nickname,
            imageUrl: member.profileImageUrl,
            isBlocked: true,
          })),
        );
      } catch (e) {
        if (ignore) return;
        console.error(e);
        setUsersError("차단한 사용자 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsUsersLoading(false);
      }
    };
    fetchUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const handleBlock = async (targetId: number) => {
    const target = users.find((user) => user.id === targetId);
    if (!target) return;

    const nextIsBlocked = !target.isBlocked;

    try {
      if (nextIsBlocked) {
        await postBlockedUser(targetId);
      } else {
        await deleteBlockedUser(targetId);
      }

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
    } catch (e) {
      console.error(e);

      if (e instanceof MemberAlreadyBlockedError) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === targetId ? { ...user, isBlocked: true } : user,
          ),
        );
        showToast({
          message: "이미 차단한 사용자예요.",
          position: "bottom-center",
        });
        return;
      }

      showToast({
        message: nextIsBlocked
          ? "차단에 실패했어요."
          : "차단 해제에 실패했어요.",
        position: "bottom-center",
      });
    }
  };

  if (isUsersLoading) return <BaseLoading />;
  if (usersError) return <p>{usersError}</p>;

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
