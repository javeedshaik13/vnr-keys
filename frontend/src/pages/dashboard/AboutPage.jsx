import { motion } from "framer-motion";
import { Code, Users, Target, Award, Github, Linkedin, Twitter } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

const AboutPage = () => {
  const { sidebarOpen } = useSidebar();
  return (
    <div className={`space-y-8 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4">
          About Our Project
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          We're a passionate team of developers, designers, and innovators dedicated to creating 
          exceptional hackathon experiences through cutting-edge technology and collaborative tools.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutPage;
