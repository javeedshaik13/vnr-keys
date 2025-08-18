import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

/**
 * @typedef {Object} TeamMember
 * @property {string} name
 * @property {string} role
 * @property {string} avatar
 * @property {{ github?: string, linkedin?: string, twitter?: string }} socials
 */

/**
 * @typedef {Object} AboutData
 * @property {{ title: string, description: string }} project
 * @property {TeamMember[]} team
 */

const AboutPage = () => {
  const { sidebarOpen } = useSidebar();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ API URL definition inside this file
  const ENV = import.meta.env.VITE_ENVIRONMENT;
  const API_URLS = {
    local: import.meta.env.VITE_API_URL_LOCAL,
    dev: import.meta.env.VITE_API_URL_DEV,
    pro: import.meta.env.VITE_API_URL_PRO,
  };
  const API_URL = API_URLS[ENV] || API_URLS.local;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/about`);

        console.log("Environment:", ENV);
        console.log("API URL Used:", `${API_URL}/about`);
        console.log("Response status:", response.status);

        if (response.status === 404) {
          throw new Error(
            "About page data not found. Please check if the API endpoint is correct."
          );
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Server error (${response.status}). Please try again later.`
          );
        }

        const jsonData = await response.json();
        console.log("Received data:", jsonData);
        setData(jsonData);
      } catch (err) {
        console.error("Error details:", {
          message: err.message,
          url: `${API_URL}/about`,
        });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL, ENV]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2"></div>
        Loading project details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        Error loading data: {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div
      className={`space-y-8 ${
        sidebarOpen ? "p-4 lg:p-6" : "p-4 lg:p-8 xl:px-12"
      }`}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-4">
          {data.project.title}
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          {data.project.description}
        </p>
      </motion.div>

      {/* Team Section */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Meet the Team
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 p-6 rounded-2xl shadow-md text-center hover:shadow-lg hover:bg-gray-700 transition-all"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-green-500 object-cover"
              />
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-gray-400">{member.role}</p>
              <div className="flex justify-center gap-3 mt-3">
                {member.socials.github && (
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                )}
                {member.socials.linkedin && (
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                )}
                {member.socials.twitter && (
                  <a
                    href={member.socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
