import { Outlet } from "react-router";

const UserLayout = () => {
  return (
    <div className="container max-w-3xl mx-auto pt-8 pb-20 md:pt-16 md:pb-32 px-4">
      <Outlet />
    </div>
  );
};

export default UserLayout;
