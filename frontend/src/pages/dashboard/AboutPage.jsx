import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useSidebar } from "../../components/layout/DashboardLayout";

const AboutPage = () => {
  const { sidebarOpen } = useSidebar();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        if (response.status === 404) throw new Error("About data not found");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Server error (${response.status})`);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [API_URL, ENV]);

  if (isLoading)
    return (
      <div className="p-4 text-center text-blue-300">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
        Loading project details...
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-center text-red-400">
        Error loading data: {error}
      </div>
    );

  if (!data) return null;

  return (
    <div
      className={`space-y-8 ${sidebarOpen ? "p-4 lg:p-6" : "p-4 lg:p-8 xl:px-12"}`}
      style={{
        background: "linear-gradient(to bottom right, #0a0f1c, #0f172a)",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">
          {data.project.title}
        </h1>
        <p className="text-blue-200 text-lg max-w-3xl mx-auto">
          {data.project.description}
        </p>
      </motion.div>

      {/* Team Section */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Meet the Team
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative bg-[#0d1628] border border-blue-400 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all p-6 text-center"
            >
              {/* Avatar with subtle blue ring */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                />
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-blue-200">{member.role}</p>

              {/* Socials */}
              <div className="flex justify-center gap-4 mt-4">
                {member.socials.github && (
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Github className="w-6 h-6 text-blue-200 hover:text-white transition-colors" />
                  </a>
                )}
                {member.socials.linkedin && (
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin className="w-6 h-6 text-blue-200 hover:text-white transition-colors" />
                  </a>
                )}
                {member.socials.twitter && (
                  <a
                    href={member.socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Twitter className="w-6 h-6 text-blue-200 hover:text-white transition-colors" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {/* Extra Card - Srikar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: data.team.length * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="relative bg-[#0d1628] border border-blue-400 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all p-6 text-center"
          >
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src="https://ui-avatars.com/api/?name=Srikar&background=0D1628&color=3B82F6"
                alt="Srikar"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
              />
            </div>

            {/* Info */}
            <h3 className="text-lg font-bold text-white">Srikar</h3>
            <p className="text-blue-200">UI/UX & Frontend Developer</p>

            {/* Socials (optional placeholders) */}
            <div className="flex justify-center gap-4 mt-4">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="w-6 h-6 text-blue-200 hover:text-white transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <Linkedin className="w-6 h-6 text-blue-200 hover:text-white transition-colors" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
