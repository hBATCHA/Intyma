import React, { useEffect, useState } from "react";
import axios from "axios";
import SceneCard from "./components/SceneCard";
import { Container, Typography } from "@mui/material";

function App() {
    const [scenes, setScenes] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/scenes")
            .then((res) => setScenes(res.data))
            .catch((err) => console.error("Erreur API :", err));
    }, []);

    return (
        <Container maxWidth="md" sx={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
            <Typography variant="h3" gutterBottom sx={{ color: "#fff" }}>
                🎬 Intyma — Ma vidéothèque privée
            </Typography>
            {scenes.map(scene => (
                <SceneCard key={scene.id} scene={scene} />
            ))}
        </Container>
    );
}

export default App;
