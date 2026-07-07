import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import "../../styles/topbar.scss";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar__right" ref={dropdownRef}>
        <div className="avatar" onClick={() => setOpen((p) => !p)}>
          {initials}
        </div>

        {open && (
          <div className="dropdown">
            <div className="dropdown__header">
              <div className="dropdown__name">{user?.name || "Account"}</div>
              <div className="dropdown__email">{user?.email}</div>
            </div>

            <button
              className="dropdown__item"
              onClick={() => { setOpen(false); navigate("/dashboard"); }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>

            <div className="dropdown__divider" />

            <button
              className="dropdown__item logout"
              onClick={() => { dispatch(logout()); navigate("/", { replace: true }); }}
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
