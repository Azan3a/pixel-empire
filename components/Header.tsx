import { UserAvatar } from "./user-avatar";

export default function Header() {
  return (
    <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
      Pixel Empire
      <div className="ml-auto">
        <UserAvatar />
      </div>
    </header>
  );
}
