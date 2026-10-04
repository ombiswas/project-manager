export const WorkspaceAvatar = ({
  color,
  name,
}: {
  color: string;
  name: string;
}) => {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-white/20"
      style={{
        backgroundColor: color,
      }}
    >
      <span className="text-[10px] font-mono font-normal text-white">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};
