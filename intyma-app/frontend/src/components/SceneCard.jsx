import React from "react";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";

export default function SceneCard({ scene }) {
    // Construction URL miniature (adapte selon la structure de ta BDD)
    const miniatureUrl = scene.image
        ? `http://127.0.0.1:5000/miniatures/${encodeURIComponent(scene.image.split('/').slice(-2, -1)[0])}/${encodeURIComponent(scene.image.split('/').pop())}`
        : "https://via.placeholder.com/120x80?text=No+Image";

    return (
        <Card sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
            background: "#292929",
            color: "#fff"
        }}>
            <Box sx={{ minWidth: 120, minHeight: 80, maxHeight: 120, overflow: "hidden" }}>
                <img
                    src={miniatureUrl}
                    alt={scene.titre}
                    style={{
                        width: 120,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "2px solid #333"
                    }}
                />
            </Box>
            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">{scene.titre}</Typography>
                <Typography variant="body2" sx={{ color: "#aaa" }}>
                    {scene.chemin}
                </Typography>
                {scene.note_perso && (
                    <Typography variant="body2" sx={{ color: "#cfcfcf", mb: 1 }}>
                        {scene.note_perso}
                    </Typography>
                )}
                {/* Affichage tags si tu as le champ tags */}
                {scene.tags && Array.isArray(scene.tags) && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {scene.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" sx={{ background: "#424242", color: "#fff" }} />
                        ))}
                    </Box>
                )}
                <Typography variant="caption" sx={{ color: "#ccc" }}>
                    {scene.qualite} • {scene.duree} min
                </Typography>
            </CardContent>
        </Card>
    );
}
