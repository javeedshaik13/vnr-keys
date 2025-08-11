// routes/about.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    project: {
      title: "VNR-Keys",
      description:
        "A smart key management system designed to streamline key allocation, tracking, and return processes for improved security and efficiency.",
    },
    team: [
      {
        name: "Karthik",
        role: "Full Stack Developer",
        avatar: "/karthik.png",
        socials: { github: "#", linkedin: "#", twitter: "#" },
      },
      {
        name: "Vishnu",
        role: "Frontend Developer",
        avatar: "/images/vishnu.jpg",
        socials: { github: "#", linkedin: "#", twitter: "#" },
      },
      {
        name: "Bhavishwa",
        role: "Backend Developer",
        avatar: "/images/bhavishwa.jpg",
        socials: { github: "#", linkedin: "#", twitter: "#" },
      },
      {
        name: "Shiva",
        role: "Designer & Frontend Developer",
        avatar: "/images/shiva.jpg",
        socials: { github: "#", linkedin: "#", twitter: "#" },
      },
    ],
  });
});

export default router;