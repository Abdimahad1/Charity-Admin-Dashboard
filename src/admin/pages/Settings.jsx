import React, { useState, useRef } from "react";
import "../../styles/Settings.css";

/* -------- Inline icons (no external libs) -------- */
const I = ({ children }) => <span className="st-ib">{children}</span>;
const IconUser = () => (<svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm-7 8a7 7 0 0114 0v2H5v-2z"/></svg>);
const IconBell = () => (<svg viewBox="0 0 24 24"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm8-6l-2-2V9a6 6 0 10-12 0v5l-2 2v2h16v-2z"/></svg>);
const IconKey = () => (<svg viewBox="0 0 24 24"><path d="M14 3a5 5 0 100 10 5 5 0 000-10zM2 21v-4l8.44-8.44a7 7 0 102 2L10 13H8v2H6v2H2z"/></svg>);
const IconSave = () => (<svg viewBox="0 0 24 24"><path d="M5 3h14l2 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V5l2-2zm2 2v4h10V5H7zm0 14h10v-6H7v6z"/></svg>);
const IconMoney = () => (<svg viewBox="0 0 24 24"><path d="M2 7h20v10H2V7zm3 2a3 3 0 01-3 3 3 3 0 013 3h14a3 3 0 013-3 3 3 0 01-3-3H5zm7 1a3 3 0 103 3 3 3 0 00-3-3z"/></svg>);
const IconHeart = () => (<svg viewBox="0 0 24 24"><path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z"/></svg>);
const IconVolunteer = () => (<svg viewBox="0 0 24 24"><path d="M1 21h22l-2-7H3l-2 7zm16-9a3 3 0 003-3V4h-2v5a1 1 0 01-2 0V4h-2v5a1 1 0 01-2 0V4H8v5a3 3 0 003 3h10z"/></svg>);
const IconMail = () => (<svg viewBox="0 0 24 24"><path d="M2 5h20v14H2zM4 7l8 6 8-6"/></svg>);
const IconMsg = () => (<svg viewBox="0 0 24 24"><path d="M3 4h18v12H6l-3 3V4z"/></svg>);

export default function Settings() {
  const [tab, setTab] = useState("account"); // account | notifications

  // ----- Account form state -----
  const [fullName, setFullName] = useState("Admin User");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState("");

  function saveAccount(e) {
    e.preventDefault();
    setAccountMsg("");
    if (newPwd && newPwd !== confirmPwd) {
      setAccountMsg("New password and confirm do not match.");
      return;
    }
    setSavingAccount(true);
    setTimeout(() => {
      setSavingAccount(false);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setAccountMsg("Account settings saved.");
    }, 900);
  }

  // ----- Notification settings -----
  const [notif, setNotif] = useState({
    emailEnabled: true,
    inappEnabled: true,
    volunteerRegistered: true,
    transactionSent: true,
    charityPublished: true,
    donationReceived: true,
    contactMessage: true,
  });
  const [savingNotif, setSavingNotif] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  function toggle(key) {
    setNotif((n) => ({ ...n, [key]: !n[key] }));
  }
  function saveNotif() {
    setNotifMsg("");
    setSavingNotif(true);
    setTimeout(() => {
      setSavingNotif(false);
      setNotifMsg("Notification preferences updated.");
    }, 700);
  }

  // Mock recent feed
  const recent = [
    { id: "n1", icon: <IconVolunteer />, text: "New volunteer application from Ayaan Ali", time: "2m ago" },
    { id: "n2", icon: <IconMoney />, text: "Donation received — $50 via EVC", time: "18m ago" },
    { id: "n3", icon: <IconHeart />, text: "Charity “Village Borehole” published", time: "Yesterday" },
    { id: "n4", icon: <IconMsg />, text: "New contact message from Abdullahi", time: "2d ago" },
  ];

  return (
    <div className="st-page">
      {/* Header */}
      <div className="st-header">
        <div>
          <h2 className="st-title">Settings</h2>
          <p className="st-sub">Manage your account and notification preferences.</p>
        </div>
      </div>

      {/* Two clickable sections */}
      <div className="st-tiles">
        <button
          className={`st-tile ${tab === "account" ? "active" : ""}`}
          onClick={() => setTab("account")}
        >
          <I><IconUser /></I>
          <div className="st-tile__meta">
            <div className="st-tile__title">User Account</div>
            <div className="st-tile__sub">Name & password</div>
          </div>
        </button>

        <button
          className={`st-tile ${tab === "notifications" ? "active" : ""}`}
          onClick={() => setTab("notifications")}
        >
          <I><IconBell /></I>
          <div className="st-tile__meta">
            <div className="st-tile__title">Notifications</div>
            <div className="st-tile__sub">Emails & in-app alerts</div>
          </div>
        </button>
      </div>

      {/* Content */}
      {tab === "account" && (
        <form className="st-card st-form" onSubmit={saveAccount}>
          <h3 className="st-card__title"><I><IconUser /></I> User Account</h3>

          <div className="st-grid-2">
            <div className="st-field">
              <label>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="st-grid-3">
            <div className="st-field">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="st-field">
              <label>New Password</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="New secure password"
                autoComplete="new-password"
              />
            </div>
            <div className="st-field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          {accountMsg && (
            <div className={`st-alert ${accountMsg.includes("saved") ? "ok" : "warn"}`}>
              {accountMsg}
            </div>
          )}

          <div className="st-actions">
            <button className="st-btn st-btn--primary" type="submit" disabled={savingAccount}>
              <I><IconSave /></I> {savingAccount ? "Saving…" : "Save Account Changes"}
            </button>
          </div>
        </form>
      )}

      {tab === "notifications" && (
        <div className="st-grid">
          {/* Preferences */}
          <section className="st-card st-prefs">
            <h3 className="st-card__title"><I><IconBell /></I> Notification Preferences</h3>

            <hr className="st-sep" />

            <div className="st-prefs__group">
              <div className="st-pref">
                <div className="st-pref__icon"><IconVolunteer /></div>
                <div className="st-pref__meta">
                  <strong>New Volunteer Registered</strong>
                  <span className="st-muted">Notify when a volunteer submits an application</span>
                </div>
                <label className="st-switch">
                  <input
                    type="checkbox"
                    checked={notif.volunteerRegistered}
                    onChange={() => toggle("volunteerRegistered")}
                  />
                  <span />
                </label>
              </div>

              <div className="st-pref">
                <div className="st-pref__icon"><IconMoney /></div>
                <div className="st-pref__meta">
                  <strong>Transaction Sent</strong>
                  <span className="st-muted">Payment initiated/confirmed</span>
                </div>
                <label className="st-switch">
                  <input
                    type="checkbox"
                    checked={notif.transactionSent}
                    onChange={() => toggle("transactionSent")}
                  />
                  <span />
                </label>
              </div>

              <div className="st-pref">
                <div className="st-pref__icon"><IconHeart /></div>
                <div className="st-pref__meta">
                  <strong>New Charity Published</strong>
                  <span className="st-muted">A charity project goes live</span>
                </div>
                <label className="st-switch">
                  <input
                    type="checkbox"
                    checked={notif.charityPublished}
                    onChange={() => toggle("charityPublished")}
                  />
                  <span />
                </label>
              </div>

              <div className="st-pref">
                <div className="st-pref__icon"><IconMoney /></div>
                <div className="st-pref__meta">
                  <strong>Donation Received</strong>
                  <span className="st-muted">Successful donor payment</span>
                </div>
                <label className="st-switch">
                  <input
                    type="checkbox"
                    checked={notif.donationReceived}
                    onChange={() => toggle("donationReceived")}
                  />
                  <span />
                </label>
              </div>

              <div className="st-pref">
                <div className="st-pref__icon"><IconMail /></div>
                <div className="st-pref__meta">
                  <strong>Contact Message</strong>
                  <span className="st-muted">New message from the public site</span>
                </div>
                <label className="st-switch">
                  <input
                    type="checkbox"
                    checked={notif.contactMessage}
                    onChange={() => toggle("contactMessage")}
                  />
                  <span />
                </label>
              </div>
            </div>

            {notifMsg && <div className="st-alert ok">{notifMsg}</div>}

            <div className="st-actions">
              <button className="st-btn st-btn--primary" onClick={saveNotif} disabled={savingNotif}>
                <I><IconSave /></I> {savingNotif ? "Saving…" : "Save Notification Settings"}
              </button>
            </div>
          </section>

          {/* Recent activity feed */}
          <aside className="st-card st-feedcard">
            <h3 className="st-card__title"><I><IconBell /></I> Recent Activity</h3>
            <ul className="st-feed">
              {recent.map((n) => (
                <li key={n.id} className="st-feed__item">
                  <div className="st-feed__icon">{n.icon}</div>
                  <div className="st-feed__text">
                    <div className="st-feed__line">{n.text}</div>
                    <div className="st-feed__time">{n.time}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="st-muted st-feed__hint">This is sample data; connect your backend to populate in real-time.</div>
          </aside>
        </div>
      )}
    </div>
  );
}
