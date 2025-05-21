import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [scenes, setScenes] = useState([]);

    useEffect(() => {
        // Mets ici l’URL de ton backend Flask
        axios.get("http://127.0.0.1:5000/api/scenes")
            .then((res) => setScenes(res.data))
            .catch((err) => console.error("Erreur API :", err));
    }, []);

    return (
        <div style={{padding: "2rem", fontFamily: "Arial, sans-serif", background: "#222", color: "#fff", minHeight: "100vh"}}>
            <h1>🎬 Intyma – Ma vidéothèque privée</h1>
            <ul>
                {scenes.map(scene => (
                    <li key={scene.id}>
                        <strong>{scene.titre}</strong> <span style={{color:"#aaa"}}>({scene.chemin})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
