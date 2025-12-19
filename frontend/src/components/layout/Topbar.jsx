import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/topbar.scss";
import { User } from "lucide-react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__right" ref={dropdownRef}>
        
        <div
          className="avatar"
          onClick={() => setOpen((prev) => !prev)}
        >
          <User size={18} />
        </div>

        {open && (
          <div className="dropdown">
            <div className="dropdown__header">My Account</div>

            <div
              className="dropdown__item"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </div>

            <div className="dropdown__divider" />

            <div
              className="dropdown__item logout"
              onClick={() => {
                navigate("/login");
              }}
            >
              Log out
            </div>
          </div>
        )}
      </div>
    </header>
  );
}