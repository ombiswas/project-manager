import type { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Watchers = ({ watchers }: { watchers: User[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="caption-mono text-mute border-b border-hairline pb-2">
        Watchers
      </h3>

      <div className="space-y-3">
        {watchers && watchers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {watchers.map((watcher) => (
              <div key={watcher._id} className="flex items-center gap-2.5">
                <Avatar className="size-7 border border-hairline">
                  <AvatarImage src={watcher.profilePicture} />
                  <AvatarFallback className="text-[10px] bg-canvas-soft text-body font-mono">{watcher.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-normal text-body">{watcher.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-mute font-mono italic px-1">No watchers yet</p>
        )}
      </div>
    </div>
  );
};
