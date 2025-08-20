import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const DepartmentCard = ({ department, keyCount, onClick, isSelected = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 
        cursor-pointer transition-all duration-200 hover:bg-white/15
        ${isSelected ? 'ring-2 ring-green-500 bg-white/20' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <Building2 className="w-6 h-6 text-green-400" />
        <span className="text-sm font-medium text-gray-300 bg-white/10 px-2 py-1 rounded-full">
          {keyCount} keys
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">
        {department}
      </h3>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">
          Department
        </span>
        {/* <div className="w-2 h-2 bg-green-400 rounded-full"></div> */}
      </div>
    </motion.div>
  );
};

export default DepartmentCard;
