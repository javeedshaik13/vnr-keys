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
        socials: { github: "https://github.com/gurramkarthiknetha", linkedin: "https://www.linkedin.com/in/gurramkarthiknetha/"},
      },
      {
        name: "Vishnu",
        role: "Frontend Developer",
        avatar: "/images/vishnu.jpg",
        socials: { github: "#", linkedin: "#"},
      },
      {
        name: "Bhavishwa",
        role: "Backend Developer",
        avatar: "bhavishwa.jpg",
        socials: { github: "https://github.com/BhavishwaReddy2023", linkedin: "https://www.linkedin.com/in/bhavishwa-reddy-puli-6946482b8/"},
      },
      {
        name: "Shiva",
        role: "Designer & Frontend Developer",
        avatar: "/images/shiva.jpg",
        socials: { github: "https://github.com/codebyshivareddiee", linkedin: "https://www.linkedin.com/in/shivareddykottamittapally/"},
      },
      {
        name: "Rishith",
        role: "Full Stack Developer",
        avatar: "/images/rishith.jpg",
        socials: { github: "#", linkedin: "#"},
      },
    ],
  });
});

export default router;