import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import "../../styles/layout.scss";

export default function Layout() {
  return (
    <div className="app-layout">
      <Topbar />
      <div className="body">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}