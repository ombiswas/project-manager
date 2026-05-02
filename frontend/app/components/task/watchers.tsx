import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Watchers = ({ watchers }: { watchers: User[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
        Watchers
      </h3>

      <div className="space-y-3">
        {watchers && watchers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {watchers.map((watcher) => (
              <div key={watcher._id} className="flex items-center gap-3">
                <Avatar className="size-8 border shadow-sm">
                  <AvatarImage src={watcher.profilePicture} />
                  <AvatarFallback className="text-[10px] bg-muted">{watcher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{watcher.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic px-2">No watchers yet</p>
        )}
      </div>
    </div>
  );
};
