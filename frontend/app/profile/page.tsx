"use client"

import { useState } from "react"

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "ALexis Ozumba",
    age: "18",
    email: "odera.ozumba@pau.edu.ng",
    phone: "080999999",
    address: "Pan atlantic university ibeju lekki",
  })

  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  function startEdit(field: string, value: string) {
    setEditingField(field)
    setEditValue(value)
  }

  function saveEdit(field: string) {
    setUser({ ...user, [field]: editValue })
    setEditingField(null)
  }

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: "12px", padding: "2rem" }}>
        
        {/* Profile Picture */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", border: "1px solid #e5e5e5", fontSize: "32px" }}>
            👤
          </div>
          <button style={{ padding: "6px 16px", fontSize: "13px", border: "1px solid #d5d5d5", background: "white", borderRadius: "6px", cursor: "pointer" }}>
            Upload photo
          </button>
        </div>

        {/* Fields */}
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: "1.5rem" }}>
          
          {/* Name */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>FULL NAME</label>
              <button onClick={() => startEdit("name", user.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: "0" }}>Edit</button>
            </div>
            {editingField === "name" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #d5d5d5", borderRadius: "6px" }} />
                <button onClick={() => saveEdit("name")} style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
              </div>
            ) : (
              <p style={{ fontSize: "16px", color: "#333", margin: "0" }}>{user.name}</p>
            )}
          </div>

          {/* Age */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>AGE</label>
              <button onClick={() => startEdit("age", user.age)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: "0" }}>Edit</button>
            </div>
            {editingField === "age" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #d5d5d5", borderRadius: "6px" }} />
                <button onClick={() => saveEdit("age")} style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
              </div>
            ) : (
              <p style={{ fontSize: "16px", color: "#333", margin: "0" }}>{user.age}</p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>EMAIL</label>
              <button onClick={() => startEdit("email", user.email)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: "0" }}>Edit</button>
            </div>
            {editingField === "email" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #d5d5d5", borderRadius: "6px" }} />
                <button onClick={() => saveEdit("email")} style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
              </div>
            ) : (
              <p style={{ fontSize: "16px", color: "#333", margin: "0" }}>{user.email}</p>
            )}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>PHONE</label>
              <button onClick={() => startEdit("phone", user.phone)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: "0" }}>Edit</button>
            </div>
            {editingField === "phone" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #d5d5d5", borderRadius: "6px" }} />
                <button onClick={() => saveEdit("phone")} style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
              </div>
            ) : (
              <p style={{ fontSize: "16px", color: "#333", margin: "0" }}>{user.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "12px", color: "#888", fontWeight: "500" }}>ADDRESS</label>
              <button onClick={() => startEdit("address", user.address)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "13px", padding: "0" }}>Edit</button>
            </div>
            {editingField === "address" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #d5d5d5", borderRadius: "6px" }} />
                <button onClick={() => saveEdit("address")} style={{ padding: "8px 16px", background: "#333", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Save</button>
              </div>
            ) : (
              <p style={{ fontSize: "16px", color: "#333", margin: "0" }}>{user.address}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}