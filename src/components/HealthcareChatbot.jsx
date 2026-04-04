import React, { useState, useRef } from "react";

export default function HealthcareChatbot() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };

    setMessages(prev => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/chat",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: input
          })
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: data.reply }
      ]);

    } catch (error) {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Server error occurred." }
      ]);
    }

    setInput("");
    setLoading(false);
  };


  const uploadImage = async () => {

    const file = fileRef.current.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    setLoading(true);

    try {

      const response = await fetch(
        "http://127.0.0.1:5000/upload_medicine_image",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: data.reply }
      ]);

    } catch {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Image upload failed." }
      ]);
    }

    setLoading(false);
  };


  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Healthcare AI Assistant 🩺</h2>

      <div style={styles.chatbox}>

        {messages.map((msg, index) => (

          <div
            key={index}
            style={
              msg.sender === "user"
                ? styles.userBubble
                : styles.botBubble
            }
          >
            {msg.text}
          </div>

        ))}

        {loading && (
          <div style={styles.botBubble}>
            Thinking...
          </div>
        )}

      </div>

      <div style={styles.inputRow}>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter symptoms or medicine name..."
          style={styles.input}
        />

        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>

      </div>

      <div style={styles.uploadRow}>

        <input type="file" ref={fileRef} />

        <button onClick={uploadImage} style={styles.button}>
          Upload Medicine Image
        </button>

      </div>

    </div>
  );
}


const styles = {

  container: {
    width: "600px",
    margin: "40px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 0px 12px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center"
  },

  chatbox: {
    height: "400px",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  userBubble: {
    alignSelf: "flex-end",
    background: "#007bff",
    color: "white",
    padding: "10px 14px",
    borderRadius: "14px"
  },

  botBubble: {
    alignSelf: "flex-start",
    background: "#f1f1f1",
    padding: "10px 14px",
    borderRadius: "14px"
  },

  inputRow: {
    display: "flex",
    gap: "10px"
  },

  uploadRow: {
    marginTop: "10px"
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  button: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};